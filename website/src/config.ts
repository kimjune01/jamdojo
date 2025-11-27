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
      { text: 'Piano', link: 'learn/piano', icon: '🎹', description: 'Play piano with your keyboard and explore different sounds' },
      { text: 'Guitar', link: 'learn/guitar', icon: '🎸', description: 'Learn the guitar fretboard with keyboard controls' },
      { text: 'Sample Quiz', link: 'learn/sample-guessing', icon: '🎯', description: 'Test your ability to identify drum and sample sounds' },
      { text: 'Ear Training', link: 'learn/ear-training', icon: '👂', description: 'Train your ear to recognize musical intervals' },
      { text: 'Euclidean Rhythms', link: 'learn/euclidean-101', icon: '🥁', description: 'Learn about mathematical patterns in music' },
    ],
  },
  {
    title: 'Workshop',
    icon: '📚',
    items: [
      { text: 'First Sounds', link: 'workshop/first-sounds', icon: '🔊', description: 'Start making sounds with Strudel' },
      { text: 'First Notes', link: 'workshop/first-notes', icon: '🎵', description: 'Learn to play musical notes and melodies' },
      { text: 'First Effects', link: 'workshop/first-effects', icon: '✨', description: 'Add effects to transform your sounds' },
      { text: 'Pattern Effects', link: 'workshop/pattern-effects', icon: '🔄', description: 'Create dynamic patterns with effects' },
      { text: 'Recap', link: 'workshop/recap', icon: '📝', description: 'Review what you have learned' },
    ],
  },
  {
    title: 'Making Sound',
    icon: '🎧',
    items: [
      { text: 'Samples', link: 'learn/samples', icon: '📀', description: 'Work with audio samples and drum kits' },
      { text: 'Synths', link: 'learn/synths', icon: '🎛️', description: 'Create sounds with synthesizers' },
      { text: 'Audio Effects', link: 'learn/effects', icon: '🎚️', description: 'Apply reverb, delay, filters and more' },
      { text: 'MIDI & OSC', link: 'learn/input-output', icon: '🔌', description: 'Connect to external devices and software' },
    ],
  },
  {
    title: 'Pattern Functions',
    icon: '⚡',
    items: [
      { text: 'Introduction', link: 'functions/intro', icon: '📖', description: 'Overview of pattern manipulation' },
      { text: 'Creating Patterns', link: 'learn/factories', icon: '🏭', description: 'Build patterns from scratch' },
      { text: 'Time Modifiers', link: 'learn/time-modifiers', icon: '⏱️', description: 'Control timing and rhythm' },
      { text: 'Control Parameters', link: 'functions/value-modifiers', icon: '🎛️', description: 'Modify pattern values dynamically' },
      { text: 'Signals', link: 'learn/signals', icon: '📈', description: 'Use continuous signals for modulation' },
      { text: 'Random Modifiers', link: 'learn/random-modifiers', icon: '🎲', description: 'Add randomness and variation' },
      { text: 'Conditional Modifiers', link: 'learn/conditional-modifiers', icon: '❓', description: 'Apply conditional logic to patterns' },
      { text: 'Tonal Functions', link: 'learn/tonal', icon: '🎼', description: 'Work with scales, chords and harmony' },
    ],
  },
  {
    title: 'More Topics',
    icon: '📚',
    items: [
      { text: 'Mini-Notation', link: 'learn/mini-notation', icon: '✏️', description: 'Learn the compact pattern syntax' },
      { text: 'Visual Feedback', link: 'learn/visual-feedback', icon: '👁️', description: 'See your patterns visualized' },
      { text: 'Hydra Visuals', link: 'learn/hydra', icon: '🌊', description: 'Create live visuals with Hydra' },
      { text: 'Recipes', link: 'recipes/recipes', icon: '🍳', description: 'Ready-to-use code snippets and examples' },
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
