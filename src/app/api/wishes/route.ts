import { createHash } from "node:crypto";
import { connection, type NextRequest } from "next/server";
import { getSupabaseAdmin, wishesRequireApproval } from "@/lib/supabase-server";
import { validateWish, type PublicWish } from "@/lib/wishes";

const PUBLIC_COLUMNS = "id,name,relationship,message,memory,created_at";

/** Abuse limits. Generous for real people, tight for scripts. */
const RATE = {
  perTenMinutes: 3,
  perDay: 10,
  /** Hard ceiling on total wishes, so a determined spammer can't fill the database. */
  maxTotal: 2000,
  /** Real people take a few seconds to write something. */
  minFillMs: 3000,
  maxBodyBytes: 8_000,
};

const noStore = { "Cache-Control": "no-store" };

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: noStore });
}

// ── Fast first line of defence: per-instance memory. The database check below
//    is the real limit, because serverless instances don't share memory. ─────
const recent = new Map<string, number[]>();
function memoryLimited(key: string) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
  if (hits.length >= RATE.perTenMinutes) return true;
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear();
  return false;
}

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function hashIp(ip: string) {
  // Store only a salted hash, never the raw IP address.
  const salt = process.env.WISHES_IP_SALT || "her-garden";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function GET() {
  // Always read fresh at request time, never from a build-time snapshot.
  await connection();
  const db = getSupabaseAdmin();
  if (!db) return json({ configured: false, wishes: [] });

  const { data, error } = await db
    .from("wishes")
    .select(PUBLIC_COLUMNS)
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("[wishes] read failed:", error.message);
    return json({ configured: true, error: "Could not load wishes right now." }, 500);
  }
  return json({ configured: true, wishes: (data ?? []) as PublicWish[] });
}

export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin();
  if (!db) {
    return json(
      { error: "Wishes aren't connected to a database yet, so nothing was saved.", code: "not_configured" },
      503,
    );
  }

  // Only accept posts from this site's own pages.
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {}
    if (originHost !== host) return json({ error: "This request isn't allowed." }, 403);
  }

  const raw = await req.text();
  if (raw.length > RATE.maxBodyBytes) return json({ error: "That message is too long." }, 413);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
    if (!body || typeof body !== "object") throw new Error("not an object");
  } catch {
    return json({ error: "Something went wrong. Please try again." }, 400);
  }

  // Honeypot: a hidden field real people never see or fill in.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ error: "Something went wrong. Please try again." }, 400);
  }

  // Bots submit instantly; people take a moment to write.
  const elapsed = Number(body.elapsedMs);
  if (!Number.isFinite(elapsed) || elapsed < RATE.minFillMs) {
    return json({ error: "That was very fast! Please take a moment and try again." }, 400);
  }

  const result = validateWish(body);
  if (!result.ok) return json({ error: "Please check the highlighted fields.", fields: result.errors }, 422);

  const ipHash = hashIp(clientIp(req));
  if (memoryLimited(ipHash)) {
    return json({ error: "You've planted a few wishes already — please wait a little while before adding another." }, 429);
  }

  const since = (ms: number) => new Date(Date.now() - ms).toISOString();
  const [tenMin, day, total] = await Promise.all([
    db.from("wishes").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since(10 * 60_000)),
    db.from("wishes").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since(24 * 60 * 60_000)),
    db.from("wishes").select("id", { count: "exact", head: true }),
  ]);

  if (tenMin.error || day.error || total.error) {
    console.error("[wishes] rate check failed:", tenMin.error?.message ?? day.error?.message ?? total.error?.message);
    return json({ error: "Could not save your wish right now. Please try again soon." }, 500);
  }
  if ((tenMin.count ?? 0) >= RATE.perTenMinutes || (day.count ?? 0) >= RATE.perDay) {
    return json({ error: "You've planted a few wishes already — please wait a little while before adding another." }, 429);
  }
  if ((total.count ?? 0) >= RATE.maxTotal) {
    return json({ error: "The garden is full of wishes! New ones can't be added right now." }, 429);
  }

  const approved = !wishesRequireApproval();
  const { value } = result;
  const { data, error } = await db
    .from("wishes")
    .insert({
      name: value.name,
      relationship: value.relationship || null,
      message: value.message,
      memory: value.memory || null,
      approved,
      ip_hash: ipHash,
    })
    .select(PUBLIC_COLUMNS)
    .single();

  if (error) {
    console.error("[wishes] insert failed:", error.message);
    return json({ error: "Could not save your wish right now. Please try again soon." }, 500);
  }

  return json({ wish: data as PublicWish, pending: !approved }, 201);
}
