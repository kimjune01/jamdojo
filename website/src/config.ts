export const SITE = {
  title: 'Strudel',
  description: 'Strudel is a music live coding editor that brings TidalCycles to the browser.',
  defaultLanguage: 'en',
};

export const OPEN_GRAPH = {
  image: {
    src: 'https://strudel.cc/icon.png',
    alt: 'Strudel Logo',
  },
};

// This is the type of the frontmatter you put in the docs markdown files.
export type Frontmatter = {
  title: string;
  description: string;
  layout: string;
  image?: { src: string; alt: string };
  dir?: 'ltr' | 'rtl';
  ogLocale?: string;
  lang?: string;
};

export const KNOWN_LANGUAGES = {
  English: 'en',
  German: 'de',
} as const;
export const KNOWN_LANGUAGE_CODES = Object.values(KNOWN_LANGUAGES);

export const GITHUB_EDIT_URL = `https://codeberg.org/uzu/strudel/src/branch/main/website`;

export const COMMUNITY_INVITE_URL = `https://discord.com/invite/HGEdXmRkzT`;

// See "Algolia" section of the README for more information.
export const ALGOLIA = {
  indexName: 'strudel-tidalcycles',
  appId: 'SAZ71S8CLS',
  apiKey: 'd5044f9d21b80e7721e5b0067a8730b1',
};

// Activity item with optional icon and description for home page display
export type ActivityItem = {
  text: string;
  link: string;
  icon?: string;
  description?: string;
};

export type SidebarSection = {
  title: string;
  icon?: string;
  items: ActivityItem[];
};

export type SidebarLang = Record<string, ActivityItem[]>;
export type Sidebar = Record<(typeof KNOWN_LANGUAGE_CODES)[number], SidebarLang>;

