import { useState, useEffect, useCallback, useRef } from 'react';
import useClient from '@src/useClient.mjs';
import { getAudioContext, initAudioOnFirstClick, superdough } from '@strudel/webaudio';
import { prebake } from '../repl/prebake.mjs';
import { loadModules } from '../repl/util.mjs';

// SSR-safe initialization
let prebaked, modulesLoading, audioReady;
if (typeof window !== 'undefined') {
  prebaked = prebake();
  modulesLoading = loadModules();
  audioReady = initAudioOnFirstClick();
}

let initialized = false;

// Available rhythm subdivisions
const RHYTHM_OPTIONS = [2, 3, 4, 5, 6, 7];

// Euclidean rhythm options (hits, steps)
const EUCLIDEAN_PRESETS = [
  { hits: 3, steps: 8, name: 'E(3,8) - Tresillo' },
  { hits: 5, steps: 8, name: 'E(5,8) - Cinquillo' },
  { hits: 7, steps: 8, name: 'E(7,8)' },
  { hits: 2, steps: 5, name: 'E(2,5)' },
  { hits: 3, steps: 5, name: 'E(3,5)' },
  { hits: 4, steps: 7, name: 'E(4,7)' },
  { hits: 5, steps: 7, name: 'E(5,7)' },
  { hits: 3, steps: 7, name: 'E(3,7)' },
  { hits: 5, steps: 9, name: 'E(5,9)' },
  { hits: 7, steps: 12, name: 'E(7,12)' },
  { hits: 5, steps: 12, name: 'E(5,12)' },
];

// Generate Euclidean rhythm pattern using Bjorklund's algorithm
function euclidean(hits, steps) {
  if (hits >= steps) return new Array(steps).fill(true);
  if (hits === 0) return new Array(steps).fill(false);

  let pattern = [];
  let counts = [];
  let remainders = [];
  let divisor = steps - hits;
  remainders.push(hits);
  let level = 0;

  while (remainders[level] > 1) {
    counts.push(Math.floor(divisor / remainders[level]));
    remainders.push(divisor % remainders[level]);
    divisor = remainders[level];
    level++;
  }
  counts.push(divisor);

  function build(level) {
    if (level === -1) {
      pattern.push(false);
    } else if (level === -2) {
      pattern.push(true);
    } else {
      for (let i = 0; i < counts[level]; i++) {
        build(level - 1);
      }
      if (remainders[level] !== 0) {
        build(level - 2);
      }
    }
  }

  build(level);
  // Rotate so first element is a hit
  const firstHit = pattern.indexOf(true);
  if (firstHit > 0) {
    pattern = [...pattern.slice(firstHit), ...pattern.slice(0, firstHit)];
  }
  return pattern;
}

// Storage keys
const STORAGE_KEYS = {
  mode: 'polyrhythm-mode',
  leftRhythm: 'polyrhythm-left-rhythm',
  rightRhythm: 'polyrhythm-right-rhythm',
  euclideanPreset: 'polyrhythm-euclidean-preset',
  bpm: 'polyrhythm-bpm',
  difficulty: 'polyrhythm-difficulty',
  bestStreak: 'polyrhythm-best-streak',
  bestStreakEuclidean: 'polyrhythm-best-streak-euclidean',
};

// Helper functions for localStorage
function loadSetting(key, defaultValue, parser = parseInt) {
  try {
    const val = parser(localStorage.getItem(key));
    return isNaN(val) ? defaultValue : val;
  } catch {
    return defaultValue;
  }
}

