/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  🌸  EVERYTHING YOU NEED TO PERSONALISE LIVES IN THIS ONE FILE  🌸
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Edit the text below, save, and the website updates. You never need to open
 *  the component files to change words, photos, album names or music.
 *
 *  Anything written in [square brackets] is a placeholder that is meant to be
 *  replaced with your own words before you send her the link.
 *
 *  PHOTOS
 *  1. Put your photos in  /public/photos/   (e.g. /public/photos/beach.jpg)
 *  2. In the `gallery.albums` list below, change `src` to "/photos/beach.jpg"
 *  3. Set `aspect` to "portrait", "landscape" or "square" to match the photo
 *  4. Write a caption (or leave it as "" for no caption) and a short `alt`
 *     description for screen readers.
 *  JPG / PNG / WEBP all work. Photos are automatically resized and optimised.
 */

export type PhotoAspect = "portrait" | "landscape" | "square";

export type Photo = {
  /** Path inside /public, e.g. "/photos/our-first-trip.jpg" */
  src: string;
  /** Short description of the photo, read aloud by screen readers. */
  alt: string;
  /** Handwritten caption under the polaroid. Use "" for none. */
  caption: string;
  aspect: PhotoAspect;
};

export type Album = {
  title: string;
  description: string;
  photos: Photo[];
  /** Show the garden of qualities (src/content/qualities.ts) instead of photos. */
  garden?: boolean;
};

