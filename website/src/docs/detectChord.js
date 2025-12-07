/**
 * Detect chord name from a collection of notes
 * @param {string[]} notes - Array of note names (e.g., ['C4', 'E4', 'G4'])
 * @returns {string|null} Chord name or null if not recognized
 */
export function detectChord(notes) {
  if (!notes || notes.length < 2) {
    return null;
  }

  // Extract note names without octaves and convert to semitones
  const noteNames = notes.map(n => n.replace(/\d+$/, ''));
  const uniqueNotes = [...new Set(noteNames)].sort();

  // Get root note (lowest note)
  const root = noteNames[0];

  // Calculate intervals from root
  const intervals = uniqueNotes.map(note => noteToSemitone(note) - noteToSemitone(root))
    .map(i => ((i % 12) + 12) % 12) // Normalize to 0-11
    .sort((a, b) => a - b);

  // Chord patterns (intervals from root)
  const chordPatterns = {
    // Triads
    'major': [0, 4, 7],
    'minor': [0, 3, 7],
    'dim': [0, 3, 6],
    'aug': [0, 4, 8],
    'sus2': [0, 2, 7],
    'sus4': [0, 5, 7],

    // Seventh chords
    'maj7': [0, 4, 7, 11],
    'min7': [0, 3, 7, 10],
    '7': [0, 4, 7, 10],
    'dim7': [0, 3, 6, 9],
    'min7b5': [0, 3, 6, 10],

    // Extended chords
    'maj9': [0, 4, 7, 11, 14],
    'min9': [0, 3, 7, 10, 14],
    '9': [0, 4, 7, 10, 14],

    // Power chord
    '5': [0, 7],
  };

  // Find matching chord pattern
  for (const [chordType, pattern] of Object.entries(chordPatterns)) {
    if (arraysEqual(intervals, pattern)) {
      return formatChordName(root, chordType);
    }
  }

  // If no match, just return the notes
  return null;
}

/**
 * Convert note name to semitone number (C=0, C#=1, etc.)
 */
function noteToSemitone(note) {
  const noteMap = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };
  return noteMap[note] || 0;
}

/**
 * Format chord name
 */
function formatChordName(root, type) {
  // Simplify flat/sharp notation
  const rootSimplified = root.replace('b', '♭').replace('#', '♯');

  const typeMap = {
    'major': '',
    'minor': 'm',
    'dim': 'dim',
    'aug': 'aug',
    'sus2': 'sus2',
    'sus4': 'sus4',
    'maj7': 'maj7',
    'min7': 'm7',
    '7': '7',
    'dim7': 'dim7',
    'min7b5': 'm7♭5',
    'maj9': 'maj9',
    'min9': 'm9',
    '9': '9',
    '5': '5',
  };

  return rootSimplified + (typeMap[type] || type);
}

/**
 * Check if two arrays are equal
 */
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
