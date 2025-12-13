import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAudioContext, initAudioOnFirstClick, superdough } from '@strudel/webaudio';
import { prebake } from '../repl/prebake.mjs';
import { loadModules } from '../repl/util.mjs';
import useClient from '@src/useClient.mjs';
import { MiniRepl } from './MiniRepl';

let prebaked, modulesLoading, audioReady;
if (typeof window !== 'undefined') {
  prebaked = prebake();
  modulesLoading = loadModules();
  audioReady = initAudioOnFirstClick();
}

// Spatial effects for Level 1 (effect type identification)
const SPATIAL_EFFECTS = {
  pan: {
    id: 'pan',
    name: 'Pan',
    description: 'Stereo positioning',
    params: { pan: 0.15 },
    code: '.pan(0.15)',
  },
  room: {
    id: 'room',
    name: 'Reverb',
    description: 'Spacious room echo',
    params: { room: 0.8, size: 6 },
    code: '.room(0.8).size(6)',
  },
  delay: {
    id: 'delay',
    name: 'Delay',
    description: 'Rhythmic echo',
    params: { delay: 0.6, delaytime: 0.25, delayfeedback: 0.5 },
    code: '.delay(0.6).delaytime(0.25).delayfeedback(0.5)',
  },
};

// Magnitude options for Level 2
const PAN_MAGNITUDES = [
  { id: 'pan-left', name: 'Hard Left', params: { pan: 0.1 }, code: '.pan(0.1)' },
  { id: 'pan-center', name: 'Center', params: { pan: 0.5 }, code: '.pan(0.5)' },
  { id: 'pan-right', name: 'Hard Right', params: { pan: 0.9 }, code: '.pan(0.9)' },
];

const ROOM_MAGNITUDES = [
  { id: 'room-small', name: 'Small Room', params: { room: 0.3, size: 1 }, code: '.room(0.3).size(1)' },
  { id: 'room-medium', name: 'Medium Room', params: { room: 0.5, size: 4 }, code: '.room(0.5).size(4)' },
  { id: 'room-large', name: 'Large Hall', params: { room: 0.9, size: 12 }, code: '.room(0.9).size(12)' },
];

const DELAY_MAGNITUDES = [
  { id: 'delay-subtle', name: 'Subtle', params: { delay: 0.3, delaytime: 0.15, delayfeedback: 0.3 }, code: '.delay(0.3).delaytime(0.15)' },
  { id: 'delay-medium', name: 'Medium', params: { delay: 0.5, delaytime: 0.25, delayfeedback: 0.5 }, code: '.delay(0.5).delaytime(0.25)' },
  { id: 'delay-heavy', name: 'Heavy', params: { delay: 0.8, delaytime: 0.35, delayfeedback: 0.7 }, code: '.delay(0.8).delaytime(0.35).delayfeedback(0.7)' },
];

const MAGNITUDE_MAP = {
  pan: { label: 'Pan', magnitudes: PAN_MAGNITUDES },
  room: { label: 'Reverb', magnitudes: ROOM_MAGNITUDES },
  delay: { label: 'Delay', magnitudes: DELAY_MAGNITUDES },
};

// Generate MiniRepl code with sliders for each effect type
const getSliderCode = (effectType, sound) => {
  const note = sound?.note || 'C4';
  const s = sound?.s || 'sawtooth';

  if (effectType === 'pan') {
    return `const pan = slider(0.5, 0, 1)

note("${note}").s("${s}").pan(pan)`;
  } else if (effectType === 'room') {
    return `const room = slider(0.5, 0, 1)
const size = slider(4, 0.5, 12)

note("${note}").s("${s}").room(room).size(size)`;
  } else if (effectType === 'delay') {
    return `const amount = slider(0.5, 0, 1)
const time = slider(0.25, 0.1, 0.5)
const feedback = slider(0.5, 0, 0.8)

note("${note}").s("${s}").delay(amount).delaytime(time).delayfeedback(feedback)`;
  }
  return `note("${note}").s("${s}")`;
};

// Difficulty levels
const DIFFICULTY_LEVELS = [
  {
    id: 0,
    name: 'Level 1',
    description: 'Identify spatial effect type',
    type: 'effect-type',
    roundsToAdvance: 6,
    timeLimit: 15000,
  },
  {
    id: 1,
    name: 'Level 2',
    description: 'Identify effect magnitude',
    type: 'magnitude',
    roundsToAdvance: 8,
    timeLimit: 12000,
  },
  {
    id: 2,
    name: 'Level 3',
    description: 'Identify effect in layered sounds',
    type: 'layered',
    roundsToAdvance: 8,
    timeLimit: 15000,
  },
];