// Shared activity definitions - single source of truth for sidebar and home page
export const ACTIVITIES: SidebarSection[] = [
  {
    title: 'Interactive Tools',
    icon: '🎮',
    items: [
      { text: 'Piano', link: 'learn/interactive-tools/piano', icon: '🎹', description: 'Play piano with your keyboard and explore different sounds' },
      { text: 'Guitar', link: 'learn/interactive-tools/guitar', icon: '🎸', description: 'Learn the guitar fretboard with keyboard controls' },
      { text: 'Sample Explorer', link: 'learn/interactive-tools/sample-explorer', icon: '🔊', description: 'Explore and play with audio samples' },
    ],
  },
  {
    title: 'Quizzes',
    icon: '🎯',
    items: [
      { text: 'Sample Quiz', link: 'learn/quizzes/sample-guessing', icon: '🎯', description: 'Test your ability to identify drum and sample sounds' },
      { text: 'Waveform Quiz', link: 'learn/quizzes/waveform-guessing', icon: '〰', description: 'Identify different waveforms by sound' },
      { text: 'Effect Quiz', link: 'learn/quizzes/effect-guessing', icon: '🎛', description: 'Recognize audio effects by ear' },
      { text: 'Ear Training', link: 'learn/quizzes/ear-training', icon: '👂', description: 'Train your ear to recognize musical intervals' },
    ],
  },
  {
    title: 'Music Theory',
    icon: '🎵',
    items: [
      { text: 'Strudel Programming', link: 'learn/theory/strudel-programming', icon: '💻', description: 'Variables, functions, envelopes, and signals' },
      { text: 'Harmony', link: 'learn/theory/harmony', icon: '🎶', description: 'Learn chords, voicings, and jazz harmony' },
      { text: 'Chord Composition', link: 'learn/theory/chord-composition', icon: '🎼', description: 'Compose with chord progressions and voicings' },
      { text: 'Classical Terminology', link: 'learn/theory/classical-terminology', icon: '🎻', description: 'Form, harmony, and counterpoint vocabulary' },
      { text: 'Euclidean Rhythms', link: 'learn/theory/euclidean-rhythms', icon: '🥁', description: 'Learn about mathematical patterns in music' },
      { text: 'Auditory Space', link: 'learn/theory/auditory-space', icon: '🎛️', description: 'Master spatial audio: width, depth, and frequency separation' },
      { text: 'Sampling Composition', link: 'learn/theory/sampling-composition', icon: '🎚️', description: 'Compose with samples from Freesound and public libraries' },
      { text: 'Arranging Patterns', link: 'learn/theory/arranging', icon: '🎬', description: 'Organize patterns with cat, stack, and arrange' },
    ],
  },
  {
    title: 'Genre Studies',
    icon: '🎸',
    items: [
      { text: 'Rock & Pop', link: 'learn/genre/rock-pop', icon: '🎤', description: 'Classic rock patterns and pop production' },
      { text: 'Electronic Dance Music', link: 'learn/genre/edm', icon: '🎧', description: 'House, techno, trance, and more' },
      { text: 'Metal', link: 'learn/genre/metal', icon: '🤘', description: 'Heavy riffs, blast beats, and power' },
      { text: 'Demoscene', link: 'learn/genre/demoscene', icon: '🖥️', description: 'Chiptune, tracker music, and keygen styles' },
      { text: 'Classical Music', link: 'learn/genre/classical', icon: '🎼', description: 'Canon, fugue, and theme & variation techniques' },
    ],
  },
  {
    title: 'Workshop',
    icon: '📚',
    items: [
      { text: 'Getting Started', link: 'learn/workshop-content/getting-started', icon: '🚀', description: 'Start your journey with Strudel' },
    ],
  },
  {
    title: 'Reference',
    icon: '📖',
    items: [
      { text: 'Samples', link: 'learn/reference/samples', icon: '📀', description: 'Work with audio samples and drum kits' },
      { text: 'Synths', link: 'learn/reference/synths', icon: '🎛️', description: 'Create sounds with synthesizers' },
      { text: 'Audio Effects', link: 'learn/reference/effects', icon: '🎚️', description: 'Apply reverb, delay, filters and more' },
      { text: 'Notes', link: 'learn/reference/notes', icon: '🎼', description: 'Understanding musical notes and notation' },
      { text: 'Tonal Functions', link: 'learn/reference/tonal', icon: '🎵', description: 'Work with scales, chords and harmony' },
      { text: 'Mini-Notation', link: 'learn/reference/mini-notation', icon: '✏️', description: 'Learn the compact pattern syntax' },
      { text: 'Signals', link: 'learn/reference/signals', icon: '📈', description: 'Use continuous signals for modulation' },
    ],
  },
  {
    title: 'Pattern Functions',
    icon: '⚡',
    items: [
      { text: 'Creating Patterns', link: 'learn/reference/factories', icon: '🏭', description: 'Build patterns from scratch' },
      { text: 'Time Modifiers', link: 'learn/workshop-content/time-modifiers', icon: '⏱️', description: 'Control timing and rhythm' },
      { text: 'Random Modifiers', link: 'learn/workshop-content/random-modifiers', icon: '🎲', description: 'Add randomness and variation' },
      { text: 'Conditional Modifiers', link: 'learn/workshop-content/conditional-modifiers', icon: '❓', description: 'Apply conditional logic to patterns' },
    ],
  },
  {
    title: 'Advanced',
    icon: '🚀',
    items: [
      { text: 'Visual Feedback', link: 'learn/advanced/visual-feedback', icon: '👁️', description: 'See your patterns visualized' },
      { text: 'Hydra Visuals', link: 'learn/advanced/hydra', icon: '🌊', description: 'Create live visuals with Hydra' },
      { text: 'MIDI & OSC', link: 'learn/advanced/input-output', icon: '🔌', description: 'Connect to external devices and software' },
      { text: 'Csound', link: 'learn/advanced/csound', icon: '🎚️', description: 'Use Csound for advanced synthesis' },
      { text: 'PWA', link: 'learn/advanced/pwa', icon: '📱', description: 'Install Strudel as a Progressive Web App' },
    ],
  },
];

// Convert ACTIVITIES to sidebar format
const activitiesToSidebar = (activities: SidebarSection[]): SidebarLang => {
  const sidebar: SidebarLang = {};
  for (const section of activities) {
    sidebar[section.title] = section.items.map(({ text, link }) => ({ text, link }));
  }
  return sidebar;
};

export const SIDEBAR: Sidebar = {
  de: {
    Workshop: [
      { text: 'Intro', link: 'de/workshop/getting-started' },
      { text: 'Erste Sounds', link: 'de/workshop/first-sounds' },
      { text: 'Erste Töne', link: 'de/workshop/first-notes' },
      { text: 'Erste Effekte', link: 'de/workshop/first-effects' },
      { text: 'Pattern Effekte', link: 'de/workshop/pattern-effects' },
      { text: 'Rückblick', link: 'de/workshop/recap' },
      { text: 'Mehr Seiten auf Englisch', link: 'workshop/getting-started' },
    ],
  },
  en: activitiesToSidebar(ACTIVITIES),
};
