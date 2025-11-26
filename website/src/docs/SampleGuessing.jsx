import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Drum machine packs - sounds verified against tidal-drum-machines.json
const DRUM_PACKS = [
  {
    id: 'default',
    name: 'Default',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cr', 'rd', 'ht', 'mt', 'lt', 'cb'],
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
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb', 'cr', 'ht', 'mt', 'lt'],
    useBank: true,
  },
  {
    id: 'RolandTR707',
    name: 'TR-707',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb', 'cr', 'ht', 'mt', 'lt'],
    useBank: true,
  },
  {
    id: 'RolandTR606',
    name: 'TR-606',
    // No cp, rim, cb - has cr instead
    sounds: ['bd', 'sd', 'hh', 'oh', 'cr', 'ht', 'lt'],
    useBank: true,
  },
  {
    id: 'CasioRZ1',
    name: 'Casio RZ-1',
    // No oh - has rd instead
    sounds: ['bd', 'sd', 'hh', 'cp', 'rim', 'cb', 'cr', 'rd', 'ht', 'mt', 'lt'],
    useBank: true,
  },
  {
    id: 'LinnDrum',
    name: 'LinnDrum',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb', 'cr', 'rd', 'ht', 'mt', 'lt'],
    useBank: true,
  },
  {
    id: 'AkaiLinn',
    name: 'Akai Linn',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'cb', 'cr', 'rd', 'ht', 'mt', 'lt'],
    useBank: true,
  },
];

// Non-default packs for advanced levels
const BANKED_PACKS = DRUM_PACKS.filter(p => p.useBank);

// Get common sounds across all packs (intersection)
const getCommonSounds = (packs) => {
  if (packs.length === 0) return [];
  let common = [...packs[0].sounds];
  for (let i = 1; i < packs.length; i++) {
    common = common.filter(s => packs[i].sounds.includes(s));
  }
  return common;
};

// Get all sounds across packs (union) - each sound must exist in at least one pack
const getAllSounds = (packs) => {
  const allSounds = new Set();
  for (const pack of packs) {
    for (const sound of pack.sounds) {
      allSounds.add(sound);
    }
  }
  // Return in a consistent order
  return ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb', 'cr', 'rd', 'ht', 'mt', 'lt'].filter(s => allSounds.has(s));
};

// Get common sounds across all banked packs (for level sound pools)
const COMMON_SOUNDS = getCommonSounds(BANKED_PACKS);
const ALL_BANKED_SOUNDS = getAllSounds(BANKED_PACKS);

// Fixed difficulty levels (1-5) - User picks pack at start
// Sounds are filtered at runtime by what's available in the selected pack
const FIXED_LEVELS = [
  {
    id: 0,
    name: 'Level 1',
    description: 'Basic drums',
    sounds: ['bd', 'sd', 'hh'],
    roundsToAdvance: 6,
    useRandomPack: false,
  },
  {
    id: 1,
    name: 'Level 2',
    description: 'Add cymbals',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp'],
    roundsToAdvance: 8,
    useRandomPack: false,
  },
  {
    id: 2,
    name: 'Level 3',
    description: 'Add percussion',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb'],
    roundsToAdvance: 8,
    useRandomPack: false,
  },
  {
    id: 3,
    name: 'Level 4',
    description: 'Add toms',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb', 'ht', 'mt', 'lt'],
    roundsToAdvance: 10,
    useRandomPack: false,
  },
  {
    id: 4,
    name: 'Level 5',
    description: 'Full kit',
    sounds: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'cb', 'cr', 'rd', 'ht', 'mt', 'lt'],
    roundsToAdvance: 10,
    useRandomPack: false,
  },
];

