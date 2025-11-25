import { useEffect, useRef } from 'react';
import { useStrudelSound } from './useStrudelSound';
import { SoundSelector, CodeDisplay } from './SoundSelector';
import Claviature from '@components/Claviature';
import useClient from '@src/useClient.mjs';

// Computer keyboard to note name mapping
const keyMap = {
  'a': 'C3',
  'w': 'Db3',
  's': 'D3',
  'e': 'Eb3',
  'd': 'E3',
  'f': 'F3',
  't': 'Gb3',
  'g': 'G3',
  'y': 'Ab3',
  'h': 'A3',
  'u': 'Bb3',
  'j': 'B3',
  'k': 'C4',
  'o': 'Db4',
  'l': 'D4',
  'p': 'Eb4',
  ';': 'E4',
  "'": 'F4',
};

const PIANO_NOTES = ['C3', 'Db3', 'D3', 'Eb3', 'E3', 'F3', 'Gb3', 'G3', 'Ab3', 'A3', 'Bb3', 'B3', 'C4', 'Db4', 'D4', 'Eb4', 'E4', 'F4'];

export function Piano({ defaultSound = 'piano' }) {
  const {
    sound,
    setSound,
    activeNotes,
    lastNote,
    loading,
    noteOn,
    noteOff,
  } = useStrudelSound({ defaultSound, notes: PIANO_NOTES });

  const heldKeys = useRef(new Set());

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (keyMap[key] && !heldKeys.current.has(key)) {
        heldKeys.current.add(key);
        noteOn(keyMap[key]);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        heldKeys.current.delete(key);
        noteOff(keyMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [noteOn, noteOff]);

  const client = useClient();
  if (!client) {
    return <div>Loading piano...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <SoundSelector sound={sound} setSound={setSound} loading={loading} />

      <div
        className="border border-lineHighlight rounded-lg p-2 bg-background"
        tabIndex={0}
      >
        <Claviature
          options={{
            range: ['C3', 'F4'],
            scaleX: 1.5,
            scaleY: 1,
            colorize: [{ keys: activeNotes, color: 'steelblue' }],
            labels: Object.fromEntries(
              Object.entries(keyMap).map(([key, note]) => [note, key.toUpperCase()])
            ),
          }}
          onMouseDown={(note) => noteOn(note)}
          onMouseUp={(note) => noteOff(note)}
          onMouseLeave={(note) => noteOff(note)}
        />
      </div>

      <CodeDisplay sound={sound} lastNote={lastNote} />

      <p className="text-sm text-gray-400 font-mono">
        Play with keyboard: A-S-D-F-G-H-J-K-L (white keys) | W-E-T-Y-U-O-P (black keys)
      </p>
    </div>
  );
}
