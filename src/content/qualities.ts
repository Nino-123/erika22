import type { Lang } from "@/content/letter";
import type { BloomPalette, BloomSpecies } from "@/components/flowers/Bloom";

/**
 * "Little Things We Love About You" — a small garden where each flower holds
 * a note about one of Erika's qualities. Edit the words freely; the flowers
 * are drawn by the site's own Bloom illustrations.
 *
 * `look` picks the flower:
 *   - a single Bloom (species + palette), optionally leaning toward a light,
 *     wrapped in sparkles, or starting as a bud that opens when tapped
 *   - "cluster": three little wildflowers growing in different directions
 */

type Single = {
  kind: "single";
  species: BloomSpecies;
  palette: BloomPalette;
  /** degrees the head leans */
  tilt?: number;
  /** how open it is before being tapped (it opens fully when tapped) */
  open?: number;
  /** a soft light the flower leans toward */
  light?: boolean;
  /** a few tiny twinkling lights around it */
  sparkles?: boolean;
};
type Cluster = { kind: "cluster" };

export type Quality = {
  key: string;
  look: Single | Cluster;
  /** relative size in the arrangement (1 = normal) */
  scale: number;
  text: Record<Lang, { title: string; flower: string; message: string }>;
};

export const qualities: Quality[] = [
  {
    key: "dedication",
    look: { kind: "single", species: "rose", palette: "blush", open: 0.7 },
    scale: 1.1,
    text: {
      en: {
        title: "Your dedication",
        flower: "The Rose of Dedication",
        message:
          "For every effort you make, even the ones nobody sees. For the long days, the patience, and the determination you bring to the things that matter to you. We hope you remember how much your dedication is worth, even when the results take time.",
      },
      id: {
        title: "Kegigihanmu",
        flower: "Mawar Kegigihan",
        message:
          "Untuk setiap usaha yang kamu lakukan, bahkan yang tidak dilihat siapa pun. Untuk hari-hari yang panjang, kesabaran, dan tekad yang kamu bawa ke hal-hal yang berarti bagimu. Semoga kamu selalu ingat betapa berharganya kegigihanmu, meski hasilnya butuh waktu.",
      },
    },
  },
  {
    key: "initiative",
    look: { kind: "single", species: "anemone", palette: "peach", tilt: 16, light: true, open: 0.75 },
    scale: 0.95,
    text: {
      en: {
        title: "Your initiative",
        flower: "The Flower That Reaches for the Sun",
        message:
          "For the way you step forward, take initiative, and turn ideas into something real. May you never lose that courage to begin, to try, and to make things happen in your own way.",
      },
      id: {
        title: "Inisiatifmu",
        flower: "Bunga yang Meraih Matahari",
        message:
          "Untuk caramu melangkah lebih dulu, mengambil inisiatif, dan mengubah ide menjadi sesuatu yang nyata. Semoga kamu tidak pernah kehilangan keberanian untuk memulai, mencoba, dan mewujudkan sesuatu dengan caramu sendiri.",
      },
    },
  },
  {
    key: "kindness",
    look: { kind: "single", species: "anemone", palette: "cream", tilt: -6, open: 0.75 },
    scale: 0.9,
    text: {
      en: {
        title: "Your kindness",
        flower: "The Little Daisy",
        message:
          "For the little kindnesses that might seem ordinary to you but mean more than you know to someone else. May the gentleness you give to the world find its way back to you, too.",
      },
      id: {
        title: "Kebaikanmu",
        flower: "Si Aster Kecil",
        message:
          "Untuk kebaikan-kebaikan kecil yang mungkin terasa biasa bagimu, tapi berarti lebih dari yang kamu tahu bagi orang lain. Semoga kelembutan yang kamu berikan pada dunia juga kembali kepadamu.",
      },
    },
  },
  {
    key: "heart",
    look: { kind: "single", species: "peony", palette: "blush", sparkles: true, open: 0.7 },
    scale: 1.05,
    text: {
      en: {
        title: "Your pure heart",
        flower: "The Blush Peony",
        message:
          "For the sincerity in your heart, the goodness in your intentions, and the care you bring into the lives around you. May you always have room to be gentle without feeling that you must be strong every single day.",
      },
      id: {
        title: "Hatimu yang tulus",
        flower: "Peoni Merah Muda",
        message:
          "Untuk ketulusan hatimu, niat baikmu, dan kepedulian yang kamu bawa ke dalam hidup orang-orang di sekitarmu. Semoga kamu selalu punya ruang untuk bersikap lembut, tanpa merasa harus kuat setiap hari.",
      },
    },
  },
  {
    key: "creativity",
    look: { kind: "cluster" },
    scale: 0.95,
    text: {
      en: {
        title: "Your creativity",
        flower: "The Little Wildflowers",
        message:
          "For the ideas you imagine, the things you create, and the way you turn ordinary moments into something that feels like you. Never feel that your creativity has to look like anyone else's to be worth sharing.",
      },
      id: {
        title: "Kreativitasmu",
        flower: "Bunga-Bunga Liar Kecil",
        message:
          "Untuk ide-ide yang kamu bayangkan, hal-hal yang kamu ciptakan, dan caramu mengubah momen biasa menjadi sesuatu yang terasa seperti dirimu. Jangan pernah merasa kreativitasmu harus terlihat seperti milik orang lain agar layak dibagikan.",
      },
    },
  },
  {
    key: "becoming",
    look: { kind: "single", species: "rose", palette: "rose", tilt: 6, open: 0.25 },
    scale: 1,
    text: {
      en: {
        title: "Your becoming",
        flower: "The Flower Still Blooming",
        message:
          "For every dream still waiting for you, every new thing you want to try, and every version of yourself you have yet to meet. We hope your future brings you opportunities to grow, reasons to be proud, and the freedom to discover what happiness means to you.",
      },
      id: {
        title: "Dirimu yang terus bertumbuh",
        flower: "Bunga yang Masih Mekar",
        message:
          "Untuk setiap mimpi yang masih menunggumu, setiap hal baru yang ingin kamu coba, dan setiap versi dirimu yang belum kamu temui. Semoga masa depanmu membawa kesempatan untuk bertumbuh, alasan untuk bangga, dan kebebasan untuk menemukan arti bahagia bagimu.",
      },
    },
  },
];

export const qualitiesCopy: Record<
  Lang,
  { heading: string; intro: string; hint: string; close: string; prev: string; next: string; closingLine: string; closingSub: string; language: string }
> = {
  en: {
    heading: "Little things we love about you.",
    intro: "A small garden of notes. Tap any flower, in any order.",
    hint: "Tap a flower",
    close: "Close",
    prev: "Previous flower",
    next: "Next flower",
    closingLine: "Not because you're perfect, but because being you is already something beautiful.",
    closingSub: "And you never have to stop growing, dreaming, or becoming the person you want to be.",
    language: "Language",
  },
  id: {
    heading: "Hal-hal kecil yang kami sayangi darimu.",
    intro: "Sebuah taman kecil berisi pesan. Sentuh bunga mana saja, dengan urutan apa saja.",
    hint: "Sentuh sebuah bunga",
    close: "Tutup",
    prev: "Bunga sebelumnya",
    next: "Bunga berikutnya",
    closingLine: "Bukan karena kamu sempurna, tapi karena menjadi dirimu sendiri sudah merupakan sesuatu yang indah.",
    closingSub: "Dan kamu tidak perlu berhenti bertumbuh, bermimpi, atau menjadi pribadi yang kamu inginkan.",
    language: "Bahasa",
  },
};
