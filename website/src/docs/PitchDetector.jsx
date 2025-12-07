import { useState, useEffect, useCallback, useRef } from 'react';
import { usePitchDetection } from './usePitchDetection';
import { useStrudelSound } from './useStrudelSound';
import { SoundSelector } from './SoundSelector';
import { generateStrudelPattern } from './generateStrudelPattern';
import { detectChord } from './detectChord';
import { MiniRepl } from './MiniRepl';
import useClient from '@src/useClient.mjs';
import { setOrbitGain } from '@strudel/webaudio';

export function PitchDetector({ defaultSound = 'piano' }) {
  const client = useClient();

  // Pitch detection hook
  const {
    isListening,
    startListening,
    stopListening,
    currentNote,
    frequency,
    clarity,
    error,
  } = usePitchDetection();

  // Audio playback hook
  const {
    sound,
    setSound,
    loading,
    initAudio,
  } = useStrudelSound({ defaultSound, notes: [] });

  // Local state
  const [recordedNotes, setRecordedNotes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [pickedNotes, setPickedNotes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [detectedChord, setDetectedChord] = useState(null);
  const [minClarity, setMinClarity] = useState(0.99);
  const [debounceMs, setDebounceMs] = useState(400);
  const lastRecordedTimeRef = useRef(0);
  const playbackTimeoutRef = useRef(null);

  /**
   * Start microphone listening
   */
  const handleStart = useCallback(async () => {
    await initAudio(); // Initialize Strudel audio first
    await startListening();
  }, [initAudio, startListening]);

  /**
   * Toggle recording mode
   */
  const handleToggleRecording = useCallback(() => {
    setIsRecording((prev) => {
      if (!prev) {
        setRecordedNotes([]);
        return true;
      } else {
        return false;
      }
    });
  }, []);

  /**
   * Pick the current note and add to picked notes
   */
  const handlePickNote = useCallback(() => {
    if (currentNote) {
      setPickedNotes((prev) => [...prev, currentNote]);
    }
  }, [currentNote]);

  /**
   * Clear picked notes and stop playback
   */
  const handleResetPicked = useCallback(() => {
    // Clear any pending playback timeout
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }

    setOrbitGain(0, 0); // Mute orbit 0 to stop playback
    setIsPlaying(false);
    setPickedNotes([]);
    setDetectedChord(null);
    // Restore gain after a brief moment
    setTimeout(() => setOrbitGain(0, 1), 100);
  }, []);

  /**
   * Remove a specific picked note by index
   */
  const handleRemoveNote = useCallback((index) => {
    setPickedNotes((prev) => prev.filter((_, i) => i !== index));
    setDetectedChord(null);
  }, []);

  /**
   * Play back the picked notes sequentially
   */
  const handlePlaySequential = useCallback(async () => {
    if (pickedNotes.length === 0 || isPlaying) return;

    setIsPlaying(true);
    await initAudio();

    const { superdough } = await import('@strudel/webaudio');
    const { getAudioContext } = await import('@strudel/webaudio');
    const ac = getAudioContext();

    for (let i = 0; i < pickedNotes.length; i++) {
      const note = pickedNotes[i];
      const t = ac.currentTime + (i * 0.5); // 0.5 seconds between notes
      await superdough({ s: 'triangle', note }, t, 0.4);
    }

    // Reset playing state after sequence finishes
    playbackTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      playbackTimeoutRef.current = null;
    }, pickedNotes.length * 500 + 500);
  }, [pickedNotes, isPlaying, initAudio]);

  /**
   * Play back all picked notes simultaneously (chord)
   */
  const handlePlaySimultaneous = useCallback(async () => {
    if (pickedNotes.length === 0 || isPlaying) return;

    // Detect chord
    const chord = detectChord(pickedNotes);
    setDetectedChord(chord);

    setIsPlaying(true);
    await initAudio();

    const { superdough } = await import('@strudel/webaudio');
    const { getAudioContext } = await import('@strudel/webaudio');
    const ac = getAudioContext();

    const t = ac.currentTime + 0.01;
    // Play all notes at the same time
    for (const note of pickedNotes) {
      await superdough({ s: 'triangle', note }, t, 1.0);
    }

    // Reset playing state after chord finishes
    playbackTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      playbackTimeoutRef.current = null;
    }, 1200);
  }, [pickedNotes, isPlaying, initAudio]);

  /**
   * Play recorded notes sequentially
   */
  const handlePlayRecordedSequential = useCallback(async () => {
    if (recordedNotes.length === 0 || isPlaying) return;

    setIsPlaying(true);
    await initAudio();

    const { superdough, getAudioContext } = await import('@strudel/webaudio');
    const ac = getAudioContext();

    for (let i = 0; i < recordedNotes.length; i++) {
      const note = recordedNotes[i];
      const t = ac.currentTime + (i * 0.5);
      await superdough({ s: 'triangle', note }, t, 0.4);
    }

    playbackTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      playbackTimeoutRef.current = null;
    }, recordedNotes.length * 500 + 500);
  }, [recordedNotes, isPlaying, initAudio]);

  /**
   * Play recorded notes as chord
   */
  const handlePlayRecordedChord = useCallback(async () => {
    if (recordedNotes.length === 0 || isPlaying) return;

    setIsPlaying(true);
    await initAudio();

    const { superdough, getAudioContext } = await import('@strudel/webaudio');
    const ac = getAudioContext();

    const t = ac.currentTime + 0.01;
    for (const note of recordedNotes) {
      await superdough({ s: 'triangle', note }, t, 1.0);
    }

    playbackTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      playbackTimeoutRef.current = null;
    }, 1200);
  }, [recordedNotes, isPlaying, initAudio]);

  /**
   * Remove a recorded note by index
   */
  const handleRemoveRecordedNote = useCallback((index) => {
    setRecordedNotes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Clear recorded notes and stop playback
   */
  const handleClearNotes = useCallback(() => {
    // Clear any pending playback timeout
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }

    setOrbitGain(0, 0); // Mute orbit 0 to stop playback
    setIsPlaying(false);
    setRecordedNotes([]);
    // Restore gain after a brief moment
    setTimeout(() => setOrbitGain(0, 1), 100);
  }, []);

  // Effect: Record notes when detected during recording mode
  useEffect(() => {
    if (isRecording && currentNote && clarity >= minClarity) {
      const now = Date.now();
      const timeSinceLastRecord = now - lastRecordedTimeRef.current;

      // Debounce: only record if enough time has passed since last record
      if (timeSinceLastRecord >= debounceMs) {
        // Update timestamp before checking for duplicates
        lastRecordedTimeRef.current = now;

        setRecordedNotes((prev) => {
          const last = prev[prev.length - 1];
          // Only add if different from last note (deduplicate)
          if (last !== currentNote) {
            return [...prev, currentNote];
          }
          return prev;
        });
      }
    }
  }, [currentNote, isRecording, clarity, minClarity, debounceMs]);

  // SSR guard
  if (!client) {
    return <div className="text-gray-400">Loading pitch detector...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Error Display */}
      {error && (
        <div className="border border-red-500 rounded-lg p-3 bg-red-900/20 text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Sound Selector */}
      <SoundSelector sound={sound} setSound={setSound} loading={loading} />

      {/* Recording Settings - always visible */}
      <div className="border-2 border-lineHighlight rounded-xl p-3 bg-gradient-to-br from-gray-900 to-gray-800">
        <h3 className="font-mono font-bold text-foreground text-sm mb-3">Recording Settings</h3>

        <div className="flex gap-6">
          {/* Confidence Threshold Slider */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono text-xs text-gray-300">
                Min Confidence: <span className="text-green-400 font-bold">{(minClarity * 100).toFixed(0)}%</span>
              </label>
              {isListening && (
                <span className="text-xs text-gray-500 font-mono">
                  {clarity >= minClarity ? '✓ Will Record' : '✗ Too Low'}
                </span>
              )}
            </div>
            <input
              type="range"
              min="90"
              max="100"
              step="1"
              value={minClarity * 100}
              onChange={(e) => setMinClarity(parseFloat(e.target.value) / 100)}
              className="w-1/2 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="text-xs text-gray-500 mt-1 font-mono">
              Higher = fewer false positives
            </div>
          </div>

          {/* Debounce Slider */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono text-xs text-gray-300">
                Debounce: <span className="text-blue-400 font-bold">{debounceMs}ms</span>
              </label>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={debounceMs}
              onChange={(e) => setDebounceMs(parseInt(e.target.value))}
              className="w-1/2 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="text-xs text-gray-500 mt-1 font-mono">
              Min time between notes
            </div>
          </div>
        </div>
      </div>

      {/* Pitch Display */}
      <div className="border-2 border-lineHighlight rounded-2xl p-8 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
        <div className="text-center">
          <div className={`text-8xl font-black mb-3 transition-all duration-300 ${
            currentNote
              ? 'text-green-400 scale-110 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]'
              : 'text-gray-600 scale-100'
          }`}>
            {currentNote || '—'}
          </div>
          <div className="text-lg text-gray-400 font-mono font-semibold mb-6">
            {frequency ? `${frequency.toFixed(1)} Hz` : 'Waiting for input...'}
          </div>
          <div className="mt-6 mb-6">
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className={`h-4 rounded-full transition-all duration-300 ${
                  clarity > 0.9
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                    : clarity > 0.7
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                    : 'bg-gradient-to-r from-red-500 to-rose-400'
                }`}
                style={{ width: `${(clarity * 100).toFixed(0)}%` }}
              />
            </div>
            <div className="text-sm text-gray-400 mt-2 font-mono">
              Confidence: {(clarity * 100).toFixed(0)}%
            </div>
          </div>

          {/* Control buttons */}
          {!isListening ? (
            <button
              onClick={handleStart}
              className="mt-4 px-8 py-4 rounded-xl font-mono font-bold text-lg transition-all shadow-xl bg-green-600 hover:bg-green-700 text-white hover:shadow-green-500/50 hover:scale-105"
            >
              🎤 Start
            </button>
          ) : (
            <div className="mt-4 flex gap-3 justify-center">
              <button
                onClick={handlePickNote}
                disabled={!currentNote || isRecording}
                className={`px-8 py-4 rounded-xl font-mono font-bold text-lg transition-all shadow-xl ${
                  currentNote && !isRecording
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-purple-500/50 hover:scale-105'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                }`}
              >
                ✓ Pick
              </button>

              <button
                onClick={handleToggleRecording}
                className={`px-8 py-4 rounded-xl font-mono font-bold text-lg transition-all shadow-xl ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-500/50 hover:scale-105'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/50 hover:scale-105'
                }`}
              >
                {isRecording ? '⏹ Stop' : '⏺ Auto'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Picked Notes Section */}
      <div className="border-2 border-lineHighlight rounded-xl p-4 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-mono font-bold text-foreground text-xl">
            Picked Notes ({pickedNotes.length})
          </h3>
          {pickedNotes.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handlePlaySequential}
                disabled={isPlaying}
                className="px-4 py-2 rounded-lg font-mono text-sm font-bold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-green-500/50"
              >
                {isPlaying ? '▶ Playing...' : '▶ Sequential'}
              </button>
              <button
                onClick={handlePlaySimultaneous}
                disabled={isPlaying}
                className="px-4 py-2 rounded-lg font-mono text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/50"
              >
                {isPlaying ? '♫ Playing...' : '♫ Chord'}
              </button>
              <button
                onClick={handleResetPicked}
                className="px-4 py-2 rounded-lg font-mono text-sm font-bold bg-gray-600 hover:bg-gray-700 text-white transition-all shadow-lg hover:shadow-gray-500/50"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {pickedNotes.length > 0 ? (
          <>
            {/* Mini REPL with editable Strudel code */}
            <MiniRepl
              key={pickedNotes.join(' ') + (detectedChord || '')}
              tune={
                detectedChord
                  ? `// ${detectedChord} chord\n${generateStrudelPattern(pickedNotes, sound)}`
                  : generateStrudelPattern(pickedNotes, sound)
              }
              maxHeight={200}
            />

            {/* Individual note chips with remove buttons */}
            <div className="mt-3 border-2 border-lineHighlight rounded-xl p-4 bg-gradient-to-br from-gray-900 to-gray-800">
              <div className="text-sm text-gray-400 font-mono mb-3 font-semibold">
                Click × to remove notes:
              </div>
              <div className="flex flex-wrap gap-2">
                {pickedNotes.map((note, index) => (
                  <button
                    key={index}
                    onClick={() => handleRemoveNote(index)}
                    className="group px-4 py-2 rounded-lg bg-gradient-to-r from-gray-700 to-gray-600 hover:from-red-600 hover:to-red-500 font-mono font-bold text-foreground transition-all flex items-center gap-2 shadow-lg hover:shadow-red-500/50 hover:scale-105"
                    title={`Remove ${note}`}
                  >
                    <span className="text-lg">{note}</span>
                    <span className="text-gray-400 group-hover:text-white text-xl">×</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded border border-lineHighlight mt-3">
              Edit the code above and press play to hear your pattern. Press the refresh button after editing.
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 font-mono py-8">
            Click "Pick" to add notes here
          </div>
        )}
      </div>

      {/* Recorded Notes Display */}
      {recordedNotes.length > 0 && (
        <div className="border-2 border-lineHighlight rounded-xl p-4 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-mono font-bold text-foreground text-xl">
              Recorded Notes ({recordedNotes.length})
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handlePlayRecordedSequential}
                disabled={isPlaying}
                className="px-4 py-2 rounded-lg font-mono text-sm font-bold bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-green-500/50"
              >
                {isPlaying ? '▶ Playing...' : '▶ Sequential'}
              </button>
              <button
                onClick={handlePlayRecordedChord}
                disabled={isPlaying}
                className="px-4 py-2 rounded-lg font-mono text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/50"
              >
                {isPlaying ? '♫ Playing...' : '♫ Chord'}
              </button>
              <button
                onClick={handleClearNotes}
                className="px-4 py-2 rounded-lg font-mono text-sm font-bold bg-gray-600 hover:bg-gray-700 text-white transition-all shadow-lg hover:shadow-gray-500/50"
              >
                Clear
              </button>
            </div>
          </div>
          {/* Mini REPL for recorded notes */}
          <MiniRepl
            key={recordedNotes.join(' ')}
            tune={generateStrudelPattern(recordedNotes, sound)}
            maxHeight={200}
          />

          {/* Individual note chips with remove buttons */}
          <div className="mt-3 border-2 border-lineHighlight rounded-xl p-4 bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-sm text-gray-400 font-mono mb-3 font-semibold">
              Click × to remove notes:
            </div>
            <div className="flex flex-wrap gap-2">
              {recordedNotes.map((note, i) => (
                <button
                  key={i}
                  onClick={() => handleRemoveRecordedNote(i)}
                  className="group px-4 py-2 rounded-lg bg-gradient-to-r from-gray-700 to-gray-600 hover:from-red-600 hover:to-red-500 font-mono font-bold text-foreground transition-all flex items-center gap-2 shadow-lg hover:shadow-red-500/50 hover:scale-105"
                  title={`Remove ${note}`}
                >
                  <span className="text-lg">{note}</span>
                  <span className="text-gray-400 group-hover:text-white text-xl">×</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-500 font-mono">
        <strong>Pick</strong> adds the current note manually. <strong>Auto</strong> captures notes automatically at {(minClarity * 100).toFixed(0)}%+ confidence.
      </div>
    </div>
  );
}