export const site = {
  // ── Who this is for ────────────────────────────────────────────────────────
  her: {
    /** Shown large on the main page and in the final message. */
    name: "Putri Najma Erika Adli",
    /** A softer word used in a few places, e.g. "my love", "sunshine". */
    nickname: "Princess",
  },

  /** Your name, used to sign the letter. */
  from: "Loved ones",

  birthday: {
    /** Shown in small editorial labels around the site. */
    dateLabel: "October 14",
    shortLabel: "10 — 14",
    dayNumber: "14",
  },

  // ── Browser tab / link preview ─────────────────────────────────────────────
  meta: {
    title: "A Little Garden, Just for You",
    description: "A birthday garden, planted with love.",
  },

  // ── 1 · Opening experience (the flower bud she taps) ──────────────────────
  intro: {
    eyebrow: "October 14 · for you",
    tapHint: "tap the little bud",
    bloomMessage: "Happy Birthday, Erika!",
    subtitle:
      "We planted a little garden for you. Every flower in it is something We love about you.",
    button: "Enter Your Garden",
  },

  // ── 2 · The garden that blooms ─────────────────────────────────────────────
  garden: {
    eyebrow: "Happy Birthday",
    /** Appears under her name. */
    title: "A Little Garden, Just for You",
    body: "Take your time here. Scroll slowly, let the flowers open, and know that every corner of this place was made thinking of you.",
    scrollHint: "wander slowly",
  },

  // ── 3 · Photo gallery ──────────────────────────────────────────────────────
  gallery: {
    eyebrow: "Chapter II",
    title: "Our Memories",
    intro: "A small scrapbook of you, of us, and of the moments we all hold close.",
    /**
     * Albums appear as tabs. Rename them, reorder them, add or remove photos,
     * or delete a whole album — it all just works.
     *
     * The images below are PLACEHOLDERS (they say "your photo here").
     * Replace each `src` with one of your own photos.
     */
    albums: [
      {
        title: "Her Beautiful Moments",
        description: "Snapshots of your brightest smiles, your gentle soul, and the countless ways you effortlessly light up every room you walk into.",
        photos: [
          { src: "/photos/her moment3.jpeg", alt: "Placeholder photo", caption: "Mahadasyat", aspect: "portrait" },
          { src: "/photos/her moment4.jpeg", alt: "Placeholder photo", caption: "Hasil menyalon, Stunning!", aspect: "landscape" },
          { src: "/photos/her moment6.jpeg", alt: "Placeholder photo", caption: "너무 예뻐요", aspect: "square" },
          { src: "/photos/her moment8.jpeg", alt: "Placeholder photo", caption: "Bless her!", aspect: "portrait" },
          { src: "/photos/her moment9.jpeg", alt: "Placeholder photo", caption: "", aspect: "portrait" },
          { src: "/photos/her moment10.jpeg", alt: "Placeholder photo", caption: "Ciptaan Tuhan yang paling mulia", aspect: "portrait" },
          { src: "/photos/her moment11.jpeg", alt: "Placeholder photo", caption: "Rispek!!!!!", aspect: "portrait" },
          { src: "/photos/her moment12.jpeg", alt: "Placeholder photo", caption: "Terlalu Lucu kamu Ya!!", aspect: "portrait" },
          { src: "/photos/her moment13.jpeg", alt: "Placeholder photo", caption: "Thankyou for supporting!", aspect: "portrait" },
          { src: "/photos/her moment14.jpeg", alt: "Placeholder photo", caption: "Ga kalah magical dengan castlenya!", aspect: "portrait" },
          { src: "/photos/her moment15.jpeg", alt: "Placeholder photo", caption: "Adorable!", aspect: "portrait" },
          { src: "/photos/her moment16.jpeg", alt: "Placeholder photo", caption: "di vidcall saja, Mahadasyat!", aspect: "portrait" },
        ],
      },
      {
        title: "Little Things We Love About You",
        description: "",
        /** No photos here: a little garden of flowers, each holding a note.
         *  The flowers and their words live in src/content/qualities.ts */
        garden: true,
        photos: [],
      },
      {
        title: "Our Memories",
        description: "The journeys we've shared, the laughs that filled the room, and the unforgettable moments we are so lucky to have lived with you.",
        photos: [
          { src: "/photos/our memories1.jpeg", alt: "Placeholder photo", caption: "Always making everywhere brighter", aspect: "landscape" },
          { src: "/photos/our memories2.jpeg", alt: "Placeholder photo", caption: "Endless laughter together", aspect: "portrait" },
          { src: "/photos/our memories3.jpeg", alt: "Placeholder photo", caption: "One of our favourite memories", aspect: "square" },
          { src: "/photos/our memories4.jpeg", alt: "Placeholder photo", caption: "Days we never wanted to end", aspect: "portrait" },
          { src: "/photos/our memories5.jpeg", alt: "Placeholder photo", caption: "The best company", aspect: "portrait" },
          { src: "/photos/our memories6.jpeg", alt: "Placeholder photo", caption: "Pure, unfiltered joy", aspect: "portrait" },
          { src: "/photos/our memories7.jpeg", alt: "Placeholder photo", caption: "Precious moments with you", aspect: "portrait" },
          { src: "/photos/our memories8.jpeg", alt: "Placeholder photo", caption: "Golden days", aspect: "portrait" },
          { src: "/photos/our memories9.jpeg", alt: "Placeholder photo", caption: "Smiles that say everything", aspect: "portrait" },
          { src: "/photos/our memories10.jpeg", alt: "Placeholder photo", caption: "Surrounded by happiness", aspect: "portrait" },
          { src: "/photos/our memories12.jpeg", alt: "Placeholder photo", caption: "Always a great time with you", aspect: "portrait" },
          { src: "/photos/our memories17.jpeg", alt: "Placeholder photo", caption: "Moments that mean the world", aspect: "portrait" },
          { src: "/photos/our memories18.jpeg", alt: "Placeholder photo", caption: "Memories to keep forever", aspect: "portrait" },
          { src: "/photos/our memories19.jpeg", alt: "Placeholder photo", caption: "Pure happiness in one frame", aspect: "portrait" },
          { src: "/photos/our memories20.jpeg", alt: "Placeholder photo", caption: "With you, every moment counts", aspect: "portrait" },
        ],
      },
      {
        title: "Moments We Want to Remember",
        description: "Treasured chapters that time will never wash away, and all the beautiful milestones still waiting ahead for you.",
        photos: [
          { src: "/photos/want to remember1.jpeg", alt: "Placeholder photo", caption: "Cutest photo i took before heading", aspect: "portrait" },
          { src: "/photos/want to remember2.jpeg", alt: "Placeholder photo", caption: "A moment etched in time", aspect: "portrait" },
          { src: "/photos/want to remember3.jpeg", alt: "Placeholder photo", caption: "Treasured times with you", aspect: "portrait" },
          { src: "/photos/want to remember4.jpeg", alt: "Placeholder photo", caption: "Days we'll always look back on", aspect: "portrait" },
          { src: "/photos/want to remember5.jpeg", alt: "Placeholder photo", caption: "Too special to forget", aspect: "portrait" },
          { src: "/photos/want to remember6.jpeg", alt: "Placeholder photo", caption: "Forever cherished", aspect: "portrait" },
          { src: "/photos/want to remember7.jpeg", alt: "Placeholder photo", caption: "A memory to hold onto", aspect: "portrait" },
          { src: "/photos/want to remember8.jpeg", alt: "Placeholder photo", caption: "Core memory unlocked", aspect: "portrait" },
        ],
      },
    ] satisfies Album[] as Album[],
  },

  // ── 4 · Your birthday letter ───────────────────────────────────────────────
  letter: {
    eyebrow: "Chapter III",
    title: "A Letter, From Us to You",
    // The letter itself (all five pages, in English and Bahasa Indonesia)
    // lives in src/content/letter.ts
  },

  // ── 5 · Birthday wishes from her favourite people ──────────────────────────
  // (the Wishes chapter's words, in English and Indonesian, live in src/content/wishes.ts)

  // ── 6 · The ending ─────────────────────────────────────────────────────────
  finale: {
    eyebrow: "Always",
    message: "The world is more beautiful with you in it.",
    /** Shown under the main message; her name is added automatically. */
    sign: "Happy birthday",
    replayButton: "Back to the beginning",
    memoriesButton: "Revisit our memories",
    footer: "made with love, just for you",
    /** The little glowing flower hidden by the garden path. */
    secret: "A little reminder that the world is more beautiful with you in it.",
    secretLabel: "A little flower by the path",
  },

  // ── Background music ───────────────────────────────────────────────────────
  music: {
    /**
     * By default the site plays "A Garden Lullaby" — an original music-box
     * piece generated live in the browser (no file needed, no copyright).
     *
     * To use YOUR song instead: put an .mp3 in /public/music/ and set its
     * path here, e.g. "/music/our-song.mp3". (Only use a song you have the
     * right to share — it will be publicly downloadable from the site.)
     */
    src: "/music/Semua Aku Dirayakan - Nadin Amizah Instrumental.mp3",
    /** Set to false (with src "") to hide the music button entirely. */
    lullaby: true,
    /** Shown on the music button. */
    title: "Nadin Amizah - Semua Aku Dirayakan (Instrumental)",
  },
};

export type SiteContent = typeof site;