// Generate a level dynamically based on level index
const generateLevel = (levelIndex) => {
  if (levelIndex < FIXED_LEVELS.length) {
    return FIXED_LEVELS[levelIndex];
  }

  // For levels 6+, use sounds across multiple packs
  const dynamicLevelNum = levelIndex - FIXED_LEVELS.length;

  // Level 6: bd, sd, hh from 3 packs = 9 options (single-step)
  // Level 7+: two-step selection (pick sound, then pick machine)
  const baseSounds = ['bd', 'sd', 'hh'];
  const additionalSounds = ['oh', 'cp', 'rim', 'cb', 'cr', 'rd', 'ht', 'mt', 'lt'];
  const soundCount = Math.min(3 + dynamicLevelNum, baseSounds.length + additionalSounds.length);
  const sounds = [...baseSounds, ...additionalSounds].slice(0, soundCount);

  const isTwoStep = levelIndex > FIXED_LEVELS.length; // Level 7+ uses two-step

  return {
    id: levelIndex,
    name: `Level ${levelIndex + 1}`,
    description: isTwoStep ? `${sounds.length} sounds, identify machine` : `${sounds.length} sounds across machines`,
    sounds,
    roundsToAdvance: 10,
    useRandomPack: true,
    twoStep: isTwoStep,
  };
};

// Get level data (fixed or generated)
const getLevel = (levelIndex) => {
  return generateLevel(levelIndex);
};

// Check if there's a next level available
const hasNextLevel = (levelIndex) => {
  if (levelIndex < FIXED_LEVELS.length - 1) return true;
  const dynamicLevelNum = levelIndex - FIXED_LEVELS.length;
  // Level 6 has 3 sounds, Level 7 has 4, etc.
  const nextSoundCount = 3 + dynamicLevelNum + 1;
  return nextSoundCount <= 12; // max 12 sounds
};

// Get all available level indices for display
const getAvailableLevels = () => {
  const levels = [];
  let idx = 0;
  while (idx === 0 || hasNextLevel(idx - 1)) {
    levels.push(idx);
    idx++;
  }
  return levels;
};

const AVAILABLE_LEVELS = getAvailableLevels();

const STORAGE_KEY = 'sampleguessing-progress';

// Get label for a sample
const getSampleLabel = (sound) => {
  return sound;
};

// Get samples for a level
const getSamplesForLevel = (levelIndex) => {
  return getLevel(levelIndex).sounds;
};

// Load progress from localStorage
const loadProgress = () => {
  if (typeof window === 'undefined') return { highestLevel: 0, levelScores: {} };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to load progress:', e);
  }
  return { highestLevel: 0, levelScores: {} };
};

// Save progress to localStorage
const saveProgress = (progress) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
};

// Get grid layout based on number of samples
const getGridClass = (count) => {
  if (count <= 3) return 'grid-cols-3';
  if (count <= 5) return 'grid-cols-3 sm:grid-cols-5';
  if (count <= 8) return 'grid-cols-4 sm:grid-cols-4';
  if (count <= 10) return 'grid-cols-4 sm:grid-cols-5';
  return 'grid-cols-4 sm:grid-cols-6';
};

let samplesPreloaded = false;