const STORAGE_KEY = 'auditoryspace-progress';

// Module-level flag to track if sounds are preloaded
let soundsPreloaded = false;

// Sound sources for Level 1 and 2
const SOUND_SOURCES = [
  { s: 'sawtooth', note: 'C4', duration: 1.5 },
  { s: 'square', note: 'E4', duration: 1.5 },
  { s: 'triangle', note: 'G3', duration: 1.5 },
  { s: 'piano', note: 'C4', duration: 1.5 },
  { s: 'piano', note: 'E4', duration: 1.5 },
];

// Sound pairs for Level 3 (layered sounds)
const SOUND_PAIRS = [
  {
    id: 'bass-lead',
    name: 'Bass & Lead',
    sound1: { s: 'sawtooth', note: 'C2', duration: 2, label: 'Bass' },
    sound2: { s: 'triangle', note: 'E5', duration: 2, label: 'Lead' },
  },
  {
    id: 'pad-melody',
    name: 'Pad & Melody',
    sound1: { s: 'sine', note: 'G3', duration: 2, label: 'Pad' },
    sound2: { s: 'square', note: 'C5', duration: 2, label: 'Melody' },
  },
  {
    id: 'low-high',
    name: 'Low & High',
    sound1: { s: 'triangle', note: 'E2', duration: 2, label: 'Low' },
    sound2: { s: 'sawtooth', note: 'G5', duration: 2, label: 'High' },
  },
];

// Load/save progress
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

const saveProgress = (progress) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
};

