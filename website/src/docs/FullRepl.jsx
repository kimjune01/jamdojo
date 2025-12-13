/*
FullRepl.jsx - Full-sized REPL for interactive tools section
Copyright (C) 2022 Strudel contributors
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

import { useCallback, useEffect, useRef, useState } from 'react';
import { code2hash, logger, silence } from '@strudel/core';
import { getDrawContext } from '@strudel/draw';
import { transpiler } from '@strudel/transpiler';
import {
  getAudioContext,
  getAudioContextCurrentTime,
  webaudioOutput,
  resetGlobalEffects,
  resetLoadedSounds,
  initAudioOnFirstClick,
  resetDefaults,
} from '@strudel/webaudio';
import { StrudelMirror, defaultSettings } from '@strudel/codemirror';
import { clearHydra } from '@strudel/hydra';
import { setInterval, clearInterval } from 'worker-timers';
import { prebake } from '@src/repl/prebake.mjs';
import { loadModules } from '@src/repl/util.mjs';
import { parseBoolean, settingsMap, useSettings } from '@src/settings.mjs';
import { useStore } from '@nanostores/react';
import useClient from '@src/useClient.mjs';
import PlayCircleIcon from '@heroicons/react/20/solid/PlayCircleIcon';
import StopCircleIcon from '@heroicons/react/20/solid/StopCircleIcon';
import cx from '@src/cx.mjs';
import '@src/repl/Repl.css';
import {
  hipHopShowcase,
  edmShowcase,
  metalShowcase,
  classicalShowcase,
  demosceneShowcase,
  rockPopShowcase,
} from '@src/repl/genreShowcase.mjs';

const { maxPolyphony, audioDeviceName, multiChannelOrbits } = settingsMap.get();
let modulesLoading, presets, drawContext, clearCanvas, audioReady;

if (typeof window !== 'undefined') {
  audioReady = initAudioOnFirstClick({
    maxPolyphony,
    audioDeviceName,
    multiChannelOrbits: parseBoolean(multiChannelOrbits),
  });
  modulesLoading = loadModules();
  presets = prebake();
  drawContext = getDrawContext();
  clearCanvas = () => drawContext.clearRect(0, 0, drawContext.canvas.height, drawContext.canvas.width);
}

const defaultCode = `// Welcome to the Strudel Playground!
// Press play or hit Ctrl+Enter to start

$: s("bd sd:2 [~ bd] sd")
  .bank("RolandTR909")
  .speed(1)

$: note("<c3 eb3 g3 bb3>*2")
  .sound("sawtooth")
  .lpf(800)
  .lpq(8)
  .gain(0.4)
`;

// Genre showcase buttons configuration
const genreShowcases = [
  { id: 'hip-hop', label: 'Hip-Hop', code: hipHopShowcase },
  { id: 'edm', label: 'EDM', code: edmShowcase },
  { id: 'metal', label: 'Metal', code: metalShowcase },
  { id: 'classical', label: 'Classical', code: classicalShowcase },
  { id: 'demoscene', label: 'Demoscene', code: demosceneShowcase },
  { id: 'rock-pop', label: 'Rock/Pop', code: rockPopShowcase },
];

export function FullRepl({ initialCode = defaultCode }) {
  const client = useClient();
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [replState, setReplState] = useState({});
  const { started, isDirty, error, pending } = replState;
  const { isSyncEnabled, fontFamily } = useSettings();

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const init = useCallback(() => {
    if (editorRef.current) return;

    const drawTime = [-2, 2];
    const ctx = getDrawContext();
    const editor = new StrudelMirror({
      sync: isSyncEnabled,
      defaultOutput: webaudioOutput,
      getTime: getAudioContextCurrentTime,
      setInterval,
      clearInterval,
      transpiler,
      autodraw: false,
      root: containerRef.current,
      initialCode,
      pattern: silence,
      drawTime,
      drawContext: ctx,
      prebake: async () => Promise.all([modulesLoading, presets]),
      onUpdateState: (state) => {
        setReplState({ ...state });
      },
      onToggle: (playing) => {
        if (!playing) {
          clearHydra();
        }
      },
      beforeEval: () => audioReady,
      afterEval: ({ code }) => {
        window.location.hash = '#' + code2hash(code);
      },
      bgFill: false,
    });

    editorRef.current = editor;
    window.strudelMirror = editor;

    // Check for code in URL hash
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const decoded = atob(hash);
        editor.setCode(decoded);
        logger('Code loaded from URL', 'highlight');
      } catch (e) {
        // Invalid hash, use initial code
        editor.setCode(initialCode);
      }
    } else {
      editor.setCode(initialCode);
    }

    logger('Welcome to Strudel Playground! Press play or hit Ctrl+Enter to run your code.', 'highlight');
  }, [initialCode, isSyncEnabled]);

  // Sync settings with editor
  const _settings = useStore(settingsMap, { keys: Object.keys(defaultSettings) });
  useEffect(() => {
    if (!editorRef.current) return;
    let editorSettings = {};
    Object.keys(defaultSettings).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(_settings, key)) {
        editorSettings[key] = _settings[key];
      }
    });
    editorRef.current.updateSettings(editorSettings);
  }, [_settings]);

  const handleTogglePlay = () => {
    editorRef.current?.toggle();
  };

  const handleEvaluate = () => {
    editorRef.current?.evaluate();
  };

  const handleShare = async () => {
    const code = editorRef.current?.getCode();
    if (code) {
      const hash = code2hash(code);
      const url = `${window.location.origin}${window.location.pathname}#${hash}`;
      await navigator.clipboard.writeText(url);
      logger('Link copied to clipboard!', 'highlight');
    }
  };

  const handleReset = async () => {
    resetDefaults();
    resetGlobalEffects();
    clearCanvas?.();
    clearHydra();
    resetLoadedSounds();
    editorRef.current?.repl?.setCps(0.5);
    await prebake();
    editorRef.current?.setCode(initialCode);
    logger('Editor reset to default', 'highlight');
  };

  const handleLoadGenre = (genre) => {
    if (editorRef.current) {
      // Stop playback if currently playing
      if (started) {
        editorRef.current.stop();
      }
      editorRef.current.setCode(genre.code);
      logger(`Loaded ${genre.label} showcase - Press play to start!`, 'highlight');
    }
  };

  const handleRender = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        // Stop playback
        if (started) {
          editorRef.current?.stop();
        }
      }
      return;
    }

    // Start recording
    try {
      const ac = getAudioContext();
      const { getDestinationGain } = await import('@strudel/webaudio');

      // Get the master output gain node
      const masterGain = getDestinationGain();
      if (!masterGain) {
        // Audio hasn't been initialized yet, start playback first
        await editorRef.current?.evaluate();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const dest = ac.createMediaStreamDestination();

      // Get the master gain again after initialization
      const finalMasterGain = getDestinationGain();
      if (!finalMasterGain) {
        throw new Error('Audio not initialized. Please play something first.');
      }

      // Connect master output to recording destination (in addition to speakers)
      finalMasterGain.connect(dest);

      // Use MediaRecorder with the stream
      const stream = dest.stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      // Store destination for cleanup
      mediaRecorderRef.current._dest = dest;
      mediaRecorderRef.current._masterGain = finalMasterGain;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Disconnect recording destination
        try {
          mediaRecorderRef.current._masterGain?.disconnect(mediaRecorderRef.current._dest);
        } catch (e) {
          // Already disconnected
        }

        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const extension = mimeType.includes('webm') ? 'webm' : 'ogg';
        const a = document.createElement('a');
        a.href = url;
        a.download = `strudel-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
        logger('Recording saved!', 'highlight');
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      logger('Recording started... Click Render again to stop and download.', 'highlight');

      // If not already playing, start playback
      if (!started) {
        editorRef.current?.toggle();
      }
    } catch (err) {
      logger(`Recording error: ${err.message}`, 'error');
      console.error('Recording error:', err);
      setIsRecording(false);
    }
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-background border border-lineHighlight rounded-lg">
        <div className="text-gray-400">Loading Strudel...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px] border border-lineHighlight rounded-lg overflow-hidden bg-background" style={{ fontFamily }}>
      {/* Header */}
      <header className="flex-none flex flex-col bg-lineHighlight border-b border-gray-700">
        {/* Top row: Controls */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3">
            <span className={cx('text-foreground text-xl', started && 'animate-spin')}>꩜</span>
            <span className="text-foreground font-bold">Strudel Playground</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleTogglePlay}
              className={cx(
                'flex items-center space-x-1 px-3 py-1.5 rounded text-foreground hover:bg-gray-700 transition-colors',
                !started && 'animate-pulse'
              )}
              title={started ? 'Stop (Ctrl+.)' : 'Play (Ctrl+Enter)'}
            >
              {started ? (
                <StopCircleIcon className="w-5 h-5 text-red-400" />
              ) : (
                <PlayCircleIcon className="w-5 h-5 text-green-400" />
              )}
              <span className="text-sm">{started ? 'Stop' : 'Play'}</span>
            </button>
            <button
              onClick={handleEvaluate}
              className={cx(
                'px-3 py-1.5 rounded text-sm text-foreground hover:bg-gray-700 transition-colors',
                !isDirty && 'opacity-50'
              )}
              title="Update (Ctrl+Enter)"
            >
              Update
            </button>
            <button
              onClick={handleRender}
              className={cx(
                'px-3 py-1.5 rounded text-sm text-foreground hover:bg-gray-700 transition-colors',
                isRecording && 'bg-red-600 hover:bg-red-700'
              )}
              title={isRecording ? 'Stop recording and download' : 'Record audio to file'}
            >
              {isRecording ? 'Stop Rec' : 'Render'}
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded text-sm text-foreground hover:bg-gray-700 transition-colors"
              title="Copy shareable link"
            >
              Share
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded text-sm text-foreground hover:bg-gray-700 transition-colors"
              title="Reset to default"
            >
              Reset
            </button>
          </div>
        </div>
        {/* Genre showcase buttons row */}
        <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-700/50 overflow-x-auto">
          <span className="text-xs text-gray-400 whitespace-nowrap">Genre Showcases:</span>
          {genreShowcases.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleLoadGenre(genre)}
              className="px-2.5 py-1 rounded text-xs text-foreground bg-gray-700/50 hover:bg-gray-600 transition-colors whitespace-nowrap"
              title={`Load ${genre.label} showcase (~1 min production track)`}
            >
              {genre.label}
            </button>
          ))}
        </div>
      </header>

      {/* Editor */}
      <section
        className="flex-1 overflow-auto text-gray-100 cursor-text"
        id="code"
        ref={(el) => {
          containerRef.current = el;
          if (!editorRef.current && el) {
            init();
          }
        }}
      />

      {/* Error display */}
      {error && (
        <div className="flex-none px-4 py-2 bg-red-900/50 border-t border-red-700 text-red-200 text-sm">
          {error.message || String(error)}
        </div>
      )}

      {/* Pending indicator */}
      {pending && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      )}

      {/* Big play button overlay when not started */}
      {!started && !pending && (
        <button
          onClick={handleTogglePlay}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center space-x-2 px-6 py-3 bg-black/90 rounded-lg text-white text-xl hover:bg-black transition-colors"
        >
          <PlayCircleIcon className="w-8 h-8" />
          <span>Play</span>
        </button>
      )}

      {/* Footer with keyboard shortcuts */}
      <footer className="flex-none px-4 py-2 bg-lineHighlight border-t border-gray-700 text-xs text-gray-400">
        <span className="font-mono">Ctrl+Enter: Evaluate | Ctrl+.: Stop | Ctrl+Shift+H: Hush</span>
      </footer>
    </div>
  );
}