export function SampleGuessing() {
  const [gameState, setGameState] = useState('idle'); // idle, loading, selectPack, playing, answered, levelUp, finished
  const [currentSample, setCurrentSample] = useState(null);
  const [currentPack, setCurrentPack] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null); // For fixed levels where user picks pack
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentOptions, setCurrentOptions] = useState([]); // For Level 6: array of {sound, pack} objects
  const [twoStepMode, setTwoStepMode] = useState(false); // For Level 7+: two-step selection
  const [selectedSound, setSelectedSound] = useState(null); // For Level 7+: first step selection
  const [availablePacks, setAvailablePacks] = useState([]); // For Level 7+: packs to choose from in step 2
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState(0);
  const [progress, setProgress] = useState(() => loadProgress());
  const [repeatProgress, setRepeatProgress] = useState(0);
  const initialized = useRef(false);
  const repeatIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const usedSamples = useRef(new Set());
  const usedPacks = useRef(new Set());

  const currentLevel = getLevel(level);
  const currentSamples = getSamplesForLevel(level);
  const totalRounds = currentLevel.roundsToAdvance;

  const initAudio = useCallback(async () => {
    if (!initialized.current) {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized.current = true;
    }
  }, []);

  const preloadSamples = useCallback(async () => {
    if (samplesPreloaded) return;
    await initAudio();
    const ac = getAudioContext();
    const t = ac.currentTime + 0.01;

    // Preload all drum machine samples (default and banked)
    for (const pack of DRUM_PACKS) {
      for (const sound of pack.sounds) {
        if (pack.useBank) {
          await superdough({ s: sound, bank: pack.id, gain: 0 }, t, 0.01);
        } else {
          await superdough({ s: sound, gain: 0 }, t, 0.01);
        }
      }
    }

    samplesPreloaded = true;
  }, [initAudio]);

  const playSample = useCallback(async (sound, pack = null) => {
    await initAudio();
    const ac = getAudioContext();
    const t = ac.currentTime + 0.01;

    if (pack && pack.useBank) {
      await superdough({ s: sound, bank: pack.id, gain: 0.8 }, t, 1);
    } else {
      await superdough({ s: sound, gain: 0.8 }, t, 1);
    }
  }, [initAudio]);

  const stopRepeat = useCallback(() => {
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setRepeatProgress(0);
  }, []);

  const startRepeat = useCallback((sound, pack) => {
    stopRepeat();
    // Play immediately
    playSample(sound, pack);
    setRepeatProgress(0);

    // Update progress bar every 50ms (2000ms / 50ms = 40 steps)
    const progressStep = 100 / 40; // 2.5% per step
    progressIntervalRef.current = setInterval(() => {
      setRepeatProgress(prev => {
        if (prev >= 100) return 0;
        return prev + progressStep;
      });
    }, 50);

    // Then repeat every 2 seconds
    repeatIntervalRef.current = setInterval(() => {
      playSample(sound, pack);
      setRepeatProgress(0);
    }, 2000);
  }, [playSample, stopRepeat]);

  const startGame = useCallback(async (startLevel = 0) => {
    setGameState('loading');
    await preloadSamples();
    usedSamples.current.clear();
    usedPacks.current.clear();
    setScore({ correct: 0, total: 0 });
    setRound(1);
    setLevel(startLevel);
    setCurrentSample(null);
    setCurrentPack(null);
    setSelectedPack(null);

    // For fixed levels, show pack selection first
    const lvl = getLevel(startLevel);
    if (!lvl.useRandomPack) {
      setGameState('selectPack');
    } else {
      setGameState('playing');
    }
  }, [preloadSamples]);

  const selectPackAndStart = useCallback((pack) => {
    setSelectedPack(pack);
    setCurrentPack(pack);
    setGameState('playing');
    needsFirstQuestion.current = true;
  }, []);

  const nextQuestion = useCallback((roundNum, levelIdx) => {
    const lvl = getLevel(levelIdx);
    const samples = getSamplesForLevel(levelIdx);

    if (roundNum > lvl.roundsToAdvance) {
      if (hasNextLevel(levelIdx)) {
        setGameState('levelUp');
      } else {
        setGameState('finished');
      }
      stopRepeat();
      return;
    }

    let sample, pack, options;

    if (lvl.useRandomPack) {
      const numPacks = lvl.twoStep ? 5 : 3; // Level 7+ uses 5 packs, Level 6 uses 3

      // Get packs that have all the required sounds, then shuffle and pick 3
      const eligiblePacks = BANKED_PACKS.filter(p =>
        samples.every(s => p.sounds.includes(s))
      );
      const shuffledPacks = [...eligiblePacks].sort(() => Math.random() - 0.5);
      const selectedPacks = shuffledPacks.slice(0, numPacks);

      if (lvl.twoStep) {
        // Level 7+: Two-step selection mode
        // Pick a random sound and pack as the correct answer
        sample = samples[Math.floor(Math.random() * samples.length)];
        pack = selectedPacks[Math.floor(Math.random() * selectedPacks.length)];

        setTwoStepMode(true);
        setSelectedSound(null);
        setAvailablePacks(selectedPacks);
        setCurrentOptions([]);
      } else {
        // Level 6: Single-step with 3x3 grid
        // Create all combinations: each sound from each pack
        options = [];
        for (const sound of samples) {
          for (const p of selectedPacks) {
            options.push({ sound, pack: p });
          }
        }

        // Shuffle the options
        options = options.sort(() => Math.random() - 0.5);

        // Pick one option as the correct answer
        const correctOption = options[Math.floor(Math.random() * options.length)];
        sample = correctOption.sound;
        pack = correctOption.pack;

        setTwoStepMode(false);
        setCurrentOptions(options);
      }
    } else {
      // Fixed levels (1-5): Use the user-selected pack for all sounds
      pack = selectedPack;
      const availableSounds = samples.filter(s => pack.sounds.includes(s));

      // Pick a random sample, avoiding recent repeats
      let attempts = 0;
      const maxAttempts = 50;
      do {
        sample = availableSounds[Math.floor(Math.random() * availableSounds.length)];
        attempts++;
      } while (usedSamples.current.has(sample) && attempts < maxAttempts && usedSamples.current.size < availableSounds.length);

      // Keep track of last few samples to avoid immediate repeats
      usedSamples.current.add(sample);
      if (usedSamples.current.size > Math.min(3, availableSounds.length - 1)) {
        const oldest = usedSamples.current.values().next().value;
        usedSamples.current.delete(oldest);
      }

      setCurrentOptions([]);
    }

    setCurrentSample(sample);
    setCurrentPack(pack);
    setSelectedAnswer(null);
    setRound(roundNum);

    setTimeout(() => {
      startRepeat(sample, pack);
    }, 300);
  }, [startRepeat, stopRepeat, selectedPack]);

  const handleAnswer = useCallback((answer) => {
    if (gameState !== 'playing') return;

    stopRepeat();
    setSelectedAnswer(answer);
    setGameState('answered');

    // For Level 6 (single-step), answer is {sound, pack}. For fixed levels, answer is just the sound string.
    const isCorrect = currentOptions.length > 0
      ? (answer.sound === currentSample && answer.pack.id === currentPack.id)
      : (answer === currentSample);

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      // Auto-advance on correct answer after showing green
      setTimeout(() => {
        setGameState('playing');
        nextQuestion(round + 1, level);
      }, 500);
    }
  }, [gameState, currentSample, currentPack, currentOptions, stopRepeat, round, level, nextQuestion]);

  // Two-step mode: Step 1 - select sound
  const handleSoundSelect = useCallback((sound) => {
    if (gameState !== 'playing') return;
    setSelectedSound(sound);
  }, [gameState]);

  // Two-step mode: Step 2 - select pack (final answer)
  const handlePackSelect = useCallback((pack) => {
    if (gameState !== 'playing' || !selectedSound) return;

    stopRepeat();
    const answer = { sound: selectedSound, pack };
    setSelectedAnswer(answer);
    setGameState('answered');

    const isCorrect = selectedSound === currentSample && pack.id === currentPack.id;

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      // Auto-advance on correct answer after showing green
      setTimeout(() => {
        setGameState('playing');
        nextQuestion(round + 1, level);
      }, 500);
    }
  }, [gameState, selectedSound, currentSample, currentPack, stopRepeat, round, level, nextQuestion]);

  const handleNext = useCallback(() => {
    setGameState('playing');
    nextQuestion(round + 1, level);
  }, [round, level, nextQuestion]);

  const handleNextLevel = useCallback(() => {
    const newLevel = level + 1;
    const newLevelData = getLevel(newLevel);

    // Update progress
    const newProgress = {
      ...progress,
      highestLevel: Math.max(progress.highestLevel, newLevel),
      levelScores: {
        ...progress.levelScores,
        [level]: { correct: score.correct, total: score.total }
      }
    };
    setProgress(newProgress);
    saveProgress(newProgress);

    usedSamples.current.clear();
    usedPacks.current.clear();
    setScore({ correct: 0, total: 0 });
    setRound(1);
    setLevel(newLevel);
    setCurrentSample(null);
    setCurrentPack(null);
    setSelectedPack(null);

    // For fixed levels, show pack selection first
    if (!newLevelData.useRandomPack) {
      setGameState('selectPack');
    } else {
      setGameState('playing');
      // Trigger first question for new level
      setTimeout(() => {
        nextQuestion(1, newLevel);
      }, 100);
    }
  }, [level, score, progress, nextQuestion]);

  const handleFinish = useCallback(() => {
    const newProgress = {
      ...progress,
      highestLevel: Math.max(progress.highestLevel, level + 1),
      levelScores: {
        ...progress.levelScores,
        [level]: { correct: score.correct, total: score.total }
      }
    };
    setProgress(newProgress);
    saveProgress(newProgress);
    setGameState('idle');
  }, [level, score, progress]);

  // Trigger first question when game starts
  const needsFirstQuestion = useRef(false);
  useEffect(() => {
    if (gameState === 'playing' && round === 1 && !currentSample) {
      if (needsFirstQuestion.current) {
        needsFirstQuestion.current = false;
        nextQuestion(1, level);
      }
    }
  }, [gameState, round, level, currentSample, nextQuestion]);

  useEffect(() => {
    if (gameState === 'loading') {
      needsFirstQuestion.current = true;
    }
  }, [gameState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRepeat();
    };
  }, [stopRepeat]);


  const client = useClient();
  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Level Selection - show in idle state */}
      {gameState === 'idle' && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Select Level</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AVAILABLE_LEVELS.map((idx) => {
              const lvl = getLevel(idx);
              const levelScore = progress.levelScores[idx];
              const samples = getSamplesForLevel(idx);

              return (
                <button
                  key={idx}
                  onClick={() => startGame(idx)}
                  className={`
                    p-4 rounded-lg text-left transition-all border
                    bg-gray-800 hover:bg-gray-700 border-gray-600 cursor-pointer
                    ${idx === progress.highestLevel ? 'border-cyan-500 ring-1 ring-cyan-500/30' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{lvl.name}</span>
                    {levelScore && (
                      <span className="text-xs text-green-400">
                        {levelScore.correct}/{levelScore.total}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{lvl.description}</div>
                  <div className="text-xs text-gray-500">{samples.length} sounds</div>
                </button>
              );
            })}
          </div>

          {progress.highestLevel > 0 && (
            <button
              onClick={() => {
                setProgress({ highestLevel: 0, levelScores: {} });
                saveProgress({ highestLevel: 0, levelScores: {} });
              }}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Reset Progress
            </button>
          )}
        </div>
      )}

      {/* Score - show during game (not during loading or pack selection) */}
      {gameState !== 'idle' && gameState !== 'loading' && gameState !== 'selectPack' && (
        <div className="bg-background border border-lineHighlight rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-400">{currentLevel.name}</span>
              <span className="text-xs text-gray-500">({currentSamples.length} sounds)</span>
            </div>
            <div className="text-sm text-gray-400">{currentLevel.description}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="font-mono text-sm">
              Round: <span className="text-cyan-400">{Math.min(round, totalRounds)}</span> / {totalRounds}
            </div>
            <div className="font-mono text-sm">
              Score: <span className="text-green-400">{score.correct}</span> / {score.total}
            </div>
          </div>
        </div>
      )}

      {/* Game area */}
      <div className="bg-background border border-lineHighlight rounded-lg p-6">
        {gameState === 'loading' && (
          <div className="text-center py-8">
            <div className="text-xl text-gray-400 mb-2">Loading samples...</div>
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {gameState === 'selectPack' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-cyan-400 mb-2">{currentLevel.name}</h3>
              <p className="text-gray-400 text-sm">Choose a drum machine to practice with:</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DRUM_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => selectPackAndStart(pack)}
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-all cursor-pointer border border-gray-600 hover:border-cyan-500"
                >
                  <div className="font-bold text-white">{pack.name}</div>
                </button>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => setGameState('idle')}
                className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
              >
                ← Back to Levels
              </button>
            </div>
          </div>
        )}

        {gameState === 'levelUp' && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-green-400">Level Complete!</h2>
            <p className="text-4xl font-mono">
              <span className="text-green-400">{score.correct}</span>
              <span className="text-gray-500"> / </span>
              <span>{score.total}</span>
            </p>
            <p className="text-lg text-gray-400">
              Ready for {getLevel(level + 1).name}
            </p>
            <p className="text-sm text-gray-500">
              {getLevel(level + 1).description}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setGameState('idle')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Back to Levels
              </button>
              <button
                onClick={handleNextLevel}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
              >
                {getLevel(level + 1).name} →
              </button>
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-green-400">All Levels Complete!</h2>
            <p className="text-4xl font-mono">
              <span className="text-green-400">{score.correct}</span>
              <span className="text-gray-500"> / </span>
              <span>{score.total}</span>
            </p>
            <p className="text-lg text-gray-400">
              You've mastered all the samples!
            </p>
            <button
              onClick={handleFinish}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
            >
              Back to Levels
            </button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'answered') && (
          <div className="space-y-6">
            {/* Sound pool display */}
            <div className="text-center text-sm text-gray-400 mb-4 flex items-center justify-center gap-2">
              <span>Which sound is playing?</span>
              <button
                onClick={() => playSample(currentSample, currentPack)}
                className="text-3xl hover:scale-110 transition-transform"
                title="Play sound"
              >
                🔊
              </button>
            </div>

            {/* Answer options - Level 7+ uses two-step, Level 6 uses single grid, fixed levels use currentSamples */}
            {twoStepMode ? (
              // Level 7+: Two-step selection
              <div className="space-y-4">
                {/* Step 1: Sound selection */}
                <div>
                  <div className="text-xs text-gray-500 mb-2 text-center">
                    {gameState === 'answered' ? 'Answer:' : (selectedSound ? 'Sound selected - now pick the machine:' : 'Step 1: Pick the sound')}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {currentSamples.map((sound) => {
                      const isThisSound = selectedSound === sound;
                      const showResult = gameState === 'answered';
                      const isCorrectSound = sound === currentSample;

                      let bgColor = 'bg-gray-700 hover:bg-gray-600';
                      if (showResult) {
                        if (isCorrectSound && selectedAnswer?.sound === sound) {
                          bgColor = selectedAnswer?.pack?.id === currentPack.id ? 'bg-green-600' : 'bg-yellow-600';
                        } else if (selectedAnswer?.sound === sound && !isCorrectSound) {
                          bgColor = 'bg-red-600';
                        } else if (isCorrectSound) {
                          bgColor = 'bg-green-600/50';
                        } else {
                          bgColor = 'bg-gray-800';
                        }
                      } else if (isThisSound) {
                        bgColor = 'bg-cyan-600';
                      }

                      return (
                        <button
                          key={sound}
                          onClick={() => {
                            if (gameState === 'answered') {
                              // Play this sound with the correct pack so user can compare
                              playSample(sound, currentPack);
                            } else {
                              handleSoundSelect(sound);
                            }
                          }}
                          className={`
                            p-3 rounded-lg font-mono text-center transition-all cursor-pointer
                            ${bgColor}
                          `}
                        >
                          <div className="text-sm font-bold">{getSampleLabel(sound)}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Pack selection - only show when sound is selected or answered */}
                {(selectedSound || gameState === 'answered') && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2 text-center">
                      {gameState === 'answered' ? '' : 'Step 2: Pick the drum machine'}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {availablePacks.map((pack) => {
                        const showResult = gameState === 'answered';
                        const isCorrectPack = pack.id === currentPack.id;
                        const isSelectedPack = selectedAnswer?.pack?.id === pack.id;

                        let bgColor = 'bg-gray-700 hover:bg-gray-600';
                        let labelColor = 'text-white';
                        if (showResult) {
                          if (isCorrectPack && isSelectedPack) {
                            bgColor = 'bg-green-600';
                          } else if (isSelectedPack && !isCorrectPack) {
                            bgColor = 'bg-red-600';
                          } else if (isCorrectPack) {
                            bgColor = 'bg-green-600/50';
                          } else {
                            bgColor = 'bg-gray-800';
                          }
                        }

                        return (
                          <button
                            key={pack.id}
                            onClick={() => {
                              if (gameState === 'answered') {
                                // Play the correct sound with this pack so user can compare machines
                                playSample(currentSample, pack);
                              } else {
                                handlePackSelect(pack);
                              }
                            }}
                            className={`
                              p-4 rounded-lg text-center transition-all cursor-pointer
                              ${bgColor}
                            `}
                          >
                            <div className={`text-base font-bold ${labelColor}`}>{pack.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : currentOptions.length > 0 ? (
              // Level 6: Each option has its own pack - use larger grid
              <div className="grid grid-cols-3 gap-3">
                {currentOptions.map((option, idx) => {
                  const isSelected = selectedAnswer && selectedAnswer.sound === option.sound && selectedAnswer.pack.id === option.pack.id;
                  const isCorrect = option.sound === currentSample && option.pack.id === currentPack.id;
                  const showResult = gameState === 'answered';

                  let bgColor = 'bg-gray-700 hover:bg-gray-600';
                  let labelColor = 'text-gray-400';
                  if (showResult) {
                    if (isCorrect) {
                      bgColor = 'bg-green-600 hover:bg-green-500';
                      labelColor = 'text-green-100';
                    } else if (isSelected && !isCorrect) {
                      bgColor = 'bg-red-600 hover:bg-red-500';
                      labelColor = 'text-red-100';
                    } else {
                      bgColor = 'bg-gray-800 hover:bg-gray-700';
                    }
                  }

                  return (
                    <button
                      key={`${option.sound}-${option.pack.id}`}
                      onClick={() => {
                        if (gameState === 'answered') {
                          playSample(option.sound, option.pack);
                        } else {
                          handleAnswer(option);
                        }
                      }}
                      className={`
                        p-4 rounded-lg font-mono text-center transition-all cursor-pointer
                        ${bgColor}
                      `}
                    >
                      <div className="text-base font-bold">{getSampleLabel(option.sound)}</div>
                      <div className={`text-sm font-normal ${labelColor}`}>({option.pack.name})</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Fixed levels: All options use the same pack
              <div className={`grid ${getGridClass(currentSamples.length)} gap-2`}>
                {currentSamples.map((sample) => {
                  const isSelected = selectedAnswer === sample;
                  const isCorrect = currentSample === sample;
                  const showResult = gameState === 'answered';

                  let bgColor = 'bg-gray-700 hover:bg-gray-600';
                  if (showResult) {
                    if (isCorrect) {
                      bgColor = 'bg-green-600 hover:bg-green-500';
                    } else if (isSelected && !isCorrect) {
                      bgColor = 'bg-red-600 hover:bg-red-500';
                    } else {
                      bgColor = 'bg-gray-800 hover:bg-gray-700';
                    }
                  }

                  return (
                    <button
                      key={sample}
                      onClick={() => {
                        if (gameState === 'answered') {
                          playSample(sample, currentPack);
                        } else {
                          handleAnswer(sample);
                        }
                      }}
                      className={`
                        p-3 rounded-lg font-mono text-center transition-all cursor-pointer
                        ${bgColor}
                      `}
                    >
                      <div className="text-sm font-bold">{getSampleLabel(sample)}</div>
                      {currentPack && (
                        <div className="text-xs text-gray-400 font-normal">({currentPack.name})</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Feedback - only show details on wrong answer */}
            {gameState === 'answered' && (
              twoStepMode
                ? !(selectedAnswer && selectedAnswer.sound === currentSample && selectedAnswer.pack.id === currentPack.id)
                : currentOptions.length > 0
                  ? !(selectedAnswer && selectedAnswer.sound === currentSample && selectedAnswer.pack.id === currentPack.id)
                  : selectedAnswer !== currentSample
            ) && (
              <div className="text-center space-y-3">
                <p className="text-red-400 text-xl">
                  It was <span className="font-bold">{getSampleLabel(currentSample)}</span>
                  {currentPack && currentPack.useBank && (
                    <span className="text-gray-400"> ({currentPack.name})</span>
                  )}
                </p>

                {/* Code display */}
                <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm inline-block">
                  <code>
                    {currentPack && currentPack.useBank ? (
                      <>sound("<span className="text-cyan-400">{currentSample}</span>").bank("<span className="text-cyan-400">{currentPack.id}</span>")</>
                    ) : (
                      <>sound("<span className="text-cyan-400">{currentSample}</span>")</>
                    )}
                  </code>
                </div>

                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                >
                  {round >= totalRounds ? 'See Results' : 'Next'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sound pool reference - show during game (not for Level 6+ since options already show packs/sounds) */}
      {gameState !== 'idle' && gameState !== 'loading' && gameState !== 'selectPack' && currentOptions.length === 0 && !twoStepMode && (
        <div className="bg-background border border-lineHighlight rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-2">Sounds in this level:</div>
          <div className="flex flex-wrap gap-2">
            {currentSamples.map(sample => (
              <span
                key={sample}
                className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300"
              >
                {getSampleLabel(sample)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
