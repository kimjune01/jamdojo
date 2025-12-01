import { useState, useCallback, useRef, useEffect } from 'react';
import { getAudioContext, initAudioOnFirstClick, superdough } from '@strudel/webaudio';
import { prebake } from '../repl/prebake.mjs';
import { loadModules } from '../repl/util.mjs';
import useClient from '@src/useClient.mjs';

let prebaked, modulesLoading, audioReady;
if (typeof window !== 'undefined') {
  prebaked = prebake();
  modulesLoading = loadModules();
  audioReady = initAudioOnFirstClick();
}

// Sample packs with their sounds (drum machines)
const DRUM_PACKS = [
  {
    id: 'default',
    name: 'Default',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cr', 'rd', 'ht', 'mt', 'lt', 'sh', 'cb', 'tb', 'misc'],
    useBank: false,
    description: 'Mixed samples from various drum machines. Great starting point for any genre.',
    examples: 'General purpose',
  },
  // Roland
  {
    id: 'RolandTR909',
    name: 'Roland TR-909',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cr', 'rd', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'The definitive house and techno machine. Punchy kick, snappy snare, and sizzling hi-hats.',
    examples: 'House, Techno, Trance — Daft Punk "Around the World", Fatboy Slim "Right Here Right Now"',
    wiki: 'https://en.wikipedia.org/wiki/Roland_TR-909',
  },
  {
    id: 'RolandTR808',
    name: 'Roland TR-808',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Deep booming kick and crispy snare. The foundation of hip-hop and modern pop.',
    examples: 'Hip-Hop, Trap, Electro — Marvin Gaye "Sexual Healing", Kanye West "Love Lockdown"',
    wiki: 'https://en.wikipedia.org/wiki/Roland_TR-808',
  },
  {
    id: 'RolandTR707',
    name: 'Roland TR-707',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Bright, punchy digital samples. Popular in 80s synth-pop and early house.',
    examples: 'Synth-Pop, Italo Disco — New Order, Pet Shop Boys',
    wiki: 'https://en.wikipedia.org/wiki/Roland_TR-707',
  },
  {
    id: 'RolandTR727',
    name: 'Roland TR-727 (Latin)',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'cb', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Latin percussion companion to the 707. Bongos, congas, agogo, and more.',
    examples: 'Latin House, World Music — often paired with TR-707',
    wiki: 'https://en.wikipedia.org/wiki/Roland_TR-727',
  },
  {
    id: 'RolandTR606',
    name: 'Roland TR-606',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp'],
    useBank: true,
    description: 'Compact analog drum machine, sibling to the TB-303. Gritty, acidic character.',
    examples: 'Acid House, Acid Techno — often paired with TB-303 basslines',
    wiki: 'https://en.wikipedia.org/wiki/Roland_TR-606',
  },
  {
    id: 'RolandTR505',
    name: 'Roland TR-505',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Budget-friendly 80s drum machine with a lo-fi charm.',
    examples: 'Lo-Fi, Indie Electronic',
    wiki: 'https://en.wikipedia.org/wiki/Roland_TR-505',
  },
  {
    id: 'RolandCompurhythm78',
    name: 'Roland CR-78',
    sounds: ['bd', 'sd', 'hh', 'oh', 'rim', 'cb'],
    useBank: true,
    description: 'One of the first programmable drum machines. Warm, organic analog sounds.',
    examples: 'New Wave, Art Rock — Phil Collins "In the Air Tonight", Blondie "Heart of Glass"',
    wiki: 'https://en.wikipedia.org/wiki/Roland_CR-78',
  },
  // Linn
  {
    id: 'LinnDrum',
    name: 'LinnDrum',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Iconic 80s digital drum machine. Defined the sound of a decade.',
    examples: '80s Pop, R&B — Prince "When Doves Cry", The Human League "Don\'t You Want Me"',
    wiki: 'https://en.wikipedia.org/wiki/LinnDrum',
  },
  {
    id: 'LinnLM1',
    name: 'Linn LM-1',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'cb', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'First drum machine with digital samples. Revolutionary realistic sound.',
    examples: '80s Pop — Prince "1999", Gary Numan, Peter Gabriel',
    wiki: 'https://en.wikipedia.org/wiki/Linn_LM-1',
  },
  {
    id: 'Linn9000',
    name: 'Linn 9000',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cr', 'rd', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Advanced sampling drum machine with sequencer. Studio powerhouse.',
    examples: '80s Pop, R&B — Janet Jackson, Sting',
    wiki: 'https://en.wikipedia.org/wiki/Linn_9000',
  },
  // Oberheim
  {
    id: 'OberheimDMX',
    name: 'Oberheim DMX',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cr', 'rd', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Fat, punchy sounds that defined early hip-hop. Heavy low end.',
    examples: 'Hip-Hop, Electro — Run-DMC "It\'s Like That", New Order "Blue Monday"',
    wiki: 'https://en.wikipedia.org/wiki/Oberheim_DMX',
  },
  // E-mu
  {
    id: 'EmuSP12',
    name: 'E-mu SP-12',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cr', 'cb', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Legendary sampling drum machine. 12-bit grit beloved by producers.',
    examples: 'Hip-Hop, R&B — Marley Marl, Mantronix, The Beastie Boys',
    wiki: 'https://en.wikipedia.org/wiki/E-mu_SP-12',
  },
  {
    id: 'EmuDrumulator',
    name: 'E-mu Drumulator',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Affordable 80s digital drums. Bright, cutting sounds.',
    examples: 'Synth-Pop, Industrial — Depeche Mode, Nine Inch Nails',
    wiki: 'https://en.wikipedia.org/wiki/E-mu_Drumulator',
  },
  // Akai
  {
    id: 'AkaiLinn',
    name: 'Akai Linn',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Collaboration between Akai and Roger Linn. MPC lineage.',
    examples: 'Hip-Hop, R&B',
    wiki: 'https://en.wikipedia.org/wiki/Akai_MPC',
  },
  {
    id: 'AkaiXR10',
    name: 'Akai XR10',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Portable drum machine with surprisingly punchy sounds.',
    examples: 'Electronic, Lo-Fi',
  },
  // Yamaha
  {
    id: 'YamahaRX5',
    name: 'Yamaha RX5',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cr', 'rd', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Versatile 12-bit drum machine with FM synthesis. Huge sound library.',
    examples: '80s Pop, Rock — Phil Collins, Genesis, Peter Gabriel',
    wiki: 'https://en.wikipedia.org/wiki/Yamaha_RX5',
  },
  {
    id: 'YamahaRX21',
    name: 'Yamaha RX21',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Compact and affordable. Clean digital sounds with 80s character.',
    examples: '80s Pop, Synth-Pop',
  },
  // Boss
  {
    id: 'BossDR110',
    name: 'Boss DR-110',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim'],
    useBank: true,
    description: 'The "Dr. Rhythm". Analog warmth in a compact package.',
    examples: 'Lo-Fi, Indie — popular in underground and DIY music',
    wiki: 'https://en.wikipedia.org/wiki/Boss_DR-110',
  },
  {
    id: 'BossDR55',
    name: 'Boss DR-55',
    sounds: ['bd', 'sd', 'hh', 'rim'],
    useBank: true,
    description: 'Simple 4-sound analog drum machine. Raw, lo-fi character.',
    examples: 'Lo-Fi, Minimal Electronic, Punk',
    wiki: 'https://en.wikipedia.org/wiki/Boss_DR-55',
  },
  // Casio
  {
    id: 'CasioRZ1',
    name: 'Casio RZ-1',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb'],
    useBank: true,
    description: 'Affordable sampler/drum machine hybrid. 8-bit lo-fi charm.',
    examples: 'Lo-Fi Hip-Hop, Chillwave — sampled by J Dilla and others',
    wiki: 'https://en.wikipedia.org/wiki/Casio_RZ-1',
  },
  {
    id: 'CasioVL1',
    name: 'Casio VL-1',
    sounds: ['bd', 'sd', 'hh'],
    useBank: true,
    description: 'Tiny calculator keyboard with built-in rhythms. Iconic lo-fi toy sound.',
    examples: 'Novelty, Lo-Fi — "Da Da Da" by Trio, The Human League',
    wiki: 'https://en.wikipedia.org/wiki/Casio_VL-1',
  },
  // Alesis
  {
    id: 'AlesisSR16',
    name: 'Alesis SR-16',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cr', 'rd', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Industry-standard studio drum machine. Clean, punchy, versatile.',
    examples: 'Rock, Pop, Demo Production — ubiquitous in 90s/2000s studios',
    wiki: 'https://en.wikipedia.org/wiki/Alesis_SR-16',
  },
  {
    id: 'AlesisHR16',
    name: 'Alesis HR-16',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cr', 'ht', 'mt', 'lt'],
    useBank: true,
    description: '16-bit drum machine with powerful sound. Industrial favorite.',
    examples: 'Industrial, EBM, Alternative — Nine Inch Nails, Ministry',
    wiki: 'https://en.wikipedia.org/wiki/Alesis_HR-16',
  },
  // Korg
  {
    id: 'KorgKR55',
    name: 'Korg KR-55',
    sounds: ['bd', 'sd', 'hh', 'oh', 'rim', 'cb'],
    useBank: true,
    description: 'Vintage analog rhythm box. Warm, natural percussion sounds.',
    examples: 'Vintage, Analog Electronic',
  },
  {
    id: 'KorgDDM110',
    name: 'Korg DDM-110',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim'],
    useBank: true,
    description: 'Affordable digital drums. Companion to the DDM-220 percussion.',
    examples: 'Synth-Pop, New Wave',
  },
  {
    id: 'KorgMinipops',
    name: 'Korg Minipops',
    sounds: ['bd', 'sd', 'hh', 'oh', 'rim', 'cb'],
    useBank: true,
    description: 'Classic 70s preset rhythm box. Beloved for its organic sound.',
    examples: 'Krautrock, Vintage Electronic — Jean-Michel Jarre "Oxygène"',
    wiki: 'https://en.wikipedia.org/wiki/Korg_Mini_Pops',
  },
  // Sequential Circuits
  {
    id: 'SequentialCircuitsDrumtracks',
    name: 'Sequential Drumtraks',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cr', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'MIDI-equipped drum machine. Punchy, usable sounds.',
    examples: 'Synth-Pop, 80s Electronic — Duran Duran, Thompson Twins',
    wiki: 'https://en.wikipedia.org/wiki/Sequential_Circuits_Drumtraks',
  },
  // Simmons
  {
    id: 'SimmonsSDS5',
    name: 'Simmons SDS-5',
    sounds: ['bd', 'sd', 'hh', 'ht', 'mt', 'lt'],
    useBank: true,
    description: 'Iconic hexagonal electronic drums. Distinctive "pew" sounds.',
    examples: '80s Pop, New Wave — Phil Collins, Duran Duran, Spandau Ballet',
    wiki: 'https://en.wikipedia.org/wiki/Simmons_(electronic_drum_company)',
  },
  // Other classics
  {
    id: 'MFB512',
    name: 'MFB-512',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb'],
    useBank: true,
    description: 'German analog drum machine. Quirky, characterful sounds.',
    examples: 'Minimal Electronic, Experimental',
  },
  {
    id: 'RhythmAce',
    name: 'Rhythm Ace',
    sounds: ['bd', 'sd', 'hh', 'oh', 'rim', 'cb'],
    useBank: true,
    description: 'Early Ace Tone/Roland preset rhythm box. Proto-drum machine.',
    examples: 'Vintage, Organ Music — Sly Stone famously used one',
    wiki: 'https://en.wikipedia.org/wiki/Rhythm_Ace',
  },
];

