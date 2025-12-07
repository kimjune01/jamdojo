import { useState, useRef, useCallback, useEffect } from 'react';
import { PitchDetector } from 'pitchy';
import { freqToMidi, midi2note } from '@strudel/core';
import { getAudioContext, initAudioOnFirstClick } from '@strudel/webaudio';

/**
 * Custom hook for real-time pitch detection from microphone input
 * @returns {Object} Pitch detection state and controls
 */
export function usePitchDetection() {
  // State
  const [isListening, setIsListening] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [frequency, setFrequency] = useState(null);
  const [clarity, setClarity] = useState(0);
  const [error, setError] = useState(null);

  // Refs for cleanup
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sourceRef = useRef(null);

  /**
   * Pitch detection loop - runs continuously while listening
   */
  const detectPitch = useCallback(() => {
    if (!analyserRef.current || !detectorRef.current || !audioContextRef.current) {
      return;
    }

    const analyser = analyserRef.current;
    const detector = detectorRef.current;
    const sampleRate = audioContextRef.current.sampleRate;

    // Get time-domain audio data
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    // Detect pitch using Pitchy
    const [freq, clarityValue] = detector.findPitch(buffer, sampleRate);

    // Only update if we have a clear pitch detection
    // Frequency range: 80Hz (roughly D#2) to 1000Hz (roughly B5)
    if (clarityValue > 0.9 && freq > 80 && freq < 1000) {
      // Convert frequency to MIDI note number and then to note name
      const midiNum = freqToMidi(freq);
      const note = midi2note(Math.round(midiNum));

      setFrequency(freq);
      setClarity(clarityValue);
      setCurrentNote(note);
    } else {
      // Low confidence - keep last detected note but update clarity
      setClarity(clarityValue);
    }

    // Continue the detection loop
    animationFrameRef.current = requestAnimationFrame(detectPitch);
  }, []);

  /**
   * Start microphone listening and pitch detection
   */
  const startListening = useCallback(async () => {
    try {
      setError(null);

      // Check for browser support
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Your browser does not support microphone access. Please use Chrome, Firefox, or Edge.');
        return;
      }

      // Initialize Strudel audio first
      await initAudioOnFirstClick();

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;

      // Get or create audio context (reuse Strudel's)
      const audioContext = getAudioContext();
      audioContextRef.current = audioContext;

      // Create audio nodes
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      // Configure analyser
      analyser.fftSize = 2048; // Good balance between accuracy and latency
      analyser.smoothingTimeConstant = 0.8; // Smooth out jitter

      // Connect nodes (don't connect to destination - we don't want to hear raw mic input)
      source.connect(analyser);

      // Store refs
      sourceRef.current = source;
      analyserRef.current = analyser;

      // Create Pitchy detector
      detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize);

      // Start detection loop
      setIsListening(true);
      detectPitch();
    } catch (err) {
      console.error('Microphone access error:', err);

      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(`Error accessing microphone: ${err.message}`);
      }
    }
  }, [detectPitch]);

  /**
   * Stop microphone listening and cleanup
   */
  const stopListening = useCallback(() => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop all media stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Disconnect audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Clear refs
    analyserRef.current = null;
    detectorRef.current = null;
    audioContextRef.current = null;

    // Reset state
    setIsListening(false);
    setCurrentNote(null);
    setFrequency(null);
    setClarity(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening]);

  return {
    isListening,
    startListening,
    stopListening,
    currentNote,
    frequency,
    clarity,
    error,
  };
}
