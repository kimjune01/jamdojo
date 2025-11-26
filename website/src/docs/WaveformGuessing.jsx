import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAudioContext, initAudioOnFirstClick, superdough, analysers, getAnalyzerData } from '@strudel/webaudio';
import { prebake } from '../repl/prebake.mjs';
import { loadModules } from '../repl/util.mjs';
import useClient from '@src/useClient.mjs';

let prebaked, modulesLoading, audioReady;
if (typeof window !== 'undefined') {
  prebaked = prebake();
  modulesLoading = loadModules();
  audioReady = initAudioOnFirstClick();
}

// Analyser ID for this component
const ANALYSER_ID = 'waveform-quiz';

// Waveform types
const WAVEFORMS = [
  { id: 'sine', name: 'Sine', icon: '∿' },
  { id: 'triangle', name: 'Triangle', icon: '△' },
  { id: 'square', name: 'Square', icon: '⊓' },
  { id: 'sawtooth', name: 'Sawtooth', icon: '⊿' },
];

// ADSR presets for different levels
const ADSR_PRESETS = {
  // Clean (no envelope shaping)
  clean: { attack: 0.001, decay: 0.1, sustain: 1, release: 0.1 },
  // Short plucky sounds
  pluck: { attack: 0.001, decay: 0.2, sustain: 0.3, release: 0.3 },
  // Pad-like sounds
  pad: { attack: 0.5, decay: 0.3, sustain: 0.7, release: 0.8 },
  // Percussive
  perc: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
  // Slow attack
  swell: { attack: 0.8, decay: 0.2, sustain: 0.6, release: 0.5 },
  // Brass-like
  brass: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2 },
};

// Difficulty levels
const DIFFICULTY_LEVELS = [
  {
    id: 0,
    name: 'Level 1',
    description: 'All four waveforms',
    mode: 'identify',
    waveforms: ['sine', 'triangle', 'square', 'sawtooth'],
    adsr: 'clean',
    roundsToAdvance: 8,
    timeLimit: 12000,
    randomizePitch: true,
  },
  {
    id: 1,
    name: 'Level 2',
    description: 'Waveforms with envelopes',
    mode: 'identify',
    waveforms: ['sine', 'triangle', 'square', 'sawtooth'],
    adsr: 'random', // Random ADSR applied
    roundsToAdvance: 8,
    timeLimit: 12000,
  },
  {
    id: 2,
    name: 'Level 3',
    description: 'Tricky envelopes',
    mode: 'identify',
    waveforms: ['sine', 'triangle', 'square', 'sawtooth'],
    adsr: 'tricky', // Envelopes that mask waveform character
    roundsToAdvance: 8,
    timeLimit: 10000,
  },
  {
    id: 3,
    name: 'Level 4',
    description: 'Match the envelope (2 params)',
    mode: 'construct', // User must construct the ADSR
    waveforms: ['sine'],
    adsrParams: ['attack', 'release'], // Only these two params
    roundsToAdvance: 5,
    passThreshold: 70, // Need 70% accuracy to pass
    timeLimit: 30000,
  },
  {
    id: 4,
    name: 'Level 5',
    description: 'Match the envelope (3 params)',
    mode: 'construct',
    waveforms: ['sine'],
    adsrParams: ['attack', 'decay', 'sustain'],
    roundsToAdvance: 5,
    passThreshold: 65,
    timeLimit: 35000,
  },
  {
    id: 5,
    name: 'Level 6',
    description: 'Full ADSR matching',
    mode: 'construct',
    waveforms: ['sine', 'triangle', 'square', 'sawtooth'],
    adsrParams: ['attack', 'decay', 'sustain', 'release'],
    roundsToAdvance: 6,
    passThreshold: 60,
    timeLimit: 45000,
  },
];

const STORAGE_KEY = 'waveform-guessing-progress';

// Generate random ADSR within reasonable bounds
const generateRandomADSR = (difficulty = 'normal') => {
  if (difficulty === 'tricky') {
    // Envelopes that make it harder to identify waveforms
    const presets = ['pluck', 'pad', 'perc', 'swell', 'brass'];
    return { ...ADSR_PRESETS[presets[Math.floor(Math.random() * presets.length)]] };
  }

  return {
    attack: Math.random() * 0.8 + 0.001, // 0.001 - 0.8
    decay: Math.random() * 0.5 + 0.05,   // 0.05 - 0.55
    sustain: Math.random() * 0.8 + 0.2,  // 0.2 - 1.0
    release: Math.random() * 0.8 + 0.1,  // 0.1 - 0.9
  };
};