// Dirt-Samples categories and sample packs
// From: https://github.com/tidalcycles/dirt-samples
const DIRT_SAMPLES_CATEGORIES = {
  'Drums & Kicks': {
    description: 'Kick drums, bass drums, and drum hits',
    samples: {
      '808': 6, '808bd': 25, 'bd': 24, 'kicklinn': 1, 'clubkick': 5, 'hardkick': 6, 'popkick': 10, 'reverbkick': 1,
    },
  },
  'Snares & Claps': {
    description: 'Snare drums, rim shots, and claps',
    samples: {
      '808sd': 25, 'sd': 2, 'sn': 52, 'cp': 2, 'realclaps': 4, 'rm': 2,
    },
  },
  'Hi-Hats & Cymbals': {
    description: 'Hi-hats, cymbals, and metallic percussion',
    samples: {
      '808cy': 25, '808hc': 5, '808oh': 5, 'hh': 13, 'hh27': 13, 'linnhats': 6, 'cr': 6, 'cb': 1, 'cc': 6,
    },
  },
  'Toms': {
    description: 'High, mid, and low toms',
    samples: {
      '808ht': 5, '808lt': 5, '808lc': 5, '808mc': 5, '808mt': 5, 'ht': 16, 'lt': 16, 'mt': 16,
    },
  },
  'Full Kits & Machines': {
    description: 'Complete drum kits and drum machines',
    samples: {
      '909': 1, 'dr': 42, 'dr2': 6, 'dr55': 4, 'dr_few': 8, 'drum': 6, 'drumtraks': 13, 'gretsch': 24,
      'jazz': 8, 'house': 8, 'hardcore': 12, 'techno': 7, 'tech': 13, 'ifdrums': 3,
    },
  },
  'Bass': {
    description: 'Bass sounds, sub-bass, and low-end',
    samples: {
      'bass': 4, 'bass0': 3, 'bass1': 31, 'bass2': 5, 'bass3': 11, 'bassdm': 24, 'bassfoo': 3,
      'jungbass': 20, 'jvbass': 13, 'moog': 7,
    },
  },
  'Synths & Melodic': {
    description: 'Synthesizers, arpeggios, and melodic sounds',
    samples: {
      'arpy': 11, 'arp': 2, 'casio': 3, 'juno': 12, 'newnotes': 15, 'notes': 15, 'psr': 30,
      'simplesine': 6, 'stab': 23, 'hoover': 6, 'wobble': 1, 'pluck': 17, 'fm': 17,
    },
  },
  'Breaks & Loops': {
    description: 'Breakbeats and drum loops',
    samples: {
      'amencutup': 32, 'breaks125': 2, 'breaks152': 1, 'breaks157': 1, 'breaks165': 1, 'jungle': 13,
    },
  },
  'Vocals & Speech': {
    description: 'Vocal samples, speech, and voice',
    samples: {
      'alphabet': 26, 'baa': 7, 'baa2': 7, 'diphone': 38, 'diphone2': 12, 'mouth': 15, 'speech': 7,
      'speechless': 10, 'speakspell': 12, 'numbers': 9, 'num': 21, 'yeah': 31, 'miniyeah': 4, 'hmm': 1,
    },
  },
  'World & Ethnic': {
    description: 'World music instruments and ethnic percussion',
    samples: {
      'east': 9, 'tabla': 26, 'tabla2': 48, 'tablex': 3, 'sitar': 8, 'koy': 2, 'latibro': 8, 'world': 3,
    },
  },
  'Ambient & Texture': {
    description: 'Ambient sounds, pads, and textures',
    samples: {
      'breath': 1, 'pad': 3, 'padlong': 1, 'wind': 10, 'outdoor': 6, 'fire': 1, 'space': 18,
    },
  },
  'Nature & Animals': {
    description: 'Nature sounds, birds, and animals',
    samples: {
      'birds': 10, 'birds3': 19, 'crow': 4, 'insect': 3,
    },
  },
  'Noise & Glitch': {
    description: 'Noise, glitch, and distortion sounds',
    samples: {
      'noise': 1, 'noise2': 8, 'glitch': 8, 'glitch2': 8, 'dist': 16, 'industrial': 32,
    },
  },
  'FX & Impacts': {
    description: 'Sound effects, hits, and impacts',
    samples: {
      'hit': 6, 'click': 4, 'clak': 2, 'tink': 5, 'tok': 4, 'flick': 17, 'stomp': 10, 'hand': 17,
      'coins': 1, 'glasstap': 3, 'bottle': 13, 'can': 14, 'metal': 10, 'pebbles': 1,
    },
  },
  'Electronic & Rave': {
    description: 'Electronic music and rave sounds',
    samples: {
      'rave': 8, 'rave2': 4, 'ravemono': 2, 'gabba': 4, 'gabbaloud': 4, 'gabbalouder': 4, 'gab': 10,
      'electro1': 13, 'future': 17, 'cosmicg': 15, 'invaders': 18,
    },
  },
  'Bleeps & Blips': {
    description: 'Electronic bleeps, blips, and tones',
    samples: {
      'bleep': 13, 'blip': 2, 'sid': 12, 'em2': 6, 'e': 8, 'f': 1, 'v': 6,
    },
  },
  'Instruments': {
    description: 'Acoustic and electric instruments',
    samples: {
      'sax': 22, 'gtr': 3, 'trump': 11, 'perc': 6,
    },
  },
  'Miscellaneous': {
    description: 'Other unique and creative samples',
    samples: {
      'ab': 12, 'ade': 10, 'ades2': 9, 'ades3': 7, 'ades4': 6, 'alex': 2, 'armora': 7, 'auto': 11,
      'battles': 2, 'bend': 4, 'bev': 2, 'bin': 2, 'blue': 2, 'bubble': 8, 'chin': 4, 'circus': 3,
      'co': 4, 'control': 2, 'd': 4, 'db': 13, 'dork2': 4, 'dorkbot': 2, 'erk': 1, 'feel': 7,
      'feelfx': 8, 'fest': 1, 'foo': 27, 'h': 7, 'haw': 6, 'hc': 6, 'ho': 6, 'if': 5, 'incoming': 8,
      'kurt': 7, 'led': 1, 'less': 4, 'lighter': 32, 'made': 7, 'made2': 1, 'mash': 2, 'mash2': 4,
      'monsterb': 6, 'mp3': 4, 'msg': 9, 'mute': 27, 'oc': 4, 'odx': 15, 'off': 1, 'peri': 15,
      'print': 11, 'proc': 2, 'procshort': 8, 'rs': 1, 'seawolf': 3, 'sequential': 8, 'sf': 18,
      'sheffield': 1, 'short': 5, 'subroc3d': 11, 'sugar': 2, 'sundance': 6, 'tacscan': 22, 'toys': 13,
      'ul': 10, 'ulgab': 5, 'uxay': 3, 'voodoo': 5, 'xmas': 1,
    },
  },
};

