import { useState, useEffect, useCallback } from 'react';
import { usePitchDetection } from './usePitchDetection';
import { useStrudelSound } from './useStrudelSound';
import { SoundSelector, CodeDisplay } from './SoundSelector';
import { generateStrudelPattern } from './generateStrudelPattern';
import { detectChord } from './detectChord';
import { MiniRepl } from './MiniRepl';
import useClient from '@src/useClient.mjs';

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
  const [autoPlayback, setAutoPlayback] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [pickedNotes, setPickedNotes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [detectedChord, setDetectedChord] = useState(null);

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
    if (!isRecording) {
      setRecordedNotes([]);
      setIsRecording(true);
    } else {
      setIsRecording(false);
    }
  }, [isRecording]);

  /**
   * Pick the current note and add to picked notes
   */
  const handlePickNote = useCallback(() => {
    if (currentNote) {
      setPickedNotes((prev) => [...prev, currentNote]);
    }
  }, [currentNote]);

  /**
   * Clear picked notes
   */
  const handleResetPicked = useCallback(() => {
    setPickedNotes([]);
    setDetectedChord(null);
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
    setTimeout(() => setIsPlaying(false), pickedNotes.length * 500 + 500);
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
    setTimeout(() => setIsPlaying(false), 1200);
  }, [pickedNotes, isPlaying, initAudio]);

  /**
   * Copy generated Strudel pattern to clipboard
   */
  const handleCopyPattern = useCallback(async () => {
    const pattern = generateStrudelPattern(recordedNotes, sound);
    try {
      await navigator.clipboard.writeText(pattern);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [recordedNotes, sound]);

  /**
   * Clear recorded notes
   */
  const handleClearNotes = useCallback(() => {
    setRecordedNotes([]);
  }, []);

  // Effect: Record notes when detected during recording mode
  useEffect(() => {
    if (isRecording && currentNote) {
      setRecordedNotes((prev) => {
        const last = prev[prev.length - 1];
        // Only add if different from last note (deduplicate)
        if (last !== currentNote) {
          return [...prev, currentNote];
        }
        return prev;
      });
    }
  }, [currentNote, isRecording]);

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

      {/* Main Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={isListening ? stopListening : handleStart}
          className={`px-4 py-2 rounded font-mono transition-colors ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isListening ? '⏹ Stop' : '🎤 Start'}
        </button>

        <button
          onClick={handleToggleRecording}
          disabled={!isListening}
          className={`px-4 py-2 rounded font-mono transition-colors ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {isRecording ? '⏹ Stop Recording' : '⏺ Record'}
        </button>

        {recordedNotes.length > 0 && (
          <button
            onClick={handleClearNotes}
            className="px-4 py-2 rounded font-mono bg-gray-600 hover:bg-gray-700 text-white transition-colors"
          >
            🗑 Clear
          </button>
        )}
      </div>

      {/* Pitch Display */}
      <div className="border border-lineHighlight rounded-lg p-6 bg-background">
        <div className="text-center">
          <div className={`text-6xl font-bold mb-2 transition-colors ${
            currentNote ? 'text-green-400' : 'text-gray-600'
          }`}>
            {currentNote || '—'}
          </div>
          <div className="text-sm text-gray-400 font-mono">
            {frequency ? `${frequency.toFixed(1)} Hz` : '—'}
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${
                  clarity > 0.9 ? 'bg-green-500' : clarity > 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(clarity * 100).toFixed(0)}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Clarity: {(clarity * 100).toFixed(0)}%
            </div>
          </div>

          {/* Pick button */}
          <button
            onClick={handlePickNote}
            disabled={!currentNote || !isListening}
            className="mt-4 px-6 py-2 rounded font-mono bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ✓ Pick
          </button>
        </div>
      </div>

      {/* Picked Notes Mini REPL */}
      {pickedNotes.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-mono font-bold text-foreground">
              Picked Notes ({pickedNotes.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handlePlaySequential}
                disabled={isPlaying}
                className="px-3 py-1 rounded font-mono text-sm bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPlaying ? '▶ Playing...' : '▶ Sequential'}
              </button>
              <button
                onClick={handlePlaySimultaneous}
                disabled={isPlaying}
                className="px-3 py-1 rounded font-mono text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPlaying ? '♫ Playing...' : '♫ Chord'}
              </button>
              <button
                onClick={handleResetPicked}
                className="px-3 py-1 rounded font-mono text-sm bg-gray-600 hover:bg-gray-700 text-white transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

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
          <div className="border border-lineHighlight rounded-lg p-3 bg-background">
            <div className="text-xs text-gray-400 font-mono mb-2">
              Click × to remove individual notes:
            </div>
            <div className="flex flex-wrap gap-2">
              {pickedNotes.map((note, index) => (
                <button
                  key={index}
                  onClick={() => handleRemoveNote(index)}
                  className="group px-3 py-1 rounded bg-gray-700 hover:bg-red-600 font-mono text-foreground transition-colors flex items-center gap-1"
                  title={`Remove ${note}`}
                >
                  <span>{note}</span>
                  <span className="text-gray-400 group-hover:text-white">×</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded border border-lineHighlight">
            Edit the code above and press play to hear your pattern. Press the refresh button after editing.
          </div>
        </div>
      )}

      {/* Recorded Notes Display */}
      {recordedNotes.length > 0 && (
        <div className="border border-lineHighlight rounded-lg p-4 bg-background">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-mono font-bold text-foreground">
              Recorded Notes ({recordedNotes.length})
            </h3>
            <button
              onClick={handleCopyPattern}
              className={`px-3 py-1 rounded font-mono text-sm transition-colors ${
                copySuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copySuccess ? '✓ Copied!' : '📋 Copy Strudel Code'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {recordedNotes.map((note, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded bg-gray-700 font-mono text-foreground"
              >
                {note}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded">
            {generateStrudelPattern(recordedNotes, sound)}
          </div>
        </div>
      )}

      {/* Code Display (current note) */}
      {currentNote && <CodeDisplay sound={sound} lastNote={currentNote} />}

      {/* Help Text */}
      <div className="text-sm text-gray-400 font-mono space-y-1">
        <p>
          <strong>Instructions:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Click "Start" and allow microphone access</li>
          <li>Hum or sing a note to detect its pitch</li>
          <li>Click "Pick" to add the current note to your sequence</li>
          <li>Use "Playback" to hear your picked notes</li>
          <li>Click the text area to select and copy your notes</li>
          <li>Or use "Record" for automatic continuous capture</li>
        </ul>
        {isRecording && (
          <p className="text-green-400 mt-2">
            ⏺ Recording notes as you sing!
          </p>
        )}
      </div>
    </div>
  );
}
