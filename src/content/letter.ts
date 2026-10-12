/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  💌  THE BIRTHDAY LETTER BOOK — English & Bahasa Indonesia
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Every word of the letter lives here, organised by language and page.
 *  Each page has a title and a list of paragraphs. Keep the same number of
 *  pages in both languages so switching language keeps her on the same page.
 */

export type Lang = "en" | "id";

export type LetterPage = {
  title: string;
  paragraphs: string[];
  /**
   * A short line from this page, shown on the back of the sheet (the
   * illustrated left-hand page you see after turning it).
   */
  quote: string;
};

export type LetterContent = {
  /** Shown on the language toggle. */
  langName: string;
  cover: { title: string; subtitle: string; open: string };
  /** The inside of the cover, opposite the first page. */
  dedication: { to: string; note: string; date: string };
  /** Small label above each page title, e.g. "Page I". */
  pageLabel: string;
  pages: LetterPage[];
  /** Revealed on the last page, after the final paragraph. */
  closing: string;
  ui: {
    prev: string;
    next: string;
    returnToGarden: string;
    readAgain: string;
    hint: string;
    language: string;
  };
};

export const letterBook: Record<Lang, LetterContent> = {
  en: {
    langName: "English",
    cover: {
      title: "A Little Letter for You",
      subtitle: "for Erika, on her twenty-second birthday",
      open: "Open the Letter",
    },
    dedication: { to: "for Erika", note: "a little garden of words, to keep", date: "October 14" },
    pageLabel: "Page",
    pages: [
      {
        title: "To the Birthday Girl",
        paragraphs: [
          "Happy birthday, Queen.",
          "Today is a celebration of you — of the person you are, the life you've lived, and all the beautiful things that are still waiting for you.",
          "I wanted to give you something a little different this year. Something you could return to whenever you need a reminder of how special you are, not just today, but on the ordinary days in between, too.",
          "So, here's a little garden made just for you, filled with flowers, memories, and words I hope will make you smile.",
        ],
        quote: "a little garden made just for you",
      },
      {
        title: "For the Person You Are",
        paragraphs: [
          "One of the beautiful things about life is that we never stop growing. We change, we learn, we discover new things about ourselves, and sometimes we become people we never imagined we could be.",
          "I hope you never forget that you don't have to have everything figured out to be doing wonderfully. You are allowed to take your time, to make mistakes, to rest, and to begin again.",
          "I hope you continue to grow into the person you want to become, without ever feeling that you have to be anyone other than yourself to deserve happiness and love.",
        ],
        quote: "You are allowed to take your time.",
      },
      {
        title: "The Little Things Matter",
        paragraphs: [
          "I hope you know that your worth is not measured by how much you accomplish, how much you give, or how perfectly you manage everything around you.",
          "Sometimes, the loveliest things about a person are the little things — the way they smile, the way they care, the things they get excited about, and the simple moments that make being around them feel special.",
          "I hope you get to experience more of those moments this year. More laughter that comes unexpectedly, more peaceful mornings, more reasons to be proud of yourself, and more days that remind you how beautiful life can be.",
        ],
        quote: "the loveliest things about a person are the little things",
      },
      {
        title: "For Your Twenty-Second Year",
        paragraphs: [
          "Twenty-two is another page in a story that is still being written.",
          "There will be new beginnings, unexpected turns, little victories, and probably a few days when things don't go according to plan. Through all of it, I hope you give yourself the same kindness that you so readily deserve.",
          "May this new year bring you closer to your dreams, surround you with people who genuinely care for you, and give you the courage to pursue the things that make your heart feel alive.",
          "And when life gets a little overwhelming, I hope you remember that you don't have to rush through every chapter. Some of the most beautiful things take time to bloom.",
        ],
        quote: "Some of the most beautiful things take time to bloom.",
      },
      {
        title: "And Always, With Love",
        paragraphs: [
          "If there's one thing I hope you carry with you beyond this birthday, it's this: you are someone worth celebrating.",
          "Not only for the things you do or the milestones you reach, but simply for being you.",
          "Thank you for being part of this world and for making it a little more beautiful in your own way. I hope the year ahead is gentle with you, generous with its happiness, and full of moments you'll want to remember.",
          "Happy 22nd birthday, my love. May this be a chapter filled with beautiful surprises, meaningful memories, and all the little things that make life worth living.",
        ],
        quote: "you are someone worth celebrating",
      },
    ],
    closing: "With all my love, always. ♡",
    ui: {
      prev: "Previous page",
      next: "Next page",
      returnToGarden: "Return to the Garden",
      readAgain: "Read from the beginning",
      hint: "tap the edge of the page, swipe, or use ← →",
      language: "Language",
    },
  },

  id: {
    langName: "Bahasa Indonesia",
    cover: {
      title: "Sebuah Surat Kecil untukmu",
      subtitle: "untuk Erika, di ulang tahunnya yang ke-22",
      open: "Buka Surat",
    },
    dedication: { to: "untuk Erika", note: "sebuah taman kecil berisi kata-kata, untuk disimpan", date: "14 Oktober" },
    pageLabel: "Halaman",
    pages: [
      {
        title: "Untuk Perempuan yang Berulang Tahun",
        paragraphs: [
          "Selamat ulang tahun, Ratu.",
          "Hari ini adalah hari untuk merayakan dirimu — seseorang yang telah melalui begitu banyak hal, menjalani perjalanan hidupnya sendiri, dan masih memiliki begitu banyak hal indah yang menanti di depan.",
          "Tahun ini, aku ingin memberikan sesuatu yang sedikit berbeda. Sesuatu yang bisa kamu kunjungi kembali kapan pun kamu membutuhkannya, sebagai pengingat betapa berharganya dirimu, bukan hanya hari ini, tetapi juga pada hari-hari biasa di antaranya.",
          "Jadi, aku membuat sebuah taman kecil khusus untukmu, dipenuhi bunga, kenangan, dan kata-kata yang semoga bisa membuatmu tersenyum.",
        ],
        quote: "sebuah taman kecil khusus untukmu",
      },
      {
        title: "Untuk Dirimu yang Sekarang",
        paragraphs: [
          "Salah satu hal indah dalam hidup adalah kita tidak pernah berhenti bertumbuh. Kita berubah, belajar, mengenal diri sendiri lebih dalam, dan terkadang tumbuh menjadi seseorang yang dahulu tidak pernah kita bayangkan.",
          "Aku harap kamu tidak pernah lupa bahwa kamu tidak harus memahami segalanya untuk bisa merasa bangga pada dirimu sendiri. Kamu boleh berjalan perlahan, melakukan kesalahan, beristirahat, dan memulai kembali.",
          "Semoga kamu terus tumbuh menjadi seseorang yang ingin kamu wujudkan, tanpa pernah merasa harus menjadi orang lain agar pantas mendapatkan kebahagiaan dan kasih sayang.",
        ],
        quote: "Kamu boleh berjalan perlahan.",
      },
      {
        title: "Hal-Hal Kecil yang Berarti",
        paragraphs: [
          "Aku harap kamu tahu bahwa nilai dirimu tidak ditentukan oleh seberapa banyak yang berhasil kamu capai, seberapa banyak yang kamu berikan, atau seberapa sempurna kamu menjalani semuanya.",
          "Terkadang, hal paling indah dari seseorang justru terletak pada hal-hal kecil — caranya tersenyum, caranya peduli, hal-hal yang membuatnya bersemangat, dan momen sederhana yang membuat kehadirannya terasa istimewa.",
          "Semoga tahun ini kamu mendapatkan lebih banyak momen seperti itu. Lebih banyak tawa yang datang tanpa diduga, pagi yang terasa tenang, alasan untuk bangga pada diri sendiri, dan hari-hari yang mengingatkanmu betapa indahnya hidup.",
        ],
        quote: "hal paling indah dari seseorang justru terletak pada hal-hal kecil",
      },
      {
        title: "Untuk Usia Dua Puluh Dua",
        paragraphs: [
          "Usia dua puluh dua adalah satu halaman baru dalam cerita yang masih terus ditulis.",
          "Akan ada awal yang baru, jalan yang tidak terduga, kemenangan-kemenangan kecil, dan mungkin beberapa hari ketika semuanya tidak berjalan sesuai rencana. Di tengah semua itu, semoga kamu bisa memperlakukan dirimu dengan kelembutan dan kebaikan yang memang layak kamu dapatkan.",
          "Semoga tahun ini membawamu semakin dekat dengan impianmu, mempertemukanmu dengan orang-orang yang benar-benar peduli, dan memberimu keberanian untuk mengejar hal-hal yang membuat hatimu hidup.",
          "Dan ketika hidup terasa sedikit melelahkan, semoga kamu ingat bahwa kamu tidak harus terburu-buru melewati setiap bab. Terkadang, hal-hal terindah memang membutuhkan waktu untuk mekar.",
        ],
        quote: "hal-hal terindah memang membutuhkan waktu untuk mekar",
      },
      {
        title: "Selalu, Dengan Cinta",
        paragraphs: [
          "Jika ada satu hal yang kuharap selalu kamu ingat setelah hari ulang tahun ini, itu adalah bahwa dirimu pantas untuk dirayakan.",
          "Bukan hanya karena hal-hal yang kamu lakukan atau pencapaian yang kamu raih, tetapi cukup karena kamu adalah dirimu sendiri.",
          "Terima kasih sudah menjadi bagian dari dunia ini dan membuatnya sedikit lebih indah dengan caramu sendiri. Semoga tahun yang akan datang memperlakukanmu dengan lembut, menghadirkan banyak kebahagiaan, dan memberimu kenangan-kenangan yang ingin kamu simpan selamanya.",
          "Selamat ulang tahun yang ke-22, sayangku. Semoga bab baru ini dipenuhi kejutan indah, kenangan yang berarti, dan hal-hal kecil yang membuat hidup terasa begitu berharga.",
        ],
        quote: "dirimu pantas untuk dirayakan",
      },
    ],
    closing: "Dengan seluruh cintaku, selalu. ♡",
    ui: {
      prev: "Halaman sebelumnya",
      next: "Halaman berikutnya",
      returnToGarden: "Kembali ke Taman",
      readAgain: "Baca dari awal",
      hint: "ketuk tepi halaman, geser, atau gunakan ← →",
      language: "Bahasa",
    },
  },
};

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