function loadStringValue(key, defaultValue, validValues) {
  try {
    const val = localStorage.getItem(key);
    return validValues.includes(val) ? val : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveSetting(key, value) {
  try {
    localStorage.setItem(key, value.toString());
  } catch {
    // Silently fail
  }
}

// Calculate GCD and LCM for rhythm cycles
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

// Single Spinning Circle for Euclidean mode
function SpinningCircleEuclidean({
  pattern, // boolean array from euclidean()
  currentBpm,
  gameRunning,
  hitDots,
  activeKey,
  audioContextRef // Pass AudioContext for synchronized timing
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const activeKeyRef = useRef(activeKey);
  const frozenRotationRef = useRef(0);
  const wasRunningRef = useRef(false);

  useEffect(() => {
    activeKeyRef.current = activeKey;
  }, [activeKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;

    const radius = size * 0.38;
    const dotRadius = size * 0.025;
    const hitDotRadius = size * 0.04;
    const steps = pattern.length;

    // Cycle duration: one full rotation
    const cycleDuration = (60 / currentBpm) * steps / 4; // 4 steps per beat feels natural

    const draw = () => {
      // Use AudioContext time for synchronized timing
      const ac = audioContextRef?.current;
      const now = ac ? ac.currentTime : 0;

      let rotation;
      if (gameRunning && ac) {
        const cycleProgress = (now % cycleDuration) / cycleDuration;
        rotation = cycleProgress * Math.PI * 2;
        frozenRotationRef.current = rotation;
      } else {
        rotation = frozenRotationRef.current;
      }

      ctx.clearRect(0, 0, size, size);

      // Draw circle track
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw dots
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2 - Math.PI / 2 + rotation;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const isHit = hitDots.has(i);
        const isActive = pattern[i]; // This step should be hit
        const currentDotRadius = isHit ? hitDotRadius : dotRadius;

        ctx.beginPath();
        ctx.arc(x, y, currentDotRadius, 0, Math.PI * 2);

        if (isHit) {
          ctx.fillStyle = '#22c55e';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 20;
        } else if (isActive) {
          // Active beat - cyan/bright
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 10;
        } else {
          // Rest - dimmer
          ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw target line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius + 15);
      ctx.lineTo(centerX, centerY - radius - 15);
      if (activeKeyRef.current) {
        ctx.strokeStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 5;
      } else {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 3;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (gameRunning) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    if (gameRunning && !wasRunningRef.current) {
      frozenRotationRef.current = 0;
    }
    wasRunningRef.current = gameRunning;

    if (gameRunning) {
      animationRef.current = requestAnimationFrame(draw);
    } else {
      draw();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pattern, currentBpm, gameRunning, hitDots, audioContextRef]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="w-full max-w-[400px] mx-auto"
    />
  );
}

// Spinning Circles Visualization Component
function SpinningCircles({
  leftRhythm,
  rightRhythm,
  currentBpm,
  gameRunning,
  hitDots,
  activeKey,
  audioContextRef // Pass AudioContext for synchronized timing
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const activeKeyRef = useRef(activeKey);
  const frozenRotationRef = useRef(0);
  const wasRunningRef = useRef(false);

  // Keep activeKey ref updated
  useEffect(() => {
    activeKeyRef.current = activeKey;
  }, [activeKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;

    // Circle radii
    const outerRadius = size * 0.42;
    const innerRadius = size * 0.25;
    const dotRadius = size * 0.025;
    const hitDotRadius = size * 0.04;
    const gap = size * 0.04; // Gap between inner and outer target lines

    // Calculate cycle duration
    const cycleBeats = lcm(leftRhythm, rightRhythm);
    const cycleDuration = (60 / currentBpm) * cycleBeats / Math.max(leftRhythm, rightRhythm);

    const draw = () => {
      // Use AudioContext time for synchronized timing
      const ac = audioContextRef?.current;
      const now = ac ? ac.currentTime : 0;

      // Calculate rotation based on AudioContext time
      let rotation;
      if (gameRunning && ac) {
        const cycleProgress = (now % cycleDuration) / cycleDuration;
        rotation = cycleProgress * Math.PI * 2;
        frozenRotationRef.current = rotation; // Store current rotation
      } else {
        // Use frozen rotation when not running
        rotation = frozenRotationRef.current;
      }

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Draw outer circle track (left rhythm - cyan)
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw inner circle track (right rhythm - orange)
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw dots for outer circle (left rhythm)
      for (let i = 0; i < leftRhythm; i++) {
        const angle = (i / leftRhythm) * Math.PI * 2 - Math.PI / 2 + rotation;
        const x = centerX + Math.cos(angle) * outerRadius;
        const y = centerY + Math.sin(angle) * outerRadius;

        // Check if this dot was recently hit
        const isHit = hitDots.left.has(i);
        const currentDotRadius = isHit ? hitDotRadius : dotRadius;

        ctx.beginPath();
        ctx.arc(x, y, currentDotRadius, 0, Math.PI * 2);

        if (isHit) {
          // Bright green glow for hit
          ctx.fillStyle = '#22c55e';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 20;
        } else {
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw dots for inner circle (right rhythm)
      for (let i = 0; i < rightRhythm; i++) {
        const angle = (i / rightRhythm) * Math.PI * 2 - Math.PI / 2 + rotation;
        const x = centerX + Math.cos(angle) * innerRadius;
        const y = centerY + Math.sin(angle) * innerRadius;

        // Check if this dot was recently hit
        const isHit = hitDots.right.has(i);
        const currentDotRadius = isHit ? hitDotRadius : dotRadius;

        ctx.beginPath();
        ctx.arc(x, y, currentDotRadius, 0, Math.PI * 2);

        if (isHit) {
          // Bright green glow for hit
          ctx.fillStyle = '#22c55e';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 20;
        } else {
          ctx.fillStyle = '#f97316';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Calculate midpoint between circles
      const midRadius = (innerRadius + outerRadius) / 2;

      // Draw outer target line (F key - cyan)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - midRadius - gap / 2);
      ctx.lineTo(centerX, centerY - outerRadius - 15);
      if (activeKeyRef.current === 'left') {
        ctx.strokeStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 5;
      } else {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 3;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw inner target line (J key - orange)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - innerRadius + 15);
      ctx.lineTo(centerX, centerY - midRadius + gap / 2);
      if (activeKeyRef.current === 'right') {
        ctx.strokeStyle = '#f97316';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 5;
      } else {
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
        ctx.lineWidth = 3;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (gameRunning) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    // When game starts running, reset rotation only if coming from menu (not from failed)
    if (gameRunning && !wasRunningRef.current) {
      frozenRotationRef.current = 0; // Reset rotation when starting fresh
    }
    wasRunningRef.current = gameRunning;

    if (gameRunning) {
      animationRef.current = requestAnimationFrame(draw);
    } else {
      // Draw static state with frozen rotation
      draw();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [leftRhythm, rightRhythm, currentBpm, gameRunning, hitDots, audioContextRef]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="w-full max-w-[400px] mx-auto"
    />
  );
}

export function PolyrhythmGame() {
  const client = useClient();

  // Game mode: 'polyrhythm' or 'euclidean'
  const [mode, setMode] = useState('polyrhythm');

  // Game state
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'failed'
  const [leftRhythm, setLeftRhythm] = useState(3);
  const [rightRhythm, setRightRhythm] = useState(4);
  const [euclideanPreset, setEuclideanPreset] = useState(0); // Index into EUCLIDEAN_PRESETS
  const [bpm, setBpm] = useState(80);
  const [currentBpm, setCurrentBpm] = useState(80);
  const [difficulty, setDifficulty] = useState('easy');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [bestStreakEuclidean, setBestStreakEuclidean] = useState(0);

  // Visual feedback for hit dots
  const [hitDots, setHitDots] = useState({ left: new Set(), right: new Set() });
  const [hitDotsEuclidean, setHitDotsEuclidean] = useState(new Set());

  // Active key for target line highlighting
  const [activeKey, setActiveKey] = useState(null);

  // Sample playback state
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const sampleTimeoutsRef = useRef([]);

  // Euclidean pattern (computed)
  const euclideanPattern = EUCLIDEAN_PRESETS[euclideanPreset]
    ? euclidean(EUCLIDEAN_PRESETS[euclideanPreset].hits, EUCLIDEAN_PRESETS[euclideanPreset].steps)
    : [];

  // Refs for timing
  const schedulerRef = useRef(null);
  const cycleStartTimeRef = useRef(0);
  const cycleCountRef = useRef(0);
  const leftBeatsRef = useRef([]);
  const rightBeatsRef = useRef([]);
  const euclideanBeatsRef = useRef([]); // For Euclidean mode
  const hitBeatsRef = useRef({ left: new Set(), right: new Set() });
  const hitBeatsEuclideanRef = useRef(new Set());
  const lastMissTimeRef = useRef(0);
  const streakRef = useRef(0);
  const gameRunningRef = useRef(false);
  const currentBpmRef = useRef(80);
  const modeRef = useRef('polyrhythm');
  const audioContextRef = useRef(null);

  // Load settings from localStorage
  useEffect(() => {
    if (client) {
      setMode(loadStringValue(STORAGE_KEYS.mode, 'polyrhythm', ['polyrhythm', 'euclidean']));
      setLeftRhythm(loadSetting(STORAGE_KEYS.leftRhythm, 3));
      setRightRhythm(loadSetting(STORAGE_KEYS.rightRhythm, 4));
      setEuclideanPreset(loadSetting(STORAGE_KEYS.euclideanPreset, 0));
      setBpm(loadSetting(STORAGE_KEYS.bpm, 80));
      setDifficulty(loadStringValue(STORAGE_KEYS.difficulty, 'easy', ['easy', 'hard']));
      setBestStreak(loadSetting(STORAGE_KEYS.bestStreak, 0));
      setBestStreakEuclidean(loadSetting(STORAGE_KEYS.bestStreakEuclidean, 0));
    }
  }, [client]);

  // Keep mode ref in sync
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Save settings when they change
  useEffect(() => {
    if (client) saveSetting(STORAGE_KEYS.mode, mode);
  }, [client, mode]);

  useEffect(() => {
    if (client) saveSetting(STORAGE_KEYS.leftRhythm, leftRhythm);
  }, [client, leftRhythm]);

  useEffect(() => {
    if (client) saveSetting(STORAGE_KEYS.rightRhythm, rightRhythm);
  }, [client, rightRhythm]);

  useEffect(() => {
    if (client) saveSetting(STORAGE_KEYS.euclideanPreset, euclideanPreset);
  }, [client, euclideanPreset]);

  useEffect(() => {
    if (client) saveSetting(STORAGE_KEYS.bpm, bpm);
  }, [client, bpm]);

  useEffect(() => {
    if (client) saveSetting(STORAGE_KEYS.difficulty, difficulty);
  }, [client, difficulty]);

  useEffect(() => {
    if (client) saveSetting(STORAGE_KEYS.bestStreak, bestStreak);
  }, [client, bestStreak]);

  useEffect(() => {
    if (client) saveSetting(STORAGE_KEYS.bestStreakEuclidean, bestStreakEuclidean);
  }, [client, bestStreakEuclidean]);

  // Keep refs in sync
  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  useEffect(() => {
    currentBpmRef.current = currentBpm;
  }, [currentBpm]);

  // Initialize audio
  const initAudio = useCallback(async () => {
    if (!initialized) {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized = true;
    }
    // Store AudioContext reference for visual sync
    audioContextRef.current = getAudioContext();
  }, []);

  // Play click sound with stereo panning (only on user press)
  // Left (F) = C5, Right (J) = G5 (7 semitones apart - perfect fifth)
  const playClick = useCallback(async (pan, note) => {
    await initAudio();
    const ac = getAudioContext();
    const t = ac.currentTime + 0.01;
    await superdough({ s: 'triangle', note, gain: 0.6, pan }, t, 0.05);
  }, [initAudio]);

  // Play sample of the rhythm (up to 4 cycles)
  const playSample = useCallback(async () => {
    if (isPlayingSample) return;

    await initAudio();
    setIsPlayingSample(true);

    // Clear any existing timeouts
    sampleTimeoutsRef.current.forEach(t => clearTimeout(t));
    sampleTimeoutsRef.current = [];

    if (mode === 'euclidean') {
      // Euclidean mode - single rhythm
      const preset = EUCLIDEAN_PRESETS[euclideanPreset];
      if (!preset) return;

      const steps = preset.steps;
      const cycleDuration = (60 / bpm) * steps / 4; // 4 steps per beat
      const numCycles = Math.min(4, Math.ceil(8 / preset.hits));
      const totalDuration = cycleDuration * numCycles;
      const pattern = euclidean(preset.hits, preset.steps);

      // Schedule beats for hit positions
      const stepInterval = cycleDuration / steps;
      for (let cycle = 0; cycle < numCycles; cycle++) {
        for (let i = 0; i < steps; i++) {
          if (pattern[i]) {
            const delay = (cycle * cycleDuration + i * stepInterval) * 1000;
            const timeout = setTimeout(async () => {
              const ac = getAudioContext();
              await superdough({ s: 'triangle', note: 'C5', gain: 0.6, pan: 0 }, ac.currentTime, 0.05);
            }, delay);
            sampleTimeoutsRef.current.push(timeout);
          }
        }
      }

      const endTimeout = setTimeout(() => {
        setIsPlayingSample(false);
      }, totalDuration * 1000 + 100);
      sampleTimeoutsRef.current.push(endTimeout);
    } else {
      // Polyrhythm mode - two rhythms
      const cycleBeats = lcm(leftRhythm, rightRhythm);
      const cycleDuration = (60 / bpm) * cycleBeats / Math.max(leftRhythm, rightRhythm);
      const numCycles = Math.min(4, Math.ceil(8 / Math.max(leftRhythm, rightRhythm)));
      const totalDuration = cycleDuration * numCycles;

      // Schedule left rhythm beats (outer ring - C5)
      const leftBeatInterval = cycleDuration / leftRhythm;
      for (let cycle = 0; cycle < numCycles; cycle++) {
        for (let i = 0; i < leftRhythm; i++) {
          const delay = (cycle * cycleDuration + i * leftBeatInterval) * 1000;
          const timeout = setTimeout(async () => {
            const ac = getAudioContext();
            await superdough({ s: 'triangle', note: 'C5', gain: 0.6, pan: -0.8 }, ac.currentTime, 0.05);
          }, delay);
          sampleTimeoutsRef.current.push(timeout);
        }
      }

      // Schedule right rhythm beats (inner ring - G5)
      const rightBeatInterval = cycleDuration / rightRhythm;
      for (let cycle = 0; cycle < numCycles; cycle++) {
        for (let i = 0; i < rightRhythm; i++) {
          const delay = (cycle * cycleDuration + i * rightBeatInterval) * 1000;
          const timeout = setTimeout(async () => {
            const ac = getAudioContext();
            await superdough({ s: 'triangle', note: 'G5', gain: 0.6, pan: 0.8 }, ac.currentTime, 0.05);
          }, delay);
          sampleTimeoutsRef.current.push(timeout);
        }
      }

      const endTimeout = setTimeout(() => {
        setIsPlayingSample(false);
      }, totalDuration * 1000 + 100);
      sampleTimeoutsRef.current.push(endTimeout);
    }
  }, [isPlayingSample, initAudio, mode, leftRhythm, rightRhythm, euclideanPreset, bpm]);

  // Stop sample playback
  const stopSample = useCallback(() => {
    sampleTimeoutsRef.current.forEach(t => clearTimeout(t));
    sampleTimeoutsRef.current = [];
    setIsPlayingSample(false);
  }, []);

  // Calculate beat times for a rhythm within a cycle
  const calculateBeatTimes = useCallback((rhythm, cycleDuration, cycleStartTime) => {
    const beatInterval = cycleDuration / rhythm;
    const beats = [];
    for (let i = 0; i < rhythm; i++) {
      beats.push(cycleStartTime + i * beatInterval);
    }
    return beats;
  }, []);

  // Calculate beat times for Euclidean rhythm (only active beats)
  const calculateEuclideanBeatTimes = useCallback((pattern, cycleDuration, cycleStartTime) => {
    const steps = pattern.length;
    const stepInterval = cycleDuration / steps;
    const beats = [];
    for (let i = 0; i < steps; i++) {
      if (pattern[i]) {
        beats.push({ time: cycleStartTime + i * stepInterval, index: i });
      }
    }
    return beats;
  }, []);

  // Schedule beats for the current cycle (no audio, just timing)
  const scheduleCycle = useCallback((activeBpm) => {
    const ac = getAudioContext();
    const now = ac.currentTime;

    let cycleDuration;
    if (modeRef.current === 'euclidean') {
      const preset = EUCLIDEAN_PRESETS[euclideanPreset];
      if (!preset) return { cycleDuration: 1, timeUntilNextCycle: 1000 };
      const steps = preset.steps;
      cycleDuration = (60 / activeBpm) * steps / 4; // 4 steps per beat

      if (cycleStartTimeRef.current === 0 || now >= cycleStartTimeRef.current + cycleDuration) {
        cycleStartTimeRef.current = now + 0.1;
        cycleCountRef.current += 1;
        hitBeatsEuclideanRef.current = new Set();
      }

      const cycleStart = cycleStartTimeRef.current;
      const pattern = euclidean(preset.hits, preset.steps);
      euclideanBeatsRef.current = calculateEuclideanBeatTimes(pattern, cycleDuration, cycleStart);

      const timeUntilNextCycle = (cycleStart + cycleDuration - now) * 1000;
      return { cycleDuration, timeUntilNextCycle };
    } else {
      const cycleBeats = lcm(leftRhythm, rightRhythm);
      cycleDuration = (60 / activeBpm) * cycleBeats / Math.max(leftRhythm, rightRhythm);

      if (cycleStartTimeRef.current === 0 || now >= cycleStartTimeRef.current + cycleDuration) {
        cycleStartTimeRef.current = now + 0.1;
        cycleCountRef.current += 1;
        hitBeatsRef.current = { left: new Set(), right: new Set() };
      }

      const cycleStart = cycleStartTimeRef.current;

      // Calculate beat times (no audio scheduling)
      leftBeatsRef.current = calculateBeatTimes(leftRhythm, cycleDuration, cycleStart);
      rightBeatsRef.current = calculateBeatTimes(rightRhythm, cycleDuration, cycleStart);

      const timeUntilNextCycle = (cycleStart + cycleDuration - now) * 1000;
      return { cycleDuration, timeUntilNextCycle };
    }
  }, [leftRhythm, rightRhythm, euclideanPreset, calculateBeatTimes, calculateEuclideanBeatTimes]);

  // Check if a tap is within tolerance of any beat (polyrhythm mode)
  // Uses modular time to match visual position
  const checkHit = useCallback((side, tapTime, activeBpm) => {
    const rhythm = side === 'left' ? leftRhythm : rightRhythm;
    const cycleBeats = lcm(leftRhythm, rightRhythm);
    const cycleDuration = (60 / activeBpm) * cycleBeats / Math.max(leftRhythm, rightRhythm);
    const beatInterval = cycleDuration / rhythm;
    const tolerance = beatInterval * 0.2; // ±20% of beat interval

    // Get position in current cycle (0 to cycleDuration)
    const cyclePosition = tapTime % cycleDuration;

    // Find which beat is closest to the top (position 0)
    let closestBeat = null;
    let closestDiff = Infinity;
    let closestIndex = -1;

    for (let i = 0; i < rhythm; i++) {
      const beatPosition = (i * beatInterval) % cycleDuration;
      // Check distance considering wrap-around
      let diff = Math.abs(cyclePosition - beatPosition);
      if (diff > cycleDuration / 2) {
        diff = cycleDuration - diff;
      }
      if (diff < closestDiff) {
        closestDiff = diff;
        closestBeat = beatPosition;
        closestIndex = i;
      }
    }

    if (closestBeat !== null && closestDiff <= tolerance) {
      return { hit: true, index: closestIndex };
    }

    return { hit: false, index: -1 };
  }, [leftRhythm, rightRhythm]);

  // Check if a tap is within tolerance of any beat (Euclidean mode)
  const checkHitEuclidean = useCallback((tapTime, activeBpm) => {
    const preset = EUCLIDEAN_PRESETS[euclideanPreset];
    if (!preset) return { hit: false, index: -1 };

    const steps = preset.steps;
    const cycleDuration = (60 / activeBpm) * steps / 4;
    const stepInterval = cycleDuration / steps;
    const tolerance = stepInterval * 0.2; // ±20% of step interval
    const pattern = euclidean(preset.hits, preset.steps);

    // Get position in current cycle (0 to cycleDuration)
    const cyclePosition = tapTime % cycleDuration;

    // Find which active beat is closest to the top (position 0)
    let closestDiff = Infinity;
    let closestIndex = -1;

    for (let i = 0; i < steps; i++) {
      if (!pattern[i]) continue; // Skip rests

      const beatPosition = (i * stepInterval) % cycleDuration;
      // Check distance considering wrap-around
      let diff = Math.abs(cyclePosition - beatPosition);
      if (diff > cycleDuration / 2) {
        diff = cycleDuration - diff;
      }
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = i;
      }
    }

    if (closestIndex !== -1 && closestDiff <= tolerance) {
      return { hit: true, index: closestIndex };
    }

    return { hit: false, index: -1 };
  }, [euclideanPreset]);

  // Stop the game
  const stopGame = useCallback(() => {
    gameRunningRef.current = false;
    if (schedulerRef.current) {
      clearTimeout(schedulerRef.current);
      schedulerRef.current = null;
    }
    cycleStartTimeRef.current = 0;
    cycleCountRef.current = 0;
  }, []);

  // Handle key press
  const handleKeyDown = useCallback(async (e) => {
    if (gameState !== 'playing') return;

    const key = e.key.toLowerCase();

    // Euclidean mode: F key or Space
    if (modeRef.current === 'euclidean') {
      if (key !== 'f' && key !== ' ') return;
      e.preventDefault();

      const ac = getAudioContext();
      const tapTime = ac.currentTime;

      const { hit, index } = checkHitEuclidean(tapTime, currentBpmRef.current);

      // Highlight the target line
      setActiveKey('euclidean');
      setTimeout(() => setActiveKey(null), 100);

      // Always play click sound on user press
      await playClick(0, 'C5');

      if (hit) {
        setStreak(prev => prev + 1);

        // Show visual feedback for the hit dot
        setHitDotsEuclidean(prev => {
          const newSet = new Set(prev);
          newSet.add(index);
          return newSet;
        });

        // Clear the hit visual after a short delay
        setTimeout(() => {
          setHitDotsEuclidean(prev => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
          });
        }, 200);
      } else {
        const now = Date.now();
        if (now - lastMissTimeRef.current > 200) {
          lastMissTimeRef.current = now;

          if (difficulty === 'hard') {
            if (streakRef.current > bestStreakEuclidean) {
              setBestStreakEuclidean(streakRef.current);
            }
            setGameState('failed');
            stopGame();
          } else {
            setStreak(0);
          }
        }
      }
    } else {
      // Polyrhythm mode: F and J keys
      if (key !== 'f' && key !== 'j') return;
      e.preventDefault();

      const ac = getAudioContext();
      const tapTime = ac.currentTime;
      const side = key === 'f' ? 'left' : 'right';
      const pan = key === 'f' ? -0.8 : 0.8;
      const note = key === 'f' ? 'C5' : 'G5'; // 7 semitones apart (perfect fifth)

      const { hit, index } = checkHit(side, tapTime, currentBpmRef.current);

      // Highlight the target line
      setActiveKey(side);
      setTimeout(() => setActiveKey(null), 100);

      // Always play click sound on user press
      await playClick(pan, note);

      if (hit) {
        setStreak(prev => prev + 1);

        // Show visual feedback for the hit dot
        setHitDots(prev => {
          const newSet = new Set(prev[side]);
          newSet.add(index);
          return { ...prev, [side]: newSet };
        });

        // Clear the hit visual after a short delay
        setTimeout(() => {
          setHitDots(prev => {
            const newSet = new Set(prev[side]);
            newSet.delete(index);
            return { ...prev, [side]: newSet };
          });
        }, 200);
      } else {
        const now = Date.now();
        if (now - lastMissTimeRef.current > 200) {
          lastMissTimeRef.current = now;

          if (difficulty === 'hard') {
            if (streakRef.current > bestStreak) {
              setBestStreak(streakRef.current);
            }
            setGameState('failed');
            stopGame();
          } else {
            setStreak(0);
          }
        }
      }
    }
  }, [gameState, checkHit, checkHitEuclidean, difficulty, bestStreak, bestStreakEuclidean, stopGame, playClick]);

  // Set up keyboard listener
  useEffect(() => {
    if (gameState === 'playing') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameState, handleKeyDown]);

  // Start the game
  const handleStart = useCallback(async () => {
    await initAudio();

    setStreak(0);
    streakRef.current = 0;
    setCurrentBpm(bpm);
    currentBpmRef.current = bpm;
    setGameState('playing');
    cycleStartTimeRef.current = 0;
    cycleCountRef.current = 0;

    if (mode === 'euclidean') {
      hitBeatsEuclideanRef.current = new Set();
      setHitDotsEuclidean(new Set());
    } else {
      hitBeatsRef.current = { left: new Set(), right: new Set() };
      setHitDots({ left: new Set(), right: new Set() });
    }

    gameRunningRef.current = true;

    const runScheduler = (activeBpm) => {
      if (!gameRunningRef.current) return;

      const { timeUntilNextCycle } = scheduleCycle(activeBpm);

      schedulerRef.current = setTimeout(() => {
        if (!gameRunningRef.current) return;

        let newBpm = activeBpm;
        if (difficulty === 'hard' && cycleCountRef.current > 0 && cycleCountRef.current % 4 === 0) {
          newBpm = Math.min(activeBpm + 2, 200);
          setCurrentBpm(newBpm);
          currentBpmRef.current = newBpm;
        }
        runScheduler(newBpm);
      }, timeUntilNextCycle);
    };

    runScheduler(bpm);
  }, [bpm, mode, difficulty, initAudio, scheduleCycle]);

  // Handle restart
  const handleRestart = useCallback(() => {
    stopGame();
    setGameState('menu');
    setStreak(0);
    setHitDots({ left: new Set(), right: new Set() });
    setHitDotsEuclidean(new Set());
  }, [stopGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopGame();
  }, [stopGame]);

  if (!client) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="flex flex-col gap-4">
          <div className="border-2 border-lineHighlight rounded-xl p-6 bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Mode Selection */}
            <h2 className="text-xl font-bold font-mono text-foreground mb-4">Mode</h2>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setMode('polyrhythm')}
                className={`flex-1 px-6 py-4 rounded-lg font-mono font-bold transition-all ${
                  mode === 'polyrhythm'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Polyrhythm
              </button>
              <button
                onClick={() => setMode('euclidean')}
                className={`flex-1 px-6 py-4 rounded-lg font-mono font-bold transition-all ${
                  mode === 'euclidean'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Euclidean
              </button>
            </div>
            <p className="text-xs text-gray-500 font-mono mb-6">
              {mode === 'polyrhythm'
                ? 'Two simultaneous rhythms - use F and J keys'
                : 'Single Euclidean rhythm pattern - use F key or Space'}
            </p>

            {/* Difficulty Selection */}
            <h2 className="text-xl font-bold font-mono text-foreground mb-4">Difficulty</h2>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setDifficulty('easy')}
                className={`flex-1 px-6 py-4 rounded-lg font-mono font-bold transition-all ${
                  difficulty === 'easy'
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => setDifficulty('hard')}
                className={`flex-1 px-6 py-4 rounded-lg font-mono font-bold transition-all ${
                  difficulty === 'hard'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Hard
              </button>
            </div>
            <p className="text-xs text-gray-500 font-mono mb-6">
              {difficulty === 'easy'
                ? 'Practice mode. Miss a beat? Streak resets but keep playing!'
                : 'Challenge mode. BPM increases over time. One miss = game over!'}
            </p>

            {/* Rhythm Selection - Conditional based on mode */}
            {mode === 'polyrhythm' ? (
              <>
                <h2 className="text-xl font-bold font-mono text-foreground mb-4">Select Rhythms</h2>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-mono text-cyan-400 mb-2">
                      Outer Ring (F key)
                    </label>
                    <select
                      value={leftRhythm}
                      onChange={(e) => setLeftRhythm(parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg font-mono bg-gray-700 text-foreground border border-cyan-600 focus:outline-none focus:border-cyan-400"
                    >
                      {RHYTHM_OPTIONS.map(n => (
                        <option key={n} value={n} disabled={n === rightRhythm}>
                          {n} beats per cycle
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-mono text-orange-400 mb-2">
                      Inner Ring (J key)
                    </label>
                    <select
                      value={rightRhythm}
                      onChange={(e) => setRightRhythm(parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg font-mono bg-gray-700 text-foreground border border-orange-600 focus:outline-none focus:border-orange-400"
                    >
                      {RHYTHM_OPTIONS.map(n => (
                        <option key={n} value={n} disabled={n === leftRhythm}>
                          {n} beats per cycle
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold font-mono text-foreground mb-4">Select Euclidean Rhythm</h2>
                <div className="mb-6">
                  <label className="block text-sm font-mono text-purple-400 mb-2">
                    Pattern (F key or Space)
                  </label>
                  <select
                    value={euclideanPreset}
                    onChange={(e) => setEuclideanPreset(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg font-mono bg-gray-700 text-foreground border border-purple-600 focus:outline-none focus:border-purple-400"
                  >
                    {EUCLIDEAN_PRESETS.map((preset, i) => (
                      <option key={i} value={i}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* BPM Slider */}
            <h2 className="text-xl font-bold font-mono text-foreground mb-4">Tempo</h2>
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-sm text-gray-400 whitespace-nowrap">BPM:</span>
              <input
                type="range"
                min="40"
                max="200"
                step="1"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="font-mono text-sm text-cyan-400 font-bold w-12 text-right">{bpm}</span>
            </div>

            {/* Rhythm Display */}
            <div className="text-center mb-6">
              {mode === 'polyrhythm' ? (
                <>
                  <span className="text-3xl font-bold font-mono text-foreground">
                    {leftRhythm}:{rightRhythm}
                  </span>
                  <span className="text-sm text-gray-500 font-mono ml-2">polyrhythm</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold font-mono text-foreground">
                    E({EUCLIDEAN_PRESETS[euclideanPreset]?.hits},{EUCLIDEAN_PRESETS[euclideanPreset]?.steps})
                  </span>
                  <span className="text-sm text-gray-500 font-mono ml-2">euclidean</span>
                </>
              )}
            </div>

            {/* Play Sample / Start Game buttons */}
            <div className="flex gap-4">
              <button
                onClick={isPlayingSample ? stopSample : playSample}
                className={`flex-1 px-6 py-4 rounded-xl font-mono font-bold text-lg transition-all ${
                  isPlayingSample
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                }`}
              >
                {isPlayingSample ? 'Stop' : 'Play Sample'}
              </button>
              <button
                onClick={handleStart}
                disabled={isPlayingSample}
                className="flex-1 px-6 py-4 rounded-xl font-mono font-bold text-lg bg-green-600 hover:bg-green-700 text-white transition-all shadow-xl hover:shadow-green-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Start Game
              </button>
            </div>
          </div>

          {((mode === 'polyrhythm' && bestStreak > 0) || (mode === 'euclidean' && bestStreakEuclidean > 0)) && (
            <div className="text-center">
              <div className="text-sm text-gray-400 font-mono">Best Streak</div>
              <div className="text-3xl font-bold text-cyan-400 font-mono">
                {mode === 'polyrhythm' ? bestStreak : bestStreakEuclidean}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 font-mono space-y-2">
            <p><strong>How to Play:</strong></p>
            {mode === 'polyrhythm' ? (
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Watch the spinning circles - each dot is a beat</li>
                <li>Press <kbd className="px-2 py-1 bg-gray-700 rounded text-cyan-400">F</kbd> when outer ring dots reach the top</li>
                <li>Press <kbd className="px-2 py-1 bg-gray-700 rounded text-orange-400">J</kbd> when inner ring dots reach the top</li>
                <li>Build your streak by hitting beats accurately!</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Watch the spinning circle - bright dots are beats to hit</li>
                <li>Press <kbd className="px-2 py-1 bg-gray-700 rounded text-purple-400">F</kbd> or <kbd className="px-2 py-1 bg-gray-700 rounded text-purple-400">Space</kbd> when a bright dot reaches the top</li>
                <li>Dim dots are rests - don't press on those!</li>
                <li>Build your streak by hitting beats accurately!</li>
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="text-4xl md:text-5xl font-bold font-mono text-foreground">
              {mode === 'polyrhythm'
                ? `${leftRhythm}:${rightRhythm}`
                : `E(${EUCLIDEAN_PRESETS[euclideanPreset]?.hits},${EUCLIDEAN_PRESETS[euclideanPreset]?.steps})`
              }
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono text-gray-400">
                BPM: <span className="text-cyan-400 font-bold">{currentBpm}</span>
              </div>
              <button
                onClick={handleRestart}
                className="px-3 py-1 rounded-lg font-mono text-sm font-bold bg-gray-600 hover:bg-gray-700 text-white transition-all"
              >
                Menu
              </button>
            </div>
          </div>

          {/* Streak Display */}
          <div className="text-center">
            <div className="text-sm text-gray-400 font-mono">Streak</div>
            <div className="text-6xl font-bold text-cyan-400 font-mono">{streak}</div>
            {((mode === 'polyrhythm' && bestStreak > 0) || (mode === 'euclidean' && bestStreakEuclidean > 0)) && (
              <div className="text-xs text-gray-500 font-mono mt-1">
                Best: {mode === 'polyrhythm' ? bestStreak : bestStreakEuclidean}
              </div>
            )}
          </div>

          {/* Spinning Circles Visualization */}
          <div className="border-2 border-lineHighlight rounded-xl p-4 bg-gradient-to-br from-gray-900 to-gray-800">
            {mode === 'polyrhythm' ? (
              <SpinningCircles
                leftRhythm={leftRhythm}
                rightRhythm={rightRhythm}
                currentBpm={currentBpm}
                gameRunning={gameState === 'playing'}
                hitDots={hitDots}
                activeKey={activeKey}
                audioContextRef={audioContextRef}
              />
            ) : (
              <SpinningCircleEuclidean
                pattern={euclideanPattern}
                currentBpm={currentBpm}
                gameRunning={gameState === 'playing'}
                hitDots={hitDotsEuclidean}
                activeKey={activeKey}
                audioContextRef={audioContextRef}
              />
            )}
          </div>

          {/* Key Labels */}
          {mode === 'polyrhythm' ? (
            <div className="flex justify-center gap-16 text-center">
              <div>
                <kbd className="px-4 py-2 bg-gray-700 rounded-lg text-2xl font-mono text-cyan-400 font-bold">F</kbd>
                <div className="text-xs text-gray-500 font-mono mt-1">Outer ({leftRhythm})</div>
              </div>
              <div>
                <kbd className="px-4 py-2 bg-gray-700 rounded-lg text-2xl font-mono text-orange-400 font-bold">J</kbd>
                <div className="text-xs text-gray-500 font-mono mt-1">Inner ({rightRhythm})</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center gap-8 text-center">
              <div>
                <kbd className="px-4 py-2 bg-gray-700 rounded-lg text-2xl font-mono text-purple-400 font-bold">F</kbd>
                <div className="text-xs text-gray-500 font-mono mt-1">or</div>
              </div>
              <div>
                <kbd className="px-4 py-2 bg-gray-700 rounded-lg text-2xl font-mono text-purple-400 font-bold">Space</kbd>
                <div className="text-xs text-gray-500 font-mono mt-1">Hit the beat!</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Failed Screen */}
      {gameState === 'failed' && (
        <div className="flex flex-col gap-6 items-center">
          <div className="border-2 border-red-600 rounded-xl p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-center">
            <h2 className="text-3xl font-bold font-mono text-red-400 mb-4">Game Over!</h2>

            <div className="text-sm text-gray-400 font-mono mb-2">Final Streak</div>
            <div className="text-6xl font-bold text-cyan-400 font-mono mb-4">{streak}</div>

            {((mode === 'polyrhythm' && streak >= bestStreak && streak > 0) ||
              (mode === 'euclidean' && streak >= bestStreakEuclidean && streak > 0)) && (
              <div className="text-lg font-mono text-green-400 mb-4">New Best!</div>
            )}

            <div className="text-sm text-gray-500 font-mono mb-6">
              Final BPM: {currentBpm}
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-4 rounded-xl font-mono font-bold text-lg bg-green-600 hover:bg-green-700 text-white transition-all shadow-xl hover:shadow-green-500/50 hover:scale-105 mr-4"
            >
              Try Again
            </button>
            <button
              onClick={handleRestart}
              className="px-8 py-4 rounded-xl font-mono font-bold text-lg bg-gray-600 hover:bg-gray-700 text-white transition-all"
            >
              Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
