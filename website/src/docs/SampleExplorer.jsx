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
  },
  {
    id: 'RolandTR909',
    name: 'TR-909',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cr', 'rd', 'ht', 'mt', 'lt'],
    useBank: true,
  },
  {
    id: 'RolandTR808',
    name: 'TR-808',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb', 'ht', 'mt', 'lt'],
    useBank: true,
  },
  {
    id: 'RolandTR707',
    name: 'TR-707',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb', 'ht', 'mt', 'lt'],
    useBank: true,
  },
  {
    id: 'RolandTR606',
    name: 'TR-606',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp'],
    useBank: true,
  },
  {
    id: 'CasioRZ1',
    name: 'Casio RZ-1',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb'],
    useBank: true,
  },
  {
    id: 'LinnDrum',
    name: 'LinnDrum',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'ht', 'mt', 'lt'],
    useBank: true,
  },
  {
    id: 'AkaiLinn',
    name: 'Akai Linn',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'ht', 'mt', 'lt'],
    useBank: true,
  },
];

// Other sample packs (non-drum sounds)
const OTHER_PACKS = [
  {
    id: 'casio',
    name: 'Casio',
    samples: [':0', ':1', ':2'],
    labels: ['High', 'Low', 'Noise'],
  },
  {
    id: 'jazz',
    name: 'Jazz Kit',
    samples: [':0', ':1', ':2', ':3', ':4', ':5', ':6', ':7'],
    labels: ['BD', 'CB', 'FX', 'HH', 'OH', 'P1', 'P2', 'SN'],
  },
  {
    id: 'east',
    name: 'East Asian',
    samples: [':0', ':1', ':2', ':3', ':4', ':5', ':6', ':7', ':8'],
    labels: ['Wood Block', 'Ohkawa Mute', 'Ohkawa Open', 'Shime Hi', 'Shime Hi 2', 'Shime Mute', 'Taiko 1', 'Taiko 2', 'Taiko 3'],
  },
  {
    id: 'metal',
    name: 'Metal',
    samples: [':0', ':1', ':2', ':3', ':4', ':5', ':6', ':7', ':8', ':9'],
    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },
  {
    id: 'space',
    name: 'Space',
    samples: [':0', ':1', ':2', ':3', ':4', ':5', ':6', ':7', ':8', ':9', ':10', ':11', ':12', ':13', ':14', ':15', ':16', ':17'],
    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'],
  },
  {
    id: 'crow',
    name: 'Crow',
    samples: [':0', ':1', ':2', ':3'],
    labels: ['Crow 1', 'Crow 2', 'Crow 3', 'Crow 4'],
  },
  {
    id: 'insect',
    name: 'Insect',
    samples: [':0', ':1', ':2'],
    labels: ['Conehead', 'Shieldback', 'Katydid'],
  },
  {
    id: 'wind',
    name: 'Wind',
    samples: [':0', ':1', ':2', ':3', ':4', ':5', ':6', ':7', ':8', ':9'],
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  },
  {
    id: 'numbers',
    name: 'Numbers',
    samples: [':0', ':1', ':2', ':3', ':4', ':5', ':6', ':7', ':8'],
    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
  },
];

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
  const [selectedOtherPack, setSelectedOtherPack] = useState(OTHER_PACKS[0]);
  const [activeSound, setActiveSound] = useState(null);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);
  const loadedPacks = useRef(new Set());
  const heldKeys = useRef(new Set());

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

  // Preload other sample pack
  const preloadOtherPack = useCallback(async (pack) => {
    const packKey = `other_${pack.id}`;
    if (loadedPacks.current.has(packKey)) {
      return;
    }

    setLoading(true);

    try {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized.current = true;

      const ac = getAudioContext();
      const t = ac.currentTime + 0.01;

      // Preload all samples in this pack silently
      for (let i = 0; i < pack.samples.length; i++) {
        await superdough({ s: pack.id, n: i, gain: 0 }, t, 0.01);
      }

      loadedPacks.current.add(packKey);
    } catch (e) {
      console.error('Preload error:', e);
    }

    setLoading(false);
  }, []);

  // Handle other pack selection from dropdown
  const handleOtherPackChange = useCallback(async (packId) => {
    const pack = OTHER_PACKS.find(p => p.id === packId);
    setSelectedOtherPack(pack);
    setLastPlayed(null);
    await preloadOtherPack(pack);
  }, [preloadOtherPack]);

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

  // Play a sample from the "other" sample packs (uses sound name with index)
  const playOtherSample = useCallback(async (pack, sampleIndex) => {
    // Ensure pack is loaded before playing
    const packKey = `other_${pack.id}`;
    if (!loadedPacks.current.has(packKey)) {
      await preloadOtherPack(pack);
    }

    const sampleId = `${pack.id}${pack.samples[sampleIndex]}`;
    setActiveSound(sampleId);

    try {
      const ac = getAudioContext();
      const t = ac.currentTime + 0.01;
      await superdough({ s: pack.id, n: sampleIndex }, t, 1);
      setLastPlayed({ sound: pack.id, sampleIndex, pack, isOther: true });
    } catch (e) {
      console.error('Sample playback error:', e);
    }

    setTimeout(() => setActiveSound(null), 150);
  }, [preloadOtherPack]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat || loading) return;
      const key = e.key.toLowerCase();

      // Number keys for other samples (1-9 = indices 0-8, 0 = index 9)
      const numKey = e.key;
      if (/^[0-9]$/.test(numKey) && !heldKeys.current.has(numKey)) {
        const index = numKey === '0' ? 9 : parseInt(numKey) - 1;
        if (index < selectedOtherPack.samples.length) {
          heldKeys.current.add(numKey);
          playOtherSample(selectedOtherPack, index);
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
  }, [getKeyMap, loading, playSound, selectedOtherPack, playOtherSample]);

  const getCodeString = () => {
    if (!lastPlayed) return null;

    if (lastPlayed.isOther) {
      return `sound("${lastPlayed.sound}:${lastPlayed.sampleIndex}")`;
    }
    if (lastPlayed.pack.useBank) {
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
      </div>

      {/* Other Samples Section */}
      <div className="flex flex-col gap-4">
        {/* Header with Pack Selector */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Other Samples</h3>
          <div className="flex items-center gap-2">
            <label className="font-mono text-sm text-gray-400">Sample Pack:</label>
            <select
              value={selectedOtherPack.id}
              onChange={(e) => handleOtherPackChange(e.target.value)}
              className="px-3 py-2 rounded border border-lineHighlight bg-background text-foreground font-mono text-sm"
            >
              {OTHER_PACKS.map(pack => (
                <option key={pack.id} value={pack.id}>{pack.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Other Samples Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-4 border border-lineHighlight rounded-lg bg-background">
          {selectedOtherPack.samples.map((sample, index) => {
            const sampleId = `${selectedOtherPack.id}${sample}`;
            return (
              <button
                key={sample}
                onClick={() => playOtherSample(selectedOtherPack, index)}
                className={`
                  px-3 py-4
                  rounded-lg
                  font-mono text-sm
                  border-2 border-lineHighlight
                  bg-background
                  transition-all duration-100
                  flex flex-col items-center gap-1
                  hover:bg-lineHighlight active:scale-95 cursor-pointer
                  ${activeSound === sampleId ? 'bg-lineHighlight scale-95' : ''}
                `}
              >
                <span className="font-bold">{index}</span>
                <span className="text-xs text-gray-400">{selectedOtherPack.labels[index]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Display */}
      <div className="border border-lineHighlight rounded-lg p-4 bg-background min-h-[60px]">
        {lastPlayed ? (
          <div className="flex flex-col gap-2">
            <code className="font-mono text-lg">
              <span className="text-gray-400">sound(</span>
              {lastPlayed.isOther ? (
                <span className="text-cyan-400">"{lastPlayed.sound}:{lastPlayed.sampleIndex}"</span>
              ) : (
                <span className="text-cyan-400">"{lastPlayed.sound}"</span>
              )}
              <span className="text-gray-400">)</span>
              {!lastPlayed.isOther && lastPlayed.pack.useBank && (
                <>
                  <span className="text-gray-400">.bank(</span>
                  <span className="text-yellow-400">"{lastPlayed.pack.id}"</span>
                  <span className="text-gray-400">)</span>
                </>
              )}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(getCodeString())}
              className="self-start px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              Copy
            </button>
          </div>
        ) : (
          <span className="text-gray-500 font-mono">Click a sound to see the code</span>
        )}
      </div>
    </div>
  );
}
