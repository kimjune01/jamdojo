export const SOUNDS = [
  { value: 'piano', label: 'Piano' },
  { value: 'kalimba', label: 'Kalimba' },
  { value: 'sawtooth', label: 'Sawtooth' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'sine', label: 'Sine' },
  { value: 'gm_acoustic_grand_piano', label: 'GM Piano' },
  { value: 'gm_electric_piano_1', label: 'Electric Piano' },
  { value: 'gm_drawbar_organ', label: 'Organ' },
  { value: 'gm_acoustic_guitar_nylon', label: 'Guitar' },
  { value: 'gm_lead_1_square', label: 'Lead Square' },
  { value: 'gm_pad_2_warm', label: 'Warm Pad' },
];

export function SoundSelector({ sound, setSound, loading }) {
  return (
    <div className="flex items-center gap-4">
      <label className="font-mono text-sm">Sound:</label>
      <select
        value={sound}
        onChange={(e) => setSound(e.target.value)}
        className="px-3 py-2 rounded border border-lineHighlight bg-background text-foreground font-mono"
      >
        {SOUNDS.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      {loading && <span className="text-sm text-gray-400">Loading samples...</span>}
    </div>
  );
}

export function CodeDisplay({ sound, lastNote }) {
  if (!lastNote) return null;

  return (
    <div className="border border-lineHighlight rounded-lg p-3 bg-background font-mono text-sm">
      <code className="text-foreground">
        sound("<span className="text-cyan-400">{sound}</span>").note("<span className="text-yellow-400">{lastNote}</span>")
      </code>
    </div>
  );
}