export function AuditorySpaceQuiz() {
  const [gameState, setGameState] = useState('idle'); // idle, loading, playing, answered, levelUp, finished
  const [currentEffect, setCurrentEffect] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_LEVELS[0].timeLimit);
  const [progress, setProgress] = useState(() => loadProgress());
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [isPlayingDry, setIsPlayingDry] = useState(false);
  const [isPlayingWet, setIsPlayingWet] = useState(false);

  // Level 2 specific state
  const [currentEffectType, setCurrentEffectType] = useState(null);

  // Level 3 specific state
  const [currentPair, setCurrentPair] = useState(null);
  const [targetSoundIndex, setTargetSoundIndex] = useState(0); // 0 = sound1, 1 = sound2
  const [isPlayingLayered, setIsPlayingLayered] = useState(false);

  const initialized = useRef(false);
  const countdownRef = useRef(null);
  const usedEffects = useRef(new Set());
  const autoAdvanceRef = useRef(null);
  const previousEffectTypeRef = useRef(null); // Track previous effect type for Level 2

  const currentLevel = DIFFICULTY_LEVELS[level] || DIFFICULTY_LEVELS[DIFFICULTY_LEVELS.length - 1];

  const initAudio = useCallback(async () => {
    if (!initialized.current) {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized.current = true;
    }
  }, []);

  const preloadSounds = useCallback(async () => {
    if (soundsPreloaded) return;
    await initAudio();
    const ac = getAudioContext();
    const t = ac.currentTime + 0.01;

    // Preload single sounds
    for (const sound of SOUND_SOURCES) {
      await superdough({ s: sound.s, note: sound.note, gain: 0 }, t, 0.01);
    }

    // Preload layered sounds
    for (const pair of SOUND_PAIRS) {
      await superdough({ s: pair.sound1.s, note: pair.sound1.note, gain: 0 }, t, 0.01);
      await superdough({ s: pair.sound2.s, note: pair.sound2.note, gain: 0 }, t, 0.01);
    }

    soundsPreloaded = true;
  }, [initAudio]);

  const playSound = useCallback(async (sound, effectParams = null, delay = 0) => {
    await initAudio();
    const ac = getAudioContext();
    const t = ac.currentTime + delay + 0.01;

    const params = {
      s: sound.s,
      note: sound.note,
      gain: 0.6,
    };

    if (effectParams) {
      Object.assign(params, effectParams);
    }

    await superdough(params, t, sound.duration);
  }, [initAudio]);

  // Level 1 & 2: Play dry then wet comparison
  const playComparison = useCallback(async (sound, effect) => {
    setIsPlayingDry(true);
    await playSound(sound, null, 0);

    setTimeout(() => {
      setIsPlayingDry(false);
      setIsPlayingWet(true);
      playSound(sound, effect.params, 0);

      setTimeout(() => {
        setIsPlayingWet(false);
      }, sound.duration * 1000);
    }, (sound.duration + 0.3) * 1000);
  }, [playSound]);

  // Level 3: Play layered sounds together
  const playLayered = useCallback(async (pair, effectParams, effectOnSound1) => {
    await initAudio();
    const ac = getAudioContext();
    const t = ac.currentTime + 0.01;

    setIsPlayingLayered(true);

    const sound1Params = {
      s: pair.sound1.s,
      note: pair.sound1.note,
      gain: 0.5,
      ...(effectOnSound1 ? effectParams : {}),
    };

    const sound2Params = {
      s: pair.sound2.s,
      note: pair.sound2.note,
      gain: 0.5,
      ...(!effectOnSound1 ? effectParams : {}),
    };

    await Promise.all([
      superdough(sound1Params, t, pair.sound1.duration),
      superdough(sound2Params, t, pair.sound2.duration),
    ]);

    setTimeout(() => {
      setIsPlayingLayered(false);
    }, Math.max(pair.sound1.duration, pair.sound2.duration) * 1000);
  }, [initAudio]);

  const playEffectDemo = useCallback(async (effectId) => {
    if (!currentSound) return;
    let effect;

    if (currentLevel.type === 'magnitude' && currentEffectType) {
      const magnitudes = MAGNITUDE_MAP[currentEffectType].magnitudes;
      effect = magnitudes.find(m => m.id === effectId);
    } else {
      effect = SPATIAL_EFFECTS[effectId];
    }

    if (!effect) return;
    await playSound(currentSound, effect.params, 0);
  }, [currentSound, currentLevel.type, currentEffectType, playSound]);

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startCountdown = useCallback((timeLimit) => {
    stopCountdown();
    setTimeLeft(timeLimit);
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) return 0;
        return prev - 100;
      });
    }, 100);
  }, [stopCountdown]);

  const startGame = useCallback(async (startLevel = 0) => {
    setGameState('loading');
    await preloadSounds();
    usedEffects.current.clear();
    previousEffectTypeRef.current = null; // Reset for Level 2
    setScore({ correct: 0, total: 0 });
    setRound(1);
    setLevel(startLevel);
    setCurrentEffect(null);
    setCurrentSound(null);
    setCurrentEffectType(null);
    setCurrentPair(null);
    setGameState('playing');
  }, [preloadSounds]);

  const nextQuestion = useCallback((roundNum, levelIdx) => {
    const lvl = DIFFICULTY_LEVELS[levelIdx] || DIFFICULTY_LEVELS[DIFFICULTY_LEVELS.length - 1];

    if (roundNum > lvl.roundsToAdvance) {
      if (levelIdx < DIFFICULTY_LEVELS.length - 1) {
        setGameState('levelUp');
      } else {
        setGameState('finished');
      }
      stopCountdown();
      return;
    }

    if (lvl.type === 'effect-type') {
      // Level 1: Pick random spatial effect
      const effectKeys = Object.keys(SPATIAL_EFFECTS);
      let effectId;
      let attempts = 0;
      do {
        effectId = effectKeys[Math.floor(Math.random() * effectKeys.length)];
        attempts++;
      } while (usedEffects.current.has(effectId) && attempts < 20 && usedEffects.current.size < effectKeys.length - 1);

      usedEffects.current.add(effectId);
      if (usedEffects.current.size > 2) {
        const oldest = usedEffects.current.values().next().value;
        usedEffects.current.delete(oldest);
      }

      const effect = SPATIAL_EFFECTS[effectId];
      const sound = SOUND_SOURCES[Math.floor(Math.random() * SOUND_SOURCES.length)];

      setCurrentEffect(effect);
      setCurrentSound(sound);
      setSelectedAnswer(null);
      setRound(roundNum);
      setCurrentEffectType(null);
      setCurrentPair(null);

      setTimeout(() => {
        playComparison(sound, effect);
        startCountdown(lvl.timeLimit);
      }, 300);

    } else if (lvl.type === 'magnitude') {
      // Level 2: Pick random effect type (different from previous), then random magnitude
      const effectTypes = Object.keys(MAGNITUDE_MAP);
      let effectType;
      // Ensure we don't pick the same effect type twice in a row
      const availableTypes = effectTypes.filter(t => t !== previousEffectTypeRef.current);
      if (availableTypes.length > 0) {
        effectType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      } else {
        effectType = effectTypes[Math.floor(Math.random() * effectTypes.length)];
      }
      previousEffectTypeRef.current = effectType;

      const magnitudes = MAGNITUDE_MAP[effectType].magnitudes;
      const magnitude = magnitudes[Math.floor(Math.random() * magnitudes.length)];
      const sound = SOUND_SOURCES[Math.floor(Math.random() * SOUND_SOURCES.length)];

      setCurrentEffect(magnitude);
      setCurrentSound(sound);
      setSelectedAnswer(null);
      setRound(roundNum);
      setCurrentEffectType(effectType);
      setCurrentPair(null);

      setTimeout(() => {
        playComparison(sound, magnitude);
        startCountdown(lvl.timeLimit);
      }, 300);

    } else if (lvl.type === 'layered') {
      // Level 3: Pick random pair, random effect, random target
      const pair = SOUND_PAIRS[Math.floor(Math.random() * SOUND_PAIRS.length)];
      const effectKeys = Object.keys(SPATIAL_EFFECTS);
      const effectId = effectKeys[Math.floor(Math.random() * effectKeys.length)];
      const effect = SPATIAL_EFFECTS[effectId];
      const targetIdx = Math.floor(Math.random() * 2); // 0 or 1

      setCurrentEffect(effect);
      setCurrentSound(targetIdx === 0 ? pair.sound1 : pair.sound2);
      setSelectedAnswer(null);
      setRound(roundNum);
      setCurrentEffectType(null);
      setCurrentPair(pair);
      setTargetSoundIndex(targetIdx);

      setTimeout(() => {
        playLayered(pair, effect.params, targetIdx === 0);
        startCountdown(lvl.timeLimit);
      }, 300);
    }
  }, [playComparison, playLayered, startCountdown, stopCountdown]);

  const handleAnswer = useCallback((answerId) => {
    if (gameState !== 'playing') return;

    stopCountdown();
    setSelectedAnswer(answerId);
    setGameState('answered');

    const isCorrect = answerId === currentEffect?.id;
    setLastAnswerCorrect(isCorrect);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => {
        setTimeLeft(DIFFICULTY_LEVELS[level]?.timeLimit || 15000);
        setGameState('playing');
        nextQuestion(round + 1, level);
      }, 500);
    }
  }, [gameState, currentEffect, stopCountdown, level, round, nextQuestion]);

  const handleTimeout = useCallback(() => {
    stopCountdown();
    setSelectedAnswer(null);
    setLastAnswerCorrect(false);
    setGameState('answered');
    setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
  }, [stopCountdown]);

  const handleNext = useCallback(() => {
    setTimeLeft(currentLevel.timeLimit);
    setGameState('playing');
    nextQuestion(round + 1, level);
  }, [round, level, currentLevel.timeLimit, nextQuestion]);

  const handleNextLevel = useCallback(() => {
    const newLevel = level + 1;

    if (score.correct === score.total) {
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
    }

    usedEffects.current.clear();
    setScore({ correct: 0, total: 0 });
    setRound(1);
    setLevel(newLevel);
    setCurrentEffect(null);
    setCurrentSound(null);
    setCurrentEffectType(null);
    setCurrentPair(null);
    setGameState('playing');

    setTimeout(() => {
      nextQuestion(1, newLevel);
    }, 100);
  }, [level, score, progress, nextQuestion]);

  const handleFinish = useCallback(() => {
    if (score.correct === score.total) {
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
    }
    setGameState('idle');
  }, [level, score, progress]);

  const replaySound = useCallback(() => {
    if (currentLevel.type === 'layered' && currentPair && currentEffect) {
      playLayered(currentPair, currentEffect.params, targetSoundIndex === 0);
    } else if (currentSound && currentEffect) {
      playComparison(currentSound, currentEffect);
    }
  }, [currentLevel.type, currentPair, currentSound, currentEffect, targetSoundIndex, playComparison, playLayered]);

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      handleTimeout();
    }
  }, [timeLeft, gameState, handleTimeout]);

  // Trigger first question when game starts
  const needsFirstQuestion = useRef(false);
  useEffect(() => {
    if (gameState === 'playing' && round === 1 && !currentEffect) {
      if (needsFirstQuestion.current) {
        needsFirstQuestion.current = false;
        nextQuestion(1, level);
      }
    }
  }, [gameState, round, level, currentEffect, nextQuestion]);

  useEffect(() => {
    if (gameState === 'loading') {
      needsFirstQuestion.current = true;
    }
  }, [gameState]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (autoAdvanceRef.current) {
        clearTimeout(autoAdvanceRef.current);
      }
    };
  }, []);

  const client = useClient();
  if (!client) {
    return <div>Loading...</div>;
  }

  // Get current answer options based on level type
  const getAnswerOptions = () => {
    if (currentLevel.type === 'effect-type' || currentLevel.type === 'layered') {
      return Object.values(SPATIAL_EFFECTS);
    } else if (currentLevel.type === 'magnitude' && currentEffectType) {
      return MAGNITUDE_MAP[currentEffectType].magnitudes;
    }
    return [];
  };

  const answerOptions = getAnswerOptions();

  // Get question text based on level type
  const getQuestionText = () => {
    if (currentLevel.type === 'effect-type') {
      return 'Which spatial effect was applied?';
    } else if (currentLevel.type === 'magnitude' && currentEffectType) {
      return `What level of ${MAGNITUDE_MAP[currentEffectType].label} was applied?`;
    } else if (currentLevel.type === 'layered' && currentPair) {
      const targetLabel = targetSoundIndex === 0 ? currentPair.sound1.label : currentPair.sound2.label;
      return `Which effect is on the ${targetLabel}?`;
    }
    return 'Which effect was applied?';
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Level Selection - idle state */}
      {gameState === 'idle' && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Select Level</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DIFFICULTY_LEVELS.map((lvl, idx) => {
              const isUnlocked = idx <= progress.highestLevel;
              const levelScore = progress.levelScores[idx];

              return (
                <button
                  key={lvl.id}
                  onClick={() => isUnlocked && startGame(idx)}
                  disabled={!isUnlocked}
                  className={`
                    p-4 rounded-lg text-left transition-all border
                    ${isUnlocked
                      ? 'bg-gray-800 hover:bg-gray-700 border-gray-600 cursor-pointer'
                      : 'bg-gray-900 border-gray-800 cursor-not-allowed opacity-50'}
                    ${idx === progress.highestLevel && isUnlocked ? 'border-cyan-500 ring-1 ring-cyan-500/30' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{lvl.name}</span>
                    {!isUnlocked && <span className="text-gray-600">🔒</span>}
                    {levelScore && (
                      <span className="text-xs text-green-400">
                        {levelScore.correct}/{levelScore.total}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{lvl.description}</div>
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

      {/* Score - during game */}
      {gameState !== 'idle' && (
        <div className="bg-background border border-lineHighlight rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-400">{currentLevel.name}</span>
            </div>
            <div className="text-sm text-gray-400">{currentLevel.description}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="font-mono text-sm">
              Round: <span className="text-cyan-400">{Math.min(round, currentLevel.roundsToAdvance)}</span> / {currentLevel.roundsToAdvance}
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
            <div className="text-xl text-gray-400 mb-2">Loading sounds...</div>
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {gameState === 'levelUp' && (
          <div className="text-center space-y-4">
            {score.correct === score.total ? (
              <>
                <h2 className="text-2xl font-bold text-green-400">Perfect!</h2>
                <p className="text-4xl font-mono">
                  <span className="text-green-400">{score.correct}</span>
                  <span className="text-gray-500"> / </span>
                  <span>{score.total}</span>
                </p>
                <p className="text-lg text-gray-400">Level {level + 2} unlocked!</p>
                <p className="text-sm text-gray-500">
                  {DIFFICULTY_LEVELS[level + 1]?.description}
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
                    Level {level + 2} →
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-yellow-400">Level {level + 1} Complete</h2>
                <p className="text-4xl font-mono">
                  <span className="text-yellow-400">{score.correct}</span>
                  <span className="text-gray-500"> / </span>
                  <span>{score.total}</span>
                </p>
                <p className="text-lg text-gray-400">
                  Perfect score required to unlock next level
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setGameState('idle')}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Back to Levels
                  </button>
                  <button
                    onClick={() => startGame(level)}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {gameState === 'finished' && (
          <div className="text-center space-y-4">
            {score.correct === score.total ? (
              <>
                <h2 className="text-2xl font-bold text-green-400">All Levels Complete!</h2>
                <p className="text-4xl font-mono">
                  <span className="text-green-400">{score.correct}</span>
                  <span className="text-gray-500"> / </span>
                  <span>{score.total}</span>
                </p>
                <p className="text-lg text-gray-400">
                  You've mastered auditory space effects!
                </p>
                <button
                  onClick={handleFinish}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                >
                  Back to Levels
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-yellow-400">Level {level + 1} Complete</h2>
                <p className="text-4xl font-mono">
                  <span className="text-yellow-400">{score.correct}</span>
                  <span className="text-gray-500"> / </span>
                  <span>{score.total}</span>
                </p>
                <p className="text-lg text-gray-400">
                  Perfect score required to complete
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setGameState('idle')}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Back to Levels
                  </button>
                  <button
                    onClick={() => startGame(level)}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {(gameState === 'playing' || gameState === 'answered') && (
          <div className="space-y-6">
            {/* Timer bar */}
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  timeLeft > currentLevel.timeLimit * 0.4 ? 'bg-green-500' :
                  timeLeft > currentLevel.timeLimit * 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(timeLeft / currentLevel.timeLimit) * 100}%` }}
              />
            </div>

            {/* Sound indicator */}
            <div className="text-center mb-4">
              <div className="text-lg text-gray-300 mb-2">
                {gameState === 'answered' && !lastAnswerCorrect
                  ? 'Click effects to hear the difference'
                  : getQuestionText()}
              </div>
              {currentLevel.type === 'layered' ? (
                <div className="flex justify-center gap-4 text-sm">
                  <span className={`px-3 py-1 rounded ${isPlayingLayered ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    {currentPair?.name || 'Playing...'}
                  </span>
                </div>
              ) : (
                <div className="flex justify-center gap-4 text-sm">
                  <span className={`px-3 py-1 rounded ${isPlayingDry ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    Dry
                  </span>
                  <span className="text-gray-500">→</span>
                  <span className={`px-3 py-1 rounded ${isPlayingWet ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    Wet (Effect)
                  </span>
                </div>
              )}
            </div>

            {/* Effect options */}
            <div className="grid grid-cols-3 gap-3">
              {answerOptions.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrect = currentEffect?.id === option.id;
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

                const handleClick = () => {
                  if (showResult && !lastAnswerCorrect) {
                    playEffectDemo(option.id);
                  } else if (!showResult) {
                    handleAnswer(option.id);
                  }
                };

                return (
                  <button
                    key={option.id}
                    onClick={handleClick}
                    disabled={showResult && lastAnswerCorrect}
                    className={`
                      p-4 rounded-lg text-center transition-all
                      ${bgColor}
                      ${showResult && lastAnswerCorrect ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    {currentLevel.type === 'magnitude' ? (
                      <>
                        <div className="text-xs font-mono text-cyan-400 mb-1">{option.code}</div>
                        <div className="text-xs text-gray-400">{option.name}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-bold mb-1">{option.name}</div>
                        <div className="text-xs text-gray-400">{option.description}</div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Replay button */}
            <div className="text-center">
              <button
                onClick={replaySound}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Replay Sound
              </button>
            </div>

            {/* Feedback - only show for incorrect guesses */}
            {gameState === 'answered' && !lastAnswerCorrect && (
              <div className="text-center space-y-3">
                {selectedAnswer === null ? (
                  <p className="text-yellow-400 text-xl">
                    Time's up! It was <span className="font-bold">{currentEffect?.name}</span>
                  </p>
                ) : (
                  <p className="text-red-400 text-xl">
                    It was <span className="font-bold">{currentEffect?.name}</span>
                  </p>
                )}

                {/* Description */}
                <p className="text-gray-400 text-sm">
                  {currentEffect?.description}
                </p>

                {/* MiniRepl with slider for Level 2, static code for other levels */}
                {currentLevel.type === 'magnitude' && currentEffectType ? (
                  <div className="text-left">
                    <p className="text-xs text-gray-500 mb-2 text-center">Try the sliders to hear the difference:</p>
                    <MiniRepl key={`repl-${round}`} tune={getSliderCode(currentEffectType, currentSound)} />
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm inline-block">
                    <code>
                      note("<span className="text-cyan-400">{currentSound?.note}</span>")
                      .sound("<span className="text-yellow-400">{currentSound?.s}</span>")
                      <span className="text-green-400">{currentEffect?.code}</span>
                    </code>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                >
                  {round >= currentLevel.roundsToAdvance ? 'See Results' : 'Next'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Effect reference - show during game */}
      {gameState !== 'idle' && gameState !== 'loading' && currentLevel.type !== 'magnitude' && (
        <div className="bg-background border border-lineHighlight rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-2">Spatial effects:</div>
          <div className="flex flex-wrap gap-2">
            {Object.values(SPATIAL_EFFECTS).map(effect => (
              <span
                key={effect.id}
                className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300"
              >
                {effect.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
