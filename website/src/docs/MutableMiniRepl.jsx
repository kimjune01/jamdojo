import { useState, useMemo } from 'react';
import { MiniRepl } from './MiniRepl';
import { Icon } from './Icon';
import { getAudioContext, setOrbitGain } from '@strudel/webaudio';

let orbitCounter = 100;

export function MutableMiniRepl({ tune, tunes, orbit: propOrbit, ...props }) {
  const orbit = useMemo(() => propOrbit ?? orbitCounter++, [propOrbit]);
  const [isMuted, setIsMuted] = useState(false);

  const tuneWithOrbit = useMemo(() => {
    return tune ? `${tune}.orbit(${orbit})` : tune;
  }, [tune, orbit]);

  const tunesWithOrbit = useMemo(() => {
    return tunes?.map((t) => `${t}.orbit(${orbit})`);
  }, [tunes, orbit]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setOrbitGain(orbit, newMuted ? 0 : 1);
    setIsMuted(newMuted);
  };

  return (
    <div className="flex gap-2 items-start my-4">
      <div className="flex-1">
        <MiniRepl tune={tuneWithOrbit} tunes={tunesWithOrbit} {...props} />
      </div>
      <button
        onClick={toggleMute}
        className={`flex items-center justify-center p-3 rounded-md border border-lineHighlight transition-colors ${
          isMuted ? 'bg-red-900/50 text-red-300 hover:bg-red-800/50' : 'bg-lineHighlight text-foreground hover:bg-background'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
        aria-label={isMuted ? 'unmute' : 'mute'}
      >
        <Icon type={isMuted ? 'volume-x' : 'volume-2'} />
      </button>
    </div>
  );
}

export function GlobalMuteButton() {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = async () => {
    try {
      const ac = getAudioContext();
      if (ac.state === 'running') {
        await ac.suspend();
        setIsMuted(true);
      } else {
        await ac.resume();
        setIsMuted(false);
      }
    } catch (e) {
      console.error('Failed to toggle audio:', e);
    }
  };

  return (
    <button
      onClick={toggleMute}
      className={`flex items-center gap-2 px-4 py-2 rounded-md border border-lineHighlight transition-colors ${
        isMuted ? 'bg-red-900/50 text-red-300 hover:bg-red-800/50' : 'bg-lineHighlight text-foreground hover:bg-background'
      }`}
      title={isMuted ? 'Resume all audio' : 'Pause all audio'}
    >
      <Icon type={isMuted ? 'volume-x' : 'volume-2'} />
      <span>{isMuted ? 'Resume All' : 'Pause All'}</span>
    </button>
  );
}
