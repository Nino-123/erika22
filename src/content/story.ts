/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  🌸  CHAPTER I — THE STORY OF HER LIFE  🌸
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Everything you might want to personalise in the storybook lives here.
 *  The text below is placeholder narration — gentle and general on purpose.
 *  Replace it with details that are truly hers whenever you like.
 *
 *  ILLUSTRATIONS
 *  Each stage is drawn in code as a pencil sketch that draws itself as she
 *  scrolls. To use your own artwork instead (e.g. by an artist), put a
 *  transparent PNG/WEBP in /public/story/ and set `image` on that stage, e.g.
 *    image: "/story/baby.png"
 *  Keep the same canvas proportions (4 wide : 5.2 tall) with her feet near the
 *  bottom so the stages line up as she "grows" from one page to the next.
 */

export type StoryStage = {
  /** Small label, e.g. "Chapter I-A". */
  label: string;
  title: string;
  /** One short line shown under the title. */
  kicker: string;
  /** A few sentences. Keep it brief so it stays readable while scrolling. */
  text: string;
  /** Optional replacement artwork, e.g. "/story/baby.png". */
  image?: string;
  /** Short description of the illustration for screen readers. */
  alt: string;
};

export const story = {
  eyebrow: "Chapter I",
  title: "The Story of Her Life",
  intro: "From the very first page until today — scroll slowly, and watch her grow.",
  scrollHint: "turn the page",

  stages: [
    {
      label: "Chapter A",
      title: "Once Upon a Time",
      kicker: "the beginning",
      text: "Once upon a time, a little girl came into this world. She had no idea how many beautiful things, unexpected adventures, and people who would love her were waiting ahead.",
      alt: "A pencil sketch of a baby girl in a soft headscarf, wrapped in a blanket beneath a crescent moon.",
    },
    {
      label: "Chapter B",
      title: "Little Wonders",
      kicker: "the curious years",
      text: "The world was still so big, and every little thing held a little bit of magic. There were new things to discover, little joys to collect, and a whole world waiting to be explored.",
      alt: "A pencil sketch of a little girl in a headscarf and a rose-coloured dress, holding a flower among butterflies.",
    },
    {
      label: "Chapter C",
      title: "Finding Herself",
      kicker: "the growing years",
      text: "Then came the years of growing, changing, learning, and slowly discovering who she wanted to be. Not every page was easy, but every page became part of the person she was becoming.",
      alt: "A pencil sketch of a teenage girl with dark shoulder-length hair and a flower clip, holding a notebook to her chest.",
    },
    {
      label: "Chapter D",
      title: "Becoming Her",
      kicker: "twenty-two",
      text: "And now, here you are — twenty-two years of little beginnings, growing pains, beautiful moments, and becoming. You are no longer the little girl at the beginning of this story, but every version of you has helped create the person you are today.",
      alt: "A pencil sketch of a young woman with long dark wavy hair and a flower clip, in a flowing dress, holding a bouquet.",
    },
  ] satisfies StoryStage[] as StoryStage[],

  /** The final page — a birthday message for her 22nd. */
  finale: {
    label: "The last page (for now)",
    heading: "And this is only the beginning.",
    paragraphs: [
      "Happy 22nd birthday, Erika <3",
      "If We could give you anything, it would be the chance to see yourself through Our eyes — to see how much beauty, warmth, and goodness you bring into this world.",
      "We hope this new chapter brings you more reasons to smile, more dreams to chase, and more moments that remind you how loved you are.",
      "And as you keep growing into the person you are meant to be, We hope you never forget that every version of you deserves to be celebrated.",
      "Here's to 22, and to all the beautiful pages still waiting to be written.",
    ],
    closing: "With all our love, always.",
    /** Optional replacement artwork for the portrait on this page. */
    image: undefined as string | undefined,
  },

  /** The line that turns the page into Chapter II — Our Memories. */
  bridge: "And somewhere along the way, our stories became intertwined.",
};
