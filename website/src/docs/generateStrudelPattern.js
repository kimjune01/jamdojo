/**
 * Generate Strudel pattern code from an array of note names
 * @param {string[]} notes - Array of note names (e.g., ['C4', 'E4', 'G4'])
 * @param {string} sound - Sound/instrument name (default: 'piano')
 * @returns {string} Strudel pattern code
 *
 * @example
 * generateStrudelPattern(['C4', 'E4', 'G4'], 'piano')
 * // Returns: sound("piano").note("[C4 E4 G4]")
 */
export function generateStrudelPattern(notes, sound = 'piano') {
  if (!notes || notes.length === 0) {
    return `sound("${sound}").note("C4")`;
  }

  // Join notes with spaces for Strudel's sequence notation
  const noteSequence = notes.join(' ');

  // Wrap in square brackets for parallel pattern
  return `sound("${sound}").note("[${noteSequence}]")`;
}
