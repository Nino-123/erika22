import type { Lang } from "@/content/letter";
import { LIMITS } from "@/lib/wish-limits";

/**
 * Every word in the Wishes chapter, in English and Indonesian.
 * Edit freely — the language toggle above the wishes switches between them.
 */
export const wishesCopy = {
  en: {
    eyebrow: "Chapter IV",
    title: "Birthday Wishes From Her Favorite People",
    intro:
      "Every wish left here is a little flower planted in her birthday garden — one for each person who loves her.",
    button: "Leave Her a Little Wish",
    buttonAgain: "Plant another wish",
    empty: "No wishes yet. Be the first to plant one.",
    count: (n: number) => `${n} ${n === 1 ? "wish" : "wishes"} planted so far`,
    loading: "Loading wishes",
    loadError: "The wishes are hiding right now.",
    retry: "Try again",
    plantedLive: "Your wish has been planted. Thank you 🌸",
    plantedPending: "Your wish has been planted — it will bloom here once it's been approved 🌸",
    unconfiguredTitle: "Wishes aren't connected yet.",
    unconfiguredBody:
      "This garden's wish database hasn't been set up, so new wishes can't be saved right now. (Site owner: see “Set up birthday wishes” in the README.)",
    language: "Language",
    dateLocale: "en",
    form: {
      title: (name: string) => `A little wish for ${name}`,
      subtitle: "Your words will be planted in her garden for her to read on her birthday.",
      close: "Close the wish form",
      optional: "optional",
      name: "Your name",
      namePlaceholder: "e.g. Aunt Maria",
      relationship: "How you know her",
      relationshipPlaceholder: "best friend, sister, colleague…",
      message: "Your birthday wish",
      messagePlaceholder: "Write her something warm…",
      memory: "A small memory with her",
      memoryPlaceholder: "That time we…",
      submit: "Plant this wish",
      submitting: "Planting your wish…",
      offline: "We couldn't reach the garden. Please check your connection and try again.",
    },
    errors: {
      nameMissing: "Please tell her who this is from.",
      nameLong: `Please keep your name under ${LIMITS.name} characters.`,
      relationshipLong: `Please keep this under ${LIMITS.relationship} characters.`,
      messageMissing: "Please write her a little message.",
      messageLong: `Please keep your message under ${LIMITS.message} characters.`,
      memoryLong: `Please keep this under ${LIMITS.memory} characters.`,
      links: "Links can't be included in wishes — just your words, please.",
      fields: "Please check the highlighted fields.",
      tooFast: "That was very fast! Please take a moment and try again.",
      rateLimited: "You've planted a few wishes already — please wait a little while before adding another.",
      generic: "Something went wrong. Please try again.",
    },
  },
  id: {
    eyebrow: "Bab IV",
    title: "Ucapan Ulang Tahun dari Orang-Orang Kesayangannya",
    intro:
      "Setiap ucapan yang ditinggalkan di sini adalah sekuntum bunga kecil yang ditanam di taman ulang tahunnya — satu untuk setiap orang yang menyayanginya.",
    button: "Tinggalkan Ucapan Kecil untuknya",
    buttonAgain: "Tanam ucapan lagi",
    empty: "Belum ada ucapan. Jadilah yang pertama menanamnya.",
    count: (n: number) => `${n} ucapan telah ditanam`,
    loading: "Memuat ucapan",
    loadError: "Ucapan-ucapannya sedang bersembunyi.",
    retry: "Coba lagi",
    plantedLive: "Ucapanmu sudah ditanam. Terima kasih 🌸",
    plantedPending: "Ucapanmu sudah ditanam — ia akan mekar di sini setelah disetujui 🌸",
    unconfiguredTitle: "Ucapan belum terhubung.",
    unconfiguredBody:
      "Database ucapan di taman ini belum diatur, jadi ucapan baru belum bisa disimpan. (Pemilik situs: lihat “Set up birthday wishes” di README.)",
    language: "Bahasa",
    dateLocale: "id",
    form: {
      title: (name: string) => `Ucapan kecil untuk ${name}`,
      subtitle: "Kata-katamu akan ditanam di tamannya, untuk ia baca di hari ulang tahunnya.",
      close: "Tutup formulir ucapan",
      optional: "opsional",
      name: "Namamu",
      namePlaceholder: "mis. Tante Maria",
      relationship: "Kamu mengenalnya sebagai",
      relationshipPlaceholder: "sahabat, saudara, rekan kerja…",
      message: "Ucapan ulang tahunmu",
      messagePlaceholder: "Tuliskan sesuatu yang hangat untuknya…",
      memory: "Sebuah kenangan kecil bersamanya",
      memoryPlaceholder: "Waktu itu kita…",
      submit: "Tanam ucapan ini",
      submitting: "Menanam ucapanmu…",
      offline: "Kami tidak bisa menjangkau taman. Periksa koneksimu dan coba lagi.",
    },
    errors: {
      nameMissing: "Tuliskan dulu siapa pengirimnya, ya.",
      nameLong: `Nama maksimal ${LIMITS.name} karakter, ya.`,
      relationshipLong: `Maksimal ${LIMITS.relationship} karakter, ya.`,
      messageMissing: "Tuliskan pesan kecil untuknya, ya.",
      messageLong: `Pesan maksimal ${LIMITS.message} karakter, ya.`,
      memoryLong: `Maksimal ${LIMITS.memory} karakter, ya.`,
      links: "Tautan tidak bisa dimasukkan — cukup kata-katamu saja, ya.",
      fields: "Periksa kembali kolom yang ditandai, ya.",
      tooFast: "Cepat sekali! Tunggu sebentar, lalu coba lagi.",
      rateLimited: "Kamu sudah menanam beberapa ucapan — tunggu sebentar sebelum menambah lagi, ya.",
      generic: "Ada yang salah. Silakan coba lagi.",
    },
  },
} satisfies Record<Lang, unknown>;

export type WishesCopy = (typeof wishesCopy)["en"];
export type WishError = keyof WishesCopy["errors"];