// Flatten samples for search
const getAllDirtSamples = () => {
  const all = [];
  Object.entries(DIRT_SAMPLES_CATEGORIES).forEach(([category, data]) => {
    Object.entries(data.samples).forEach(([name, count]) => {
      all.push({ name, count, category });
    });
  });
  return all.sort((a, b) => a.name.localeCompare(b.name));
};

const ALL_DIRT_SAMPLES = getAllDirtSamples();

// Sound labels for display
const SOUND_LABELS = {
  bd: 'Kick',
  sd: 'Snare',
  hh: 'Hi-Hat',
  oh: 'Open HH',
  cp: 'Clap',
  rim: 'Rim',
  cr: 'Crash',
  rd: 'Ride',
  ht: 'High Tom',
  mt: 'Mid Tom',
  lt: 'Low Tom',
  sh: 'Shaker',
  cb: 'Cowbell',
  tb: 'Tambourine',
  misc: 'Misc',
};

// Keyboard mapping for sounds
const KEY_ROW_1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'];
const KEY_ROW_2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'];

export function SampleExplorer() {
  const [selectedPack, setSelectedPack] = useState(DRUM_PACKS[0]);
  const [activeSound, setActiveSound] = useState(null);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);
  const loadedPacks = useRef(new Set());
  const heldKeys = useRef(new Set());

  // Dirt-samples state
  const [dirtSamplesLoaded, setDirtSamplesLoaded] = useState(false);
  const [dirtSamplesLoading, setDirtSamplesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set(['Drums & Kicks']));
  const [selectedDirtSample, setSelectedDirtSample] = useState(null);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);

  // Build key-to-sound mapping based on current pack
  const getKeyMap = useCallback(() => {
    const map = {};
    const sounds = selectedPack.sounds;
    sounds.forEach((sound, index) => {
      if (index < 8) {
        map[KEY_ROW_1[index]] = sound;
      } else if (index < 16) {
        map[KEY_ROW_2[index - 8]] = sound;
      }
    });
    return map;
  }, [selectedPack]);

  // Get the key label for a sound
  const getKeyForSound = useCallback((sound) => {
    const sounds = selectedPack.sounds;
    const index = sounds.indexOf(sound);
    if (index < 8) return KEY_ROW_1[index]?.toUpperCase();
    if (index < 16) return KEY_ROW_2[index - 8]?.toUpperCase();
    return null;
  }, [selectedPack]);

  // Preload all samples for a pack (called on user interaction)
  const preloadPack = useCallback(async (pack) => {
    const packKey = pack.id;
    if (loadedPacks.current.has(packKey)) {
      return;
    }

    setLoading(true);

    try {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized.current = true;

      const ac = getAudioContext();
      const t = ac.currentTime + 0.01;

      // Preload all sounds in this pack silently
      for (const sound of pack.sounds) {
        const sampleName = pack.useBank
          ? `${pack.id}_${sound}`
          : sound;
        await superdough({ s: sampleName, gain: 0 }, t, 0.01);
      }

      loadedPacks.current.add(packKey);
    } catch (e) {
      console.error('Preload error:', e);
    }

    setLoading(false);
  }, []);

  // Handle drum pack selection from dropdown
  const handlePackChange = useCallback(async (packId) => {
    const pack = DRUM_PACKS.find(p => p.id === packId);
    setSelectedPack(pack);
    setLastPlayed(null);
    await preloadPack(pack);
  }, [preloadPack]);

  // Load dirt-samples from GitHub
  const loadDirtSamples = useCallback(async () => {
    if (dirtSamplesLoaded || dirtSamplesLoading) return;

    setDirtSamplesLoading(true);
    try {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized.current = true;

      // Import and call samples function to register dirt-samples
      const { samples } = await import('@strudel/webaudio');
      await samples('github:tidalcycles/dirt-samples');
      setDirtSamplesLoaded(true);
    } catch (e) {
      console.error('Failed to load dirt-samples:', e);
    }
    setDirtSamplesLoading(false);
  }, [dirtSamplesLoaded, dirtSamplesLoading]);

  // Toggle category expansion
  const toggleCategory = useCallback((category) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  // Filter samples based on search query
  const filteredSamples = searchQuery.trim()
    ? ALL_DIRT_SAMPLES.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const playSound = useCallback(async (soundName) => {
    // Ensure pack is loaded before playing
    if (!loadedPacks.current.has(selectedPack.id)) {
      await preloadPack(selectedPack);
    }

    if (!initialized.current) {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized.current = true;
    }

    setActiveSound(soundName);

    try {
      const ac = getAudioContext();
      const t = ac.currentTime + 0.01;

      if (selectedPack.useBank) {
        // Use bank for drum machines
        await superdough({ s: `${selectedPack.id}_${soundName}` }, t, 1);
      } else {
        // Default sounds
        await superdough({ s: soundName }, t, 1);
      }

      setLastPlayed({ sound: soundName, pack: selectedPack });
    } catch (e) {
      console.error('Sample playback error:', e);
    }

    setTimeout(() => setActiveSound(null), 150);
  }, [selectedPack, preloadPack]);

  // Play a dirt-sample
  const playDirtSample = useCallback(async (sampleName, sampleIndex = 0) => {
    // Ensure dirt-samples are loaded
    if (!dirtSamplesLoaded) {
      await loadDirtSamples();
    }

    const sampleId = `dirt_${sampleName}_${sampleIndex}`;
    setActiveSound(sampleId);
    setSelectedDirtSample(sampleName);
    setSelectedSampleIndex(sampleIndex);

    try {
      const ac = getAudioContext();
      const t = ac.currentTime + 0.01;
      await superdough({ s: sampleName, n: sampleIndex }, t, 1);
      setLastPlayed({ sound: sampleName, sampleIndex, isDirt: true });
    } catch (e) {
      console.error('Dirt sample playback error:', e);
    }

    setTimeout(() => setActiveSound(null), 150);
  }, [dirtSamplesLoaded, loadDirtSamples]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat || loading) return;
      const key = e.key.toLowerCase();

      // Number keys for dirt sample indices when a sample is selected
      const numKey = e.key;
      if (/^[0-9]$/.test(numKey) && !heldKeys.current.has(numKey) && selectedDirtSample) {
        const index = numKey === '0' ? 9 : parseInt(numKey) - 1;
        const sampleInfo = ALL_DIRT_SAMPLES.find((s) => s.name === selectedDirtSample);
        if (sampleInfo && index < sampleInfo.count) {
          heldKeys.current.add(numKey);
          playDirtSample(selectedDirtSample, index);
          return;
        }
      }

      // Letter keys for drum sounds
      const keyMap = getKeyMap();
      if (keyMap[key] && !heldKeys.current.has(key)) {
        heldKeys.current.add(key);
        playSound(keyMap[key]);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      heldKeys.current.delete(key);
      heldKeys.current.delete(e.key); // Also remove the original key for numbers
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [getKeyMap, loading, playSound, selectedDirtSample, playDirtSample]);

  const getCodeString = () => {
    if (!lastPlayed) return null;

    if (lastPlayed.isDirt) {
      const soundCode = lastPlayed.sampleIndex > 0
        ? `sound("${lastPlayed.sound}:${lastPlayed.sampleIndex}")`
        : `sound("${lastPlayed.sound}")`;
      return `samples('github:tidalcycles/dirt-samples')\n${soundCode}`;
    }
    if (lastPlayed.pack?.useBank) {
      return `sound("${lastPlayed.sound}").bank("${lastPlayed.pack.id}")`;
    }
    return `sound("${lastPlayed.sound}")`;
  };

  const client = useClient();
  if (!client) {
    return <div className="p-4 border border-lineHighlight rounded-lg">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Drum Machines Section */}
      <div className="flex flex-col gap-4">
        {/* Header with Pack Selector */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Drum Machines</h3>
          <div className="flex items-center gap-2">
            {loading && <span className="text-sm text-gray-400">Loading...</span>}
            <label className="font-mono text-sm text-gray-400">Sample Pack:</label>
            <select
              value={selectedPack.id}
              onChange={(e) => handlePackChange(e.target.value)}
              className="px-3 py-2 rounded border border-lineHighlight bg-background text-foreground font-mono text-sm"
            >
              {DRUM_PACKS.map(pack => (
                <option key={pack.id} value={pack.id}>{pack.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sound Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-4 border border-lineHighlight rounded-lg bg-background">
          {selectedPack.sounds.map((sound) => (
            <button
              key={sound}
              onClick={() => !loading && playSound(sound)}
              disabled={loading}
              className={`
                px-3 py-4
                rounded-lg
                font-mono text-sm
                border-2 border-lineHighlight
                bg-background
                transition-all duration-100
                flex flex-col items-center gap-1
                ${loading
                  ? 'opacity-50 cursor-wait'
                  : 'hover:bg-lineHighlight active:scale-95 cursor-pointer'
                }
                ${activeSound === sound ? 'bg-lineHighlight scale-95' : ''}
              `}
            >
              <span className="font-bold">{sound}</span>
              <span className="text-xs text-gray-400">{SOUND_LABELS[sound] || sound}</span>
              {getKeyForSound(sound) && (
                <span className="text-xs text-gray-500">({getKeyForSound(sound)})</span>
              )}
            </button>
          ))}
        </div>

        {/* Pack Description */}
        {selectedPack.description && (
          <div className="p-3 border border-lineHighlight rounded-lg bg-background text-sm">
            <p className="text-foreground">{selectedPack.description}</p>
            {selectedPack.examples && (
              <p className="text-gray-400 mt-1">
                <span className="font-semibold">Used in:</span> {selectedPack.examples}
              </p>
            )}
            {selectedPack.wiki && (
              <a
                href={selectedPack.wiki}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 mt-1 inline-block text-xs"
              >
                Learn more on Wikipedia →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Dirt-Samples Section - 2 Column Layout */}
      <div className="flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold">Dirt-Samples</h3>
            <a
              href="https://github.com/tidalcycles/dirt-samples"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              GitHub
            </a>
            <span className="text-xs text-gray-500">({ALL_DIRT_SAMPLES.length} packs)</span>
          </div>
          {!dirtSamplesLoaded && (
            <button
              onClick={loadDirtSamples}
              disabled={dirtSamplesLoading}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded transition-colors"
            >
              {dirtSamplesLoading ? 'Loading...' : 'Load Samples'}
            </button>
          )}
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
          {/* Left Column - Variation Selector & Code */}
          <div className="flex flex-col gap-2 md:sticky md:top-4 md:self-start">
            {/* Selected Sample Variations - Vertical */}
            <div className="border border-lineHighlight rounded-lg p-3 bg-background min-h-[200px]">
              {selectedDirtSample ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold">{selectedDirtSample}</span>
                    <button
                      onClick={() => setSelectedDirtSample(null)}
                      className="text-gray-400 hover:text-gray-300 text-xs"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {ALL_DIRT_SAMPLES.find((s) => s.name === selectedDirtSample)?.count || 0} variations
                  </div>
                  <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                    {Array.from({ length: ALL_DIRT_SAMPLES.find((s) => s.name === selectedDirtSample)?.count || 0 }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => playDirtSample(selectedDirtSample, index)}
                        className={`
                          w-full px-2 py-1 rounded font-mono text-sm text-left
                          border border-lineHighlight
                          transition-all duration-100
                          hover:bg-lineHighlight active:scale-95
                          ${selectedSampleIndex === index && activeSound?.includes(selectedDirtSample)
                            ? 'bg-blue-600 border-blue-500'
                            : 'bg-background'
                          }
                        `}
                      >
                        {selectedDirtSample}:{index}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Keys 1-9, 0
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm">
                  Select a sample to see variations
                </div>
              )}
            </div>

            {/* Code Display */}
            <div className="border border-lineHighlight rounded-lg p-3 bg-background">
              {lastPlayed ? (
                <div className="flex flex-col gap-1">
                  {lastPlayed.isDirt && (
                    <code className="font-mono text-sm break-all text-gray-400 mb-1">
                      samples(<span className="text-green-400">'github:tidalcycles/dirt-samples'</span>)
                    </code>
                  )}
                  <code className="font-mono text-sm break-all">
                    <span className="text-gray-400">sound(</span>
                    {lastPlayed.isDirt && lastPlayed.sampleIndex > 0 ? (
                      <span className="text-cyan-400">"{lastPlayed.sound}:{lastPlayed.sampleIndex}"</span>
                    ) : (
                      <span className="text-cyan-400">"{lastPlayed.sound}"</span>
                    )}
                    <span className="text-gray-400">)</span>
                    {lastPlayed.pack?.useBank && (
                      <>
                        <span className="text-gray-400">.bank(</span>
                        <span className="text-yellow-400">"{lastPlayed.pack.id}"</span>
                        <span className="text-gray-400">)</span>
                      </>
                    )}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(getCodeString())}
                    className="self-start px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors mt-1"
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <span className="text-gray-500 font-mono text-sm">Click a sound</span>
              )}
            </div>
          </div>

          {/* Right Column - Search & Categories */}
          <div className="flex flex-col gap-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search samples..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded border border-lineHighlight bg-background text-foreground font-mono text-sm focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              )}
            </div>

            {/* Search Results */}
            {filteredSamples && (
              <div className="border border-lineHighlight rounded-lg p-3 bg-background">
                <div className="text-sm text-gray-400 mb-2">
                  {filteredSamples.length} results
                </div>
                <div className="flex flex-wrap gap-1 max-h-[400px] overflow-y-auto">
                  {filteredSamples.map(({ name, count }) => (
                    <button
                      key={name}
                      onClick={() => playDirtSample(name, 0)}
                      className={`
                        px-2 py-1 rounded font-mono text-xs
                        border border-lineHighlight
                        transition-all duration-100
                        hover:bg-lineHighlight active:scale-95
                        ${selectedDirtSample === name ? 'bg-lineHighlight border-blue-500' : 'bg-background'}
                      `}
                    >
                      {name}<span className="text-gray-500">({count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {!filteredSamples && (
              <div className="flex flex-col gap-1">
                {Object.entries(DIRT_SAMPLES_CATEGORIES).map(([category, data]) => (
                  <div key={category} className="border border-lineHighlight rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-3 py-2 flex items-center justify-between bg-background hover:bg-lineHighlight transition-colors text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">
                          {expandedCategories.has(category) ? '▼' : '▶'}
                        </span>
                        <span className="font-semibold">{category}</span>
                        <span className="text-xs text-gray-500">
                          ({Object.keys(data.samples).length})
                        </span>
                      </div>
                    </button>

                    {/* Category Samples */}
                    {expandedCategories.has(category) && (
                      <div className="p-2 border-t border-lineHighlight bg-background/50">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(data.samples).map(([name, count]) => (
                            <button
                              key={name}
                              onClick={() => playDirtSample(name, 0)}
                              className={`
                                px-2 py-1 rounded font-mono text-xs
                                border border-lineHighlight
                                transition-all duration-100
                                hover:bg-lineHighlight active:scale-95
                                ${selectedDirtSample === name ? 'bg-lineHighlight border-blue-500' : 'bg-background'}
                              `}
                            >
                              {name}<span className="text-gray-500">({count})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
