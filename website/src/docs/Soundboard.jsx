import { useState, useRef, useCallback } from 'react';
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

export function Soundboard({ sound = 'bd', label }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const initialized = useRef(false);

  const playSound = useCallback(async () => {
    if (!initialized.current) {
      await Promise.all([modulesLoading, prebaked, audioReady]);
      initialized.current = true;
    }

    setIsPlaying(true);

    try {
      const ac = getAudioContext();
      const t = ac.currentTime + 0.01;
      await superdough({ s: sound }, t, 1);
    } catch (e) {
      console.error('Soundboard error:', e);
    }

    setTimeout(() => setIsPlaying(false), 150);
  }, [sound]);

  const client = useClient();
  if (!client) {
    return <button disabled>{label || sound}</button>;
  }

  return (
    <button
      onClick={playSound}
      className={`
        px-6 py-4
        rounded-lg
        font-mono text-lg
        border-2 border-lineHighlight
        bg-background
        hover:bg-lineHighlight
        active:scale-95
        transition-all duration-100
        cursor-pointer
        ${isPlaying ? 'bg-lineHighlight scale-95' : ''}
      `}
    >
      {label || sound}
    </button>
  );
}

export function SoundboardGrid({ sounds }) {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-background rounded-lg border border-lineHighlight">
      {sounds.map((item, i) => {
        const sound = typeof item === 'string' ? item : item.sound;
        const label = typeof item === 'string' ? item : item.label;
        return <Soundboard key={i} sound={sound} label={label} />;
      })}
    </div>
  );
}