// Calculate distance score between user ADSR and target ADSR
const calculateADSRScore = (userADSR, targetADSR, params) => {
  const ranges = {
    attack: 1.0,   // Max attack time for scoring
    decay: 0.6,    // Max decay time for scoring
    sustain: 1.0,  // Max sustain level (0-1)
    release: 1.0,  // Max release time for scoring
  };

  let totalWeightedDiff = 0;
  let totalWeight = 0;

  for (const param of params) {
    const diff = Math.abs(userADSR[param] - targetADSR[param]);
    const normalizedDiff = Math.min(diff / ranges[param], 1);
    totalWeightedDiff += normalizedDiff;
    totalWeight += 1;
  }

  const avgDiff = totalWeightedDiff / totalWeight;
  return Math.round((1 - avgDiff) * 100);
};

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

// ADSR Slider Component
function ADSRSlider({ label, value, onChange, min, max, step, disabled, showValue = true }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <label className="text-xs text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="relative h-32 w-8 bg-gray-800 rounded-lg overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 bg-cyan-600 transition-all"
          style={{ height: `${((value - min) / (max - min)) * 100}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
        />
      </div>
      {showValue && (
        <span className="text-xs font-mono text-gray-300">
          {label === 'S' ? Math.round(value * 100) + '%' : value.toFixed(2) + 's'}
        </span>
      )}
    </div>
  );
}

// ADSR Envelope Visualization
function ADSRVisualizer({ adsr, width = 200, height = 60 }) {
  const { attack, decay, sustain, release } = adsr;
  const totalTime = attack + decay + 0.3 + release; // 0.3s sustain hold time for viz

  const aX = (attack / totalTime) * width;
  const dX = aX + (decay / totalTime) * width;
  const sX = dX + (0.3 / totalTime) * width;
  const rX = width;

  const sustainY = height - (sustain * height);

  const path = `M 0 ${height} L ${aX} 0 L ${dX} ${sustainY} L ${sX} ${sustainY} L ${rX} ${height}`;

  return (
    <svg width={width} height={height} className="bg-gray-900 rounded">
      <path d={path} fill="none" stroke="cyan" strokeWidth="2" />
      <circle cx={aX} cy={0} r="3" fill="cyan" />
      <circle cx={dX} cy={sustainY} r="3" fill="cyan" />
      <circle cx={sX} cy={sustainY} r="3" fill="cyan" />
    </svg>
  );
}

// Oscilloscope Component using Strudel's analysers
function Oscilloscope({ width = 300, height = 120, analyserId = ANALYSER_ID }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set up high-DPI canvas
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const analyser = analysers[analyserId];

      if (!analyser) {
        // Draw flat line if no analyser yet
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // Get waveform data using Strudel's getAnalyzerData
      let dataArray;
      try {
        dataArray = getAnalyzerData('time', analyserId);
      } catch (e) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      if (!dataArray || dataArray.length === 0) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // Draw waveform
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Find a good starting point (zero crossing) for stable display
      let startIdx = 0;
      for (let i = 0; i < dataArray.length - 1; i++) {
        if (dataArray[i] <= 0 && dataArray[i + 1] > 0) {
          startIdx = i;
          break;
        }
      }

      // Draw from the zero crossing point
      const samplesToShow = Math.min(512, dataArray.length - startIdx);
      const adjustedSliceWidth = width / samplesToShow;
      const scale = 0.4; // Scale factor for amplitude
      const centerY = height / 2;

      for (let i = 0; i < samplesToShow; i++) {
        const dataIdx = startIdx + i;
        const v = dataArray[dataIdx]; // Float data is -1 to 1
        const y = centerY - (v * centerY * scale * 2);

        if (i === 0) {
          ctx.moveTo(0, y);
        } else {
          ctx.lineTo(i * adjustedSliceWidth, y);
        }
      }

      ctx.stroke();

      // Add glow effect
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, analyserId]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        className="rounded-lg border border-gray-700"
      />
      <div className="absolute top-1 left-2 text-[10px] text-gray-500 uppercase tracking-wider">
        Oscilloscope
      </div>
    </div>
  );
}

export function WaveformGuessing() {
  const [gameState, setGameState] = useState('idle'); // idle, loading, playing, answered, levelUp, finished
  const [currentWaveform, setCurrentWaveform] = useState(null);
  const [currentADSR, setCurrentADSR] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userADSR, setUserADSR] = useState({ attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 });
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState(0);
  const [adsrScore, setAdsrScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_LEVELS[0].timeLimit);
  const [progress, setProgress] = useState(() => loadProgress());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPitch, setCurrentPitch] = useState('C4');
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const initialized = useRef(false);
  const countdownRef = useRef(null);
  const usedWaveforms = useRef([]);
  const playTimeoutRef = useRef(null);

  const currentLevel = DIFFICULTY_LEVELS[level] || DIFFICULTY_LEVELS[DIFFICULTY_LEVELS.length - 1];
  const isConstructMode = currentLevel.mode === 'construct';

  const initAudio = useCallback(async () => {
    if (!initialized.current) {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized.current = true;
    }
  }, []);

  const playSound = useCallback(async (waveform, adsr, pitch = 'C4', delay = 0) => {
    await initAudio();
    const ac = getAudioContext();
    const t = ac.currentTime + delay + 0.01;
    const duration = adsr.attack + adsr.decay + 0.5 + adsr.release;

    // Track playing state
    setIsPlaying(true);
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }
    playTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
    }, (delay + duration) * 1000 + 100);

    await superdough({
      s: waveform,
      note: pitch,
      gain: 0.5,
      attack: adsr.attack,
      decay: adsr.decay,
      sustain: adsr.sustain,
      release: adsr.release,
      analyze: ANALYSER_ID, // Connect to analyser for oscilloscope
      fft: 6, // fftSize = 2^(6+5) = 2048
    }, t, duration);
  }, [initAudio]);

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
    await initAudio();
    usedWaveforms.current = [];
    setScore({ correct: 0, total: 0 });
    setRound(1);
    setLevel(startLevel);
    setCurrentWaveform(null);
    setCurrentADSR(null);
    setAdsrScore(null);
    setUserADSR({ attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 });
    setGameState('playing');
  }, [initAudio]);

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

    // Pick random waveform
    const availableWaveforms = lvl.waveforms;
    const waveform = availableWaveforms[Math.floor(Math.random() * availableWaveforms.length)];

    // Determine ADSR
    let adsr;
    if (lvl.adsr === 'clean') {
      adsr = { ...ADSR_PRESETS.clean };
    } else if (lvl.adsr === 'random') {
      adsr = generateRandomADSR('normal');
    } else if (lvl.adsr === 'tricky') {
      adsr = generateRandomADSR('tricky');
    } else if (lvl.mode === 'construct') {
      // For construct mode, generate target ADSR
      adsr = generateRandomADSR('normal');
    } else {
      adsr = { ...ADSR_PRESETS.clean };
    }

    // Randomize pitch for certain levels
    const pitchOptions = ['C3', 'E3', 'G3', 'C4', 'E4', 'G4', 'C5'];
    const pitch = lvl.randomizePitch
      ? pitchOptions[Math.floor(Math.random() * pitchOptions.length)]
      : 'C4';

    setCurrentWaveform(waveform);
    setCurrentADSR(adsr);
    setCurrentPitch(pitch);
    setSelectedAnswer(null);
    setAdsrScore(null);
    setRound(roundNum);

    // Reset user ADSR for construct mode
    if (lvl.mode === 'construct') {
      setUserADSR({ attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 });
    }

    setTimeout(() => {
      playSound(waveform, adsr, pitch);
      startCountdown(lvl.timeLimit);
    }, 300);
  }, [playSound, startCountdown, stopCountdown]);

  const autoAdvanceRef = useRef(null);

  const handleWaveformAnswer = useCallback((waveformId) => {
    if (gameState !== 'playing' || isConstructMode) return;

    stopCountdown();
    setSelectedAnswer(waveformId);
    setGameState('answered');

    const isCorrect = waveformId === currentWaveform;
    setLastAnswerCorrect(isCorrect);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Auto-advance after 500ms if correct
    if (isCorrect) {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => {
        setTimeLeft(DIFFICULTY_LEVELS[level]?.timeLimit || 12000);
        setGameState('playing');
        nextQuestion(round + 1, level);
      }, 500);
    }
  }, [gameState, currentWaveform, stopCountdown, isConstructMode, level, round, nextQuestion]);

  const handleADSRSubmit = useCallback(() => {
    if (gameState !== 'playing' || !isConstructMode) return;

    stopCountdown();
    setGameState('answered');

    const params = currentLevel.adsrParams || ['attack', 'decay', 'sustain', 'release'];
    const calculatedScore = calculateADSRScore(userADSR, currentADSR, params);
    setAdsrScore(calculatedScore);

    const isPassing = calculatedScore >= currentLevel.passThreshold;
    setScore(prev => ({
      correct: prev.correct + (isPassing ? 1 : 0),
      total: prev.total + 1
    }));
  }, [gameState, isConstructMode, userADSR, currentADSR, currentLevel, stopCountdown]);

  const handleTimeout = useCallback(() => {
    if (isConstructMode) {
      handleADSRSubmit();
    } else {
      stopCountdown();
      setSelectedAnswer(null);
      setGameState('answered');
      setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
    }
  }, [isConstructMode, handleADSRSubmit, stopCountdown]);

  const handleNext = useCallback(() => {
    setTimeLeft(currentLevel.timeLimit);
    setGameState('playing');
    nextQuestion(round + 1, level);
  }, [round, level, currentLevel.timeLimit, nextQuestion]);

  const handleNextLevel = useCallback(() => {
    const newLevel = level + 1;

    // Check if user can advance
    const canAdvance = isConstructMode
      ? score.correct >= Math.ceil(currentLevel.roundsToAdvance * 0.6) // 60% of rounds passed
      : score.correct === score.total; // Perfect for identify mode

    if (canAdvance) {
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

    usedWaveforms.current = [];
    setScore({ correct: 0, total: 0 });
    setRound(1);
    setLevel(newLevel);
    setCurrentWaveform(null);
    setCurrentADSR(null);
    setAdsrScore(null);
    setGameState('playing');

    // Trigger first question for the new level
    setTimeout(() => {
      nextQuestion(1, newLevel);
    }, 100);
  }, [level, score, progress, currentLevel, isConstructMode, nextQuestion]);

  const handleFinish = useCallback(() => {
    const canComplete = isConstructMode
      ? score.correct >= Math.ceil(currentLevel.roundsToAdvance * 0.6)
      : score.correct === score.total;

    if (canComplete) {
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
  }, [level, score, progress, currentLevel, isConstructMode]);

  const replaySound = useCallback(() => {
    if (currentWaveform && currentADSR) {
      playSound(currentWaveform, currentADSR, currentPitch);
    }
  }, [currentWaveform, currentADSR, currentPitch, playSound]);

  const playUserSound = useCallback(() => {
    if (currentWaveform) {
      playSound(currentWaveform, userADSR, currentPitch);
    }
  }, [currentWaveform, userADSR, currentPitch, playSound]);

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      handleTimeout();
    }
  }, [timeLeft, gameState, handleTimeout]);

  // Trigger first question when game starts
  const needsFirstQuestion = useRef(false);
  useEffect(() => {
    if (gameState === 'playing' && round === 1 && !currentWaveform) {
      if (needsFirstQuestion.current) {
        needsFirstQuestion.current = false;
        nextQuestion(1, level);
      }
    }
  }, [gameState, round, level, currentWaveform, nextQuestion]);

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
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
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

  const currentWaveformInfo = WAVEFORMS.find(w => w.id === currentWaveform);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Level Selection - idle state */}
      {gameState === 'idle' && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Select Level</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  <div className="text-xs text-gray-400 mb-2">{lvl.description}</div>
                  <div className="flex flex-wrap gap-1">
                    {lvl.waveforms.map(w => {
                      const waveform = WAVEFORMS.find(wf => wf.id === w);
                      return (
                        <span
                          key={w}
                          className="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-300"
                        >
                          {waveform?.icon} {waveform?.name}
                        </span>
                      );
                    })}
                  </div>
                  {lvl.mode === 'construct' && (
                    <div className="mt-2 text-[10px] text-cyan-400">
                      ADSR Construction Mode
                    </div>
                  )}
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
              {isConstructMode && (
                <span className="text-xs text-gray-500">
                  (Pass: {currentLevel.passThreshold}%)
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400">{currentLevel.description}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="font-mono text-sm">
              Round: <span className="text-cyan-400">{Math.min(round, currentLevel.roundsToAdvance)}</span> / {currentLevel.roundsToAdvance}
            </div>
            <div className="font-mono text-sm">
              {isConstructMode ? 'Passed' : 'Score'}: <span className="text-green-400">{score.correct}</span> / {score.total}
            </div>
          </div>
        </div>
      )}

      {/* Game area */}
      <div className="bg-background border border-lineHighlight rounded-lg p-6">
        {gameState === 'loading' && (
          <div className="text-center py-8">
            <div className="text-xl text-gray-400 mb-2">Loading synths...</div>
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {gameState === 'levelUp' && (
          <div className="text-center space-y-4">
            {(isConstructMode ? score.correct >= Math.ceil(currentLevel.roundsToAdvance * 0.6) : score.correct === score.total) ? (
              <>
                <h2 className="text-2xl font-bold text-green-400">
                  {isConstructMode ? 'Well Done!' : 'Perfect!'}
                </h2>
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
                  {isConstructMode
                    ? `Need ${Math.ceil(currentLevel.roundsToAdvance * 0.6)} passes to unlock next level`
                    : 'Perfect score required to unlock next level'}
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
            <h2 className="text-2xl font-bold text-green-400">All Levels Complete!</h2>
            <p className="text-4xl font-mono">
              <span className="text-green-400">{score.correct}</span>
              <span className="text-gray-500"> / </span>
              <span>{score.total}</span>
            </p>
            <p className="text-lg text-gray-400">
              You've mastered waveforms and ADSR envelopes!
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

            {/* Identify Mode UI */}
            {!isConstructMode && (
              <>
                <div className="text-center text-lg text-gray-300 mb-4">
                  {gameState === 'answered' && !lastAnswerCorrect
                    ? 'Click to hear each waveform'
                    : 'Which waveform do you hear?'}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {currentLevel.waveforms.map((waveformId) => {
                    const waveform = WAVEFORMS.find(w => w.id === waveformId);
                    const isSelected = selectedAnswer === waveformId;
                    const isCorrect = currentWaveform === waveformId;
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
                        // Play the waveform sound for learning
                        playSound(waveformId, currentADSR, currentPitch);
                      } else if (!showResult) {
                        handleWaveformAnswer(waveformId);
                      }
                    };

                    return (
                      <button
                        key={waveformId}
                        onClick={handleClick}
                        disabled={showResult && lastAnswerCorrect}
                        className={`
                          p-4 rounded-lg font-mono text-center transition-all
                          ${bgColor}
                          ${showResult && lastAnswerCorrect ? 'cursor-default' : 'cursor-pointer'}
                        `}
                      >
                        <div className="text-3xl mb-1">{waveform?.icon}</div>
                        <div className="text-sm">{waveform?.name}</div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Construct Mode UI */}
            {isConstructMode && (
              <>
                <div className="text-center text-lg text-gray-300 mb-4">
                  Match the envelope using the sliders
                </div>

                {/* ADSR Sliders */}
                <div className="flex justify-center gap-6">
                  {currentLevel.adsrParams?.includes('attack') && (
                    <ADSRSlider
                      label="A"
                      value={userADSR.attack}
                      onChange={(v) => setUserADSR(prev => ({ ...prev, attack: v }))}
                      min={0.001}
                      max={1}
                      step={0.01}
                      disabled={gameState === 'answered'}
                    />
                  )}
                  {currentLevel.adsrParams?.includes('decay') && (
                    <ADSRSlider
                      label="D"
                      value={userADSR.decay}
                      onChange={(v) => setUserADSR(prev => ({ ...prev, decay: v }))}
                      min={0.01}
                      max={0.6}
                      step={0.01}
                      disabled={gameState === 'answered'}
                    />
                  )}
                  {currentLevel.adsrParams?.includes('sustain') && (
                    <ADSRSlider
                      label="S"
                      value={userADSR.sustain}
                      onChange={(v) => setUserADSR(prev => ({ ...prev, sustain: v }))}
                      min={0}
                      max={1}
                      step={0.01}
                      disabled={gameState === 'answered'}
                    />
                  )}
                  {currentLevel.adsrParams?.includes('release') && (
                    <ADSRSlider
                      label="R"
                      value={userADSR.release}
                      onChange={(v) => setUserADSR(prev => ({ ...prev, release: v }))}
                      min={0.01}
                      max={1}
                      step={0.01}
                      disabled={gameState === 'answered'}
                    />
                  )}
                </div>

                {/* Envelope Visualization */}
                <div className="flex justify-center gap-4 items-center">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Your Envelope</div>
                    <ADSRVisualizer adsr={userADSR} />
                  </div>
                  {gameState === 'answered' && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Target Envelope</div>
                      <ADSRVisualizer adsr={currentADSR} />
                    </div>
                  )}
                </div>

                {/* Test Sound Button */}
                {gameState === 'playing' && (
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={playUserSound}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Test Your Sound
                    </button>
                    <button
                      onClick={handleADSRSubmit}
                      className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Replay button */}
            <div className="text-center">
              <button
                onClick={replaySound}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isConstructMode ? 'Replay Target' : 'Replay'}
              </button>
            </div>

            {/* Oscilloscope - only show after incorrect guess (correct auto-advances) */}
            {gameState === 'answered' && !lastAnswerCorrect && (
              <div className="flex justify-center">
                <Oscilloscope width={320} height={100} />
              </div>
            )}

            {/* Feedback - only show for incorrect guesses (correct auto-advances) */}
            {gameState === 'answered' && (!lastAnswerCorrect || isConstructMode) && (
              <div className="text-center space-y-3">
                {isConstructMode ? (
                  <>
                    <p className={`text-xl font-bold ${adsrScore >= currentLevel.passThreshold ? 'text-green-400' : 'text-red-400'}`}>
                      Score: {adsrScore}%
                      {adsrScore >= currentLevel.passThreshold ? ' - Passed!' : ' - Try to get closer!'}
                    </p>
                    <div className="text-sm text-gray-400">
                      <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                        {currentLevel.adsrParams?.map(param => (
                          <div key={param} className="flex justify-between">
                            <span className="uppercase">{param}:</span>
                            <span>
                              <span className="text-cyan-400">
                                {param === 'sustain'
                                  ? Math.round(userADSR[param] * 100) + '%'
                                  : userADSR[param].toFixed(2) + 's'}
                              </span>
                              {' → '}
                              <span className="text-green-400">
                                {param === 'sustain'
                                  ? Math.round(currentADSR[param] * 100) + '%'
                                  : currentADSR[param].toFixed(2) + 's'}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {selectedAnswer === currentWaveform ? (
                      <p className="text-green-400 text-xl font-bold">Correct!</p>
                    ) : selectedAnswer === null ? (
                      <p className="text-yellow-400 text-xl">
                        Time's up! It was <span className="font-bold">{currentWaveformInfo?.name}</span>
                      </p>
                    ) : (
                      <p className="text-red-400 text-xl">
                        It was <span className="font-bold">{currentWaveformInfo?.name}</span>
                      </p>
                    )}
                  </>
                )}

                {/* Strudel notation */}
                <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm inline-block">
                  <code>
                    note("<span className="text-cyan-400">{currentPitch}</span>")
                    .sound("<span className="text-yellow-400">{currentWaveform}</span>")
                    {currentADSR && currentLevel.adsr !== 'clean' && (
                      <>
                        <br />
                        .attack(<span className="text-green-400">{currentADSR.attack.toFixed(2)}</span>)
                        .decay(<span className="text-green-400">{currentADSR.decay.toFixed(2)}</span>)
                        <br />
                        .sustain(<span className="text-green-400">{currentADSR.sustain.toFixed(2)}</span>)
                        .release(<span className="text-green-400">{currentADSR.release.toFixed(2)}</span>)
                      </>
                    )}
                  </code>
                </div>

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
    </div>
  );
}
