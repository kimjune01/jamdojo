/*
genreShowcase.mjs - Production-grade genre showcase tracks for the Playground
Copyright (C) 2024 Strudel contributors
This program is free software: you can redistribute it and/or modify it under the terms of the
GNU Affero General Public License as published by the Free Software Foundation, either version 3
of the License, or (at your option) any later version.
*/

// ============================================================================
// HIP-HOP SHOWCASE - Sample-Based Boom Bap (~88 BPM)
// Duration: ~70 seconds | Structure: Intro → Verse → Hook → Verse → Hook → Outro
// Sampling Techniques: Chopping, Slicing, Pitched samples, Filter sweeps
// ============================================================================
export const hipHopShowcase = `// Hip-Hop Showcase: "Dusty Crates"
// Sample-based boom bap in the style of J Dilla, Madlib, and DJ Premier
// Duration: ~70 seconds | 88 BPM
//
// === SAMPLING TECHNIQUES USED ===
// - Breakbeat chopping with slice() and chop()
// - Granular textures with striate()
// - Pitched samples for "chipmunk soul" (Kanye style)
// - Filter sweeps for texture variation
// - Lo-fi processing with hpf/lpf for dusty sound
// - Layered drums: breaks + drum machine
// - Speed variations including reverse
//
// === MODIFY THESE ===
// - Break pattern: edit slice() indices (0-7)
// - Chop intensity: change chop() value (4, 8, 16, 32)
// - Swing feel: adjust .swing() value (0-0.25)
// - Filter sweep: modify lpf(sine.range()) values
// - Dustiness: adjust hpf() for more/less high-pass

// Load dirt-samples (includes breaks, speechless, jazz, etc.)
await samples('github:tidalcycles/dirt-samples')

// --- SOUND PALETTE (with spatial positioning) ---
// Rhodes: wide stereo, mid-depth, filtered for warmth
const rhodesChord = x => x.s("sawtooth")
  .lpf(1600).hpf(200)
  .attack(0.02).decay(0.4).sustain(0.3)
  .juxBy(0.5, rev)
  .room(0.35).roomsize(4)
  .gain(0.3)

// 808 Bass: centered, dry, sub frequencies
const bass808 = x => x.s("sine")
  .lpf(180)
  .decay(0.35).sustain(0.25).slide(0.08)
  .pan(0.5).room(0)
  .gain(0.7)

// Dusty break processing: lo-fi filtered, room ambience
const dustyBreak = x => x
  .lpf(3500).hpf(300)   // lo-fi vinyl EQ
  .room(0.15).roomsize(3)
  .pan(0.52)

// Clean drums: centered kick/snare
const punchyKick = x => x.bank("RolandTR808").pan(0.5).room(0)
const crispSnare = x => x.bank("RolandTR808").pan(0.48).room(0.12).gain(0.65)
const dustyHat = x => x.bank("RolandTR808")
  .hpf(7000)
  .pan(sine.range(0.35, 0.65).slow(2))
  .room(0.08)
  .gain(0.4)

// --- CHOPPED BREAK PATTERNS (using built-in breaks165 funk break) ---
// Main break: J Dilla style rearrangement (kick-snare emphasis)
const mainBreakPattern = s("breaks165")
  .loopAt(2)
  .slice(8, "0 0 [3 2] 1 4 6 [5 5] 7")  // classic boom bap chop
  .apply(dustyBreak)
  .gain(0.6)
  .color("orange")._punchcard()

// Hook break: more active, Pete Rock style with different break
const hookBreakPattern = s("breaks165")
  .loopAt(2)
  .slice(8, "<0 0*2 3 2> [4 4] 6 <5 [5 7]> 7")
  .apply(dustyBreak)
  .sometimes(x => x.speed(-1))  // occasional reverse hits
  .gain(0.62)
  .color("coral")._punchcard()

// Intro break: filtered sweep building up
const introBreakPattern = s("breaks165")
  .loopAt(2)
  .slice(8, "0 1 2 3 4 5 6 7")  // play all slices in order
  .lpf(sine.range(800, 4000).slow(8))  // filter sweep opens up over intro
  .hpf(150)
  .room(0.2)
  .gain(0.65)
  .color("gold")._punchcard()

// Glitchy variation: Madlib-style stutters with breaks125
const glitchBreak = s("breaks125")
  .loopAt(2)
  .slice(16, "0 1 [2 2 2] 3 4 5 [6 7] [7 7]")
  .sometimesBy(0.3, x => x.ply(2))  // random repeats
  .sometimesBy(0.2, x => x.speed(0.75))
  .apply(dustyBreak)
  .gain(0.55)
  .color("tomato")._punchcard()

// --- TEXTURE LAYER (granular pad from break sample) ---
// DJ Shadow/Burial style: granular break as atmosphere
const granularTexture = s("breaks152")
  .loopAt(4)
  .striate(32)           // granular playback
  .lpf(1200).hpf(400)
  .speed(0.5)            // pitched down for texture
  .juxBy(0.4, rev)
  .room(0.5).roomsize(6)
  .pan(0.45)
  .gain(0.18)
  .color("slategray")._scope()

// --- LAYERED DRUM MACHINE (sits under the break) ---
const boomBapDrums = stack(
  sound("bd ~ ~ bd ~ ~ bd ~").apply(punchyKick).color("red"),
  sound("~ ~ ~ ~ sd ~ ~ ~").apply(crispSnare).color("pink"),
  sound("hh hh hh hh hh hh [hh hh] hh").apply(dustyHat).color("yellow")
)._punchcard()

const hookDrums = stack(
  sound("bd ~ bd ~ ~ bd ~ bd").apply(punchyKick).color("red"),
  sound("~ ~ ~ ~ [sd,cp] ~ ~ ~").apply(crispSnare).color("pink"),
  sound("hh hh oh hh hh hh hh oh").apply(dustyHat).color("yellow")
)._punchcard()

// --- PITCHED SAMPLE MELODY (Kanye "chipmunk soul" technique) ---
// Pitching percussion samples to create melodic elements
const pitchedSample = note("<c4 eb4 g4 c5> <eb4 g4 bb4 eb5>")
  .s("jazz")           // using jazz kit for pitched melody
  .clip(1)
  .speed(2)            // pitch up for chipmunk effect
  .lpf(2800).hpf(500)
  .pan(0.35)
  .room(0.4).roomsize(5)
  .delay(0.18).delaytime(0.375).delayfeedback(0.3)
  .gain(0.2)
  .color("violet")._scope()

// --- VOCAL CHOP (chopped vocal texture) ---
const vocalChop = s("speechless")
  .loopAt(4)
  .slice(8, "~ 2 ~ ~ 5 ~ ~ 7")
  .speed("<1 1.2 0.8>")
  .lpf(2500).hpf(300)
  .pan(0.65)
  .room(0.45).roomsize(5)
  .gain(0.22)
  .color("hotpink")._punchcard()

// --- CHORD PROGRESSIONS (soul sample vibe) ---
// Verse: Cm7 → Fm7 → Bb7 → Eb^7 (ii-V-I with extensions)
const verseChords = chord("<Cm7 Fm7 Bb7 Eb^7>").voicing().struct("x ~ x ~")
// Hook: Ab^7 → Gm7 → Cm7 → Bb7 (more movement)
const hookChords = chord("<Ab^7 Gm7 Cm7 Bb7>").voicing().struct("x ~ [~ x] ~")

// --- BASS LINES (808 sub with slides) ---
const verseBass = note("<c2 f2 bb1 eb2>").struct("x ~ ~ x ~ x ~ ~")
const hookBass = note("<ab1 g1 c2 bb1>").struct("x ~ x ~ ~ x x ~")

// --- MELODIC ELEMENTS ---
// Main melody: right side, delay throws
const verseMelody = note("~ ~ eb4 ~ c4 ~ ~ ~, ~ ~ ~ ~ ~ g4 ~ ~")
  .s("sawtooth")
  .lpf(2200).hpf(400)
  .decay(0.2).sustain(0.1)
  .pan(0.62)
  .room(0.4).roomsize(5)
  .delay(0.2).delaytime(0.375).delayfeedback(0.28)
  .gain(0.26)
  .color("cyan")._scope()

// Hook melody: opposite side for width
const hookMelody = note("ab4 ~ g4 ~ ~ eb4 ~ c4, ~ ~ ~ ~ f4 ~ ~ ~")
  .s("sawtooth")
  .lpf(2400).hpf(450)
  .decay(0.25).sustain(0.15)
  .pan(0.38)
  .room(0.45).roomsize(6)
  .delay(0.22).delaytime(0.375).delayfeedback(0.35)
  .gain(0.28)
  .color("aqua")._scope()

// --- SECTIONS ---
// Intro: filtered break building up with granular texture
const intro = stack(
  introBreakPattern,
  granularTexture,
  sound("~ ~ ~ ~ ~ ~ bd ~").apply(punchyKick)
).slow(2)

// Verse 1: chopped break + drum machine layered
const verse1 = stack(
  mainBreakPattern,
  boomBapDrums.gain(0.55),  // drum machine underneath
  verseChords.apply(rhodesChord),
  verseBass.apply(bass808),
  verseMelody,
  granularTexture.gain(0.12)
)

// Hook: more active break + pitched samples + vocal chop
const hook = stack(
  hookBreakPattern,
  hookDrums.gain(0.5),
  hookChords.apply(rhodesChord),
  hookBass.apply(bass808),
  hookMelody,
  pitchedSample,
  vocalChop
)

// Verse 2: glitchy variation (different break) for development
const verse2 = stack(
  glitchBreak,
  boomBapDrums.gain(0.5),
  verseChords.apply(rhodesChord),
  verseBass.apply(bass808).sometimes(x => x.add(note(12))),
  verseMelody.degradeBy(0.3),
  granularTexture.gain(0.15)
)

// Outro: break slowing down, filter closing, granular wash
const outro = stack(
  s("breaks165")
    .loopAt(2)
    .slice(8, "0 ~ 3 ~ 4 ~ ~ 7")
    .lpf(sine.range(2000, 400).slow(4))  // filter closing
    .hpf(200)
    .room(0.3)
    .gain(0.5),
  granularTexture.lpf(800).gain(0.25),
  verseChords.apply(rhodesChord).lpf(800).room(0.5),
  note("c2 ~ ~ ~").apply(bass808)
).slow(2)

// --- ARRANGEMENT ---
slowcat(
  intro,           // 8 bars - filtered break building
  verse1,          // 4 bars - main groove
  verse1,          // 4 bars - repeat
  hook,            // 4 bars - hook with pitched samples
  verse2,          // 4 bars - glitchy variation (breaks125)
  verse2,          // 4 bars - repeat
  hook,            // 4 bars - hook return
  outro            // 8 bars - filter closing
).cpm(22).swing(0.08)
`;

// ============================================================================
// EDM SHOWCASE - House / Techno Hybrid (128 BPM)
// Duration: ~75 seconds | Structure: Build → Drop → Breakdown → Build → Drop
// ============================================================================
export const edmShowcase = `// EDM Showcase: "Neon Pulse"
// A house/techno hybrid with acid bass and supersaw drops
// Duration: ~75 seconds | 128 BPM
//
// === MODIFY THESE ===
// - Filter sweep speed: change .fast() in lpf modulation
// - Acid resonance: adjust .lpq() values (8-20)
// - Stereo width: adjust .juxBy() and .pan() values
// - Spatial depth: modify .room() and .delay() settings

// --- SOUND PALETTE (with spatial positioning) ---
// Acid bass: centered, dry, low-mid frequencies
const acidBass = x => x.s("sawtooth")
  .lpq(15).attack(0.001).decay(0.15).sustain(0.2)
  .hpf(40).lpf(800)
  .pan(0.5).room(0)

// Supersaw pad: wide stereo, deep reverb, mid frequencies
const superPad = x => x.s("supersaw")
  .hpf(280).lpf(3500)
  .attack(0.1).release(0.4)
  .juxBy(0.65, x => x.add(note(0.08)))
  .room(0.45).roomsize(6).roomlp(4000)
  .gain(0.38)

// Pluck lead: off-center, delay throws, high-mids
const pluckLead = x => x.s("sawtooth")
  .lpf(4000).hpf(600)
  .attack(0.001).decay(0.12).sustain(0)
  .pan(0.35)
  .room(0.25)
  .delay(0.3).delaytime(0.1875).delayfeedback(0.4)

// Drums: centered kick, spread percussion
const tr909 = x => x.bank("RolandTR909")

// --- DRUM PATTERNS (with spatial separation) ---
const fourFloor = stack(
  sound("bd").euclid(4, 4).apply(tr909).pan(0.5).room(0.05).color("red"),
  sound("hh").euclid(8, 8).apply(tr909).hpf(8000).pan(sine.range(0.4, 0.7).fast(2)).gain(0.45).color("yellow"),
  sound("oh").euclidRot(2, 8, 2).apply(tr909).hpf(6000).pan(0.35).room(0.15).gain(0.35).color("orange"),
  sound("cp").euclidRot(2, 4, 2).apply(tr909).pan(0.52).room(0.18).gain(0.6).color("pink")
)._punchcard()

const buildDrums = stack(
  sound("bd").euclid(4, 4).apply(tr909).pan(0.5).room(0).gain(0.7).color("red"),
  sound("hh").euclid(16, 16).apply(tr909).hpf(9000).pan(perlin.range(0.3, 0.7)).gain(0.38).color("yellow")
)._punchcard()

const breakdownDrums = stack(
  sound("bd").euclidRot(2, 8, 0).apply(tr909).pan(0.5).room(0.15).gain(0.55).color("red"),
  sound("hh").euclid(8, 8).apply(tr909).hpf(7000).pan(0.6).gain(0.28).color("yellow")
)._punchcard()

// --- BASS PATTERNS ---
const acidLine = note("c2 c2 c3 c2 eb2 c2 g2 c2")
  .apply(acidBass)
  .lpf(sine.range(300, 3500).fast(2))
  .gain(0.52)
  .color("lime")._scope()

const dropBass = note("c2*4 eb2*2 f2 g2")
  .apply(acidBass)
  .lpf(sine.range(400, 2800).fast(4))
  .lpq(12)
  .distort(1.5)
  .gain(0.58)
  .color("chartreuse")._scope()

// --- CHORD PROGRESSIONS ---
// Am → F → C → G (classic EDM progression)
const mainChords = chord("<Am F C G>").voicing()
const breakdownChords = chord("<Am F>").voicing()

// --- MELODIC ELEMENTS ---
const arpPattern = note("c4 eb4 g4 c5 g4 eb4 c4 eb4".fast(2))
  .apply(pluckLead)
  .gain(0.32)
  .color("cyan")._punchcard()

const buildArp = note("c4 eb4 g4 c5".fast(4))
  .apply(pluckLead)
  .lpf(sine.range(1000, 6000).slow(4))
  .gain(0.38)
  .color("deepskyblue")._punchcard()

const leadMelody = note("c5 ~ eb5 ~ g5 ~ eb5 c5")
  .s("supersaw")
  .lpf(4500).hpf(800)
  .attack(0.01).decay(0.2).sustain(0.3)
  .pan(0.6)
  .room(0.35).roomsize(5)
  .delay(0.25).delaytime(0.125).delayfeedback(0.3)
  .gain(0.33)
  .color("magenta")._scope()

// --- SIDECHAIN SIMULATION ---
const pump = gain(perlin.range(0.5, 1).fast(4))

// --- SECTIONS ---
const introBuild = stack(
  buildDrums,
  buildArp,
  note("c2").s("sawtooth").lpf(sine.range(200, 1500).slow(8)).lpq(8).pan(0.5).gain(0.38)
).mul(gain(sine.range(0.6, 1).slow(8)))

const drop1 = stack(
  fourFloor,
  dropBass,
  mainChords.apply(superPad).mul(pump),
  arpPattern
)

const breakdown = stack(
  breakdownDrums,
  breakdownChords.apply(superPad).lpf(1500).room(0.55).gain(0.45),
  acidLine.lpf(1200).gain(0.35),
  note("c3 eb3 g3 c4").slow(2).s("sawtooth").lpf(800).hpf(200)
    .attack(0.1).decay(0.3).pan(0.45).room(0.5).gain(0.28)
)

const buildUp = stack(
  buildDrums.fast(1),
  buildArp.fast(1),
  note("c2").s("sawtooth").lpf(sine.range(300, 4000).fast(2)).lpq(12).pan(0.5).gain(0.48)
).mul(gain(sine.range(0.7, 1).fast(4)))

const drop2 = stack(
  fourFloor,
  dropBass.distort(2),
  mainChords.apply(superPad).mul(pump),
  arpPattern,
  leadMelody
)

// --- ARRANGEMENT ---
slowcat(
  introBuild.slow(2),     // 8 bars build
  drop1,                   // 4 bars
  drop1,                   // 4 bars
  drop1,                   // 4 bars
  drop1,                   // 4 bars
  breakdown.slow(2),       // 8 bars breakdown
  buildUp.slow(2),         // 8 bars build
  drop2,                   // 4 bars
  drop2,                   // 4 bars
  drop2,                   // 4 bars
  drop2                    // 4 bars
).cpm(32)
`;

// ============================================================================
// METAL SHOWCASE - Thrash / Djent Hybrid (160 BPM)
// Duration: ~65 seconds | Structure: Intro → Verse → Pre-Chorus → Chorus → Breakdown
// ============================================================================
export const metalShowcase = `// Metal Showcase: "Iron Pulse"
// A thrash/djent hybrid with double bass and crushing riffs
// Duration: ~65 seconds | 160 BPM
//
// === MODIFY THESE ===
// - Distortion amount: adjust .distort() (2-5)
// - Double bass density: change euclid patterns
// - Stereo width: adjust .juxBy() on guitars
// - Room ambience: modify .room() values

// --- SOUND PALETTE (with spatial positioning) ---
// Rhythm guitar: wide stereo (double-tracked feel), tight room
const metalRhythm = x => x.s("sawtooth")
  .distort(4).lpf(1200).hpf(80)
  .attack(0.001).decay(0.08).sustain(0.3).release(0.05)
  .juxBy(0.7, x => x.detune(15))
  .room(0.08).roomsize(2)

// Lead guitar: off-center, more reverb, higher frequencies
const metalLead = x => x.s("sawtooth")
  .distort(2.5).lpf(4000).hpf(400)
  .attack(0.001).decay(0.15).sustain(0.4)
  .pan(0.35)
  .room(0.25).roomsize(4)
  .delay(0.15).delaytime(0.2).delayfeedback(0.2)

// Bass: centered, dry, sub frequencies
const metalBass = x => x.s("sawtooth")
  .lpf(350).hpf(35)
  .distort(2)
  .pan(0.5).room(0)
  .gain(0.62)

// --- POWER CHORD HELPER ---
// Stacks root + fifth for heavy power chords
const powerChord = (root) => stack(
  note(root),
  note(root).add(7)
).apply(metalRhythm)

// --- DRUM PATTERNS (with spatial separation) ---
const thrashDrums = stack(
  sound("bd").euclid(8, 8).pan(0.5).room(0.03).gain(0.88).color("red"),
  sound("sd").euclidRot(2, 8, 4).pan(0.48).room(0.1).gain(0.75).color("orange"),
  sound("hh").euclid(8, 8).hpf(8000).pan(0.62).gain(0.45).color("yellow"),
  sound("oh").euclidRot(2, 8, 2).hpf(5000).pan(0.38).room(0.12).gain(0.35).color("gold")
)._punchcard()

const blastBeat = stack(
  sound("bd sd").fast(8).pan(0.5).room(0.02).gain(0.82).color("red"),
  sound("hh").fast(16).hpf(9000).pan(perlin.range(0.4, 0.6)).gain(0.35).color("yellow")
)._punchcard()

const doubleBass = stack(
  sound("bd").euclid(15, 16).pan(0.5).room(0.02).gain(0.88).color("red"),
  sound("sd").euclidRot(2, 8, 4).pan(0.48).room(0.1).gain(0.78).color("orange"),
  sound("hh").euclid(16, 16).hpf(8500).pan(sine.range(0.55, 0.7).fast(4)).gain(0.4).color("yellow")
)._punchcard()

const breakdownDrums = stack(
  sound("bd ~ ~ ~ bd ~ bd ~").pan(0.5).room(0.08).gain(0.92).color("darkred"),
  sound("~ ~ ~ ~ sd ~ ~ ~").pan(0.5).room(0.2).roomsize(5).gain(0.82).color("crimson"),
  sound("~ ~ oh ~ ~ ~ ~ ~").hpf(4000).pan(0.4).room(0.25).gain(0.45).color("orange")
)._punchcard()

// --- RIFF PATTERNS ---
// Main thrash riff in E minor
const mainRiff = cat(
  powerChord("e2*8"),
  powerChord("<e2 e2 g2 a2>*2"),
  powerChord("e2*4").cat(powerChord("d2*2"), powerChord("e2*2")),
  powerChord("<e2 ~ e2 ~> <g2 ~ a2 ~>")
).gain("0.85 0.55 0.55 0.55 0.85 0.55 0.55 0.55")
  .color("lime")._punchcard()

// Palm-muted chugs
const chugPattern = note("e2*16")
  .apply(metalRhythm)
  .gain("1 0.5 0.5 0.5 1 0.5 0.5 0.5 1 0.5 0.5 0.5 1 0.5 0.65 0.5")
  .decay(0.04)
  .color("chartreuse")._punchcard()

// Djent syncopated pattern
const djentRiff = note("e2 ~ e2 ~ ~ e2 ~ e2 ~ ~ ~ e2 ~ e2 e2 ~")
  .apply(metalRhythm)
  .gain(0.82)
  .color("greenyellow")._punchcard()

// Galloping pattern (triplet feel)
const gallopRiff = note("e2 e2 e2 e2 e2 e2 g2 g2 g2 a2 a2 a2")
  .apply(metalRhythm)
  .gain("1 0.5 0.5 1 0.5 0.5 1 0.5 0.5 1 0.5 0.5")
  .color("limegreen")._punchcard()

// Breakdown riff - slow and crushing, extra wide
const breakdownRiff = note("e1 ~ ~ ~ e1 ~ e1 ~")
  .s("sawtooth")
  .distort(5)
  .lpf(450).hpf(40)
  .attack(0.001).decay(0.15).sustain(0.4)
  .juxBy(0.8, x => x.detune(20))
  .room(0.15).roomsize(3)
  .gain(0.88)
  .color("darkgreen")._scope()

// --- BASS ---
const metalBassLine = note("e1*4 e1*2 d1 e1")
  .apply(metalBass)
  .color("purple")._scope()

const breakdownBassLine = note("e1 ~ ~ ~ e1 ~ e1 ~")
  .apply(metalBass)
  .distort(3)
  .color("indigo")._scope()

// --- LEAD MELODY ---
const leadMelody = note("e4 g4 a4 b4 a4 g4 e4 d4")
  .apply(metalLead)
  .gain(0.48)
  .color("cyan")._scope()

// --- SECTIONS ---
const intro = stack(
  thrashDrums.mask("~ x"),
  chugPattern
)

const verse = stack(
  doubleBass,
  mainRiff,
  metalBassLine
)

const preChorus = stack(
  thrashDrums,
  gallopRiff,
  note("e1 e1 e1 e1 e1 e1 g1 g1 g1 a1 a1 a1").apply(metalBass)
)

const chorus = stack(
  doubleBass,
  djentRiff,
  metalBassLine,
  leadMelody
)

const breakdown = stack(
  breakdownDrums,
  breakdownRiff,
  breakdownBassLine
).slow(2)

// --- ARRANGEMENT ---
slowcat(
  intro,              // 4 bars
  intro,              // 4 bars
  verse,              // 4 bars
  verse,              // 4 bars
  preChorus,          // 4 bars
  preChorus,          // 4 bars
  chorus,             // 4 bars
  chorus,             // 4 bars
  breakdown,          // 8 bars (slowed)
  breakdown           // 8 bars (slowed)
).cpm(40)
`;

// ============================================================================
// CLASSICAL SHOWCASE - Fugue in the Style of Bach (Andante, ~75 BPM)
// Duration: ~80 seconds | Form: Sonata - Exposition → Development → Recapitulation → Coda
// ============================================================================
export const classicalShowcase = `// Classical Showcase: "Fugue in D Major"
// A baroque-inspired piece demonstrating classical composition techniques
// Duration: ~80 seconds | Tempo: Andante (~75 BPM)
//
// === CLASSICAL TERMINOLOGY APPLIED ===
// Form: Sonata form (Exposition → Development → Recapitulation → Coda)
// Counterpoint: Canon, Stretto, Invertible counterpoint
// Development: Augmentation, Diminution, Retrograde, Sequence
// Cadences: Authentic (V→I), Half (→V), Deceptive (V→vi)
// Articulation: Legato, Staccato, Tenuto, Marcato
// Dynamics: pp, p, mp, mf, f, ff (via gain presets)
//
// === MODIFY THESE ===
// - Subject: edit the fugue subject melody
// - Tempo: change .cpm() (andante=25, moderato=35, allegro=50)
// - Dynamics: adjust dyn.p, dyn.mf, dyn.f gain values
// - Articulation: modify art.legato, art.staccato sustain values

// === TEMPO LIBRARY (cycles per minute) ===
const tempo = {
  largo: 15,      // very slow, broad
  adagio: 20,     // slow, at ease
  andante: 25,    // walking pace
  moderato: 35,   // moderate
  allegro: 50,    // fast, lively
  presto: 60      // very fast
}

// === DYNAMICS LIBRARY ===
const dyn = {
  pp: x => x.gain(0.15),   // pianissimo
  p: x => x.gain(0.3),     // piano
  mp: x => x.gain(0.45),   // mezzo piano
  mf: x => x.gain(0.6),    // mezzo forte
  f: x => x.gain(0.75),    // forte
  ff: x => x.gain(0.88)    // fortissimo
}

// === ARTICULATION LIBRARY ===
const art = {
  legato: x => x.sustain(1),              // smooth, connected
  staccato: x => x.sustain(0.2),          // short, detached
  tenuto: x => x.sustain(0.9).gain(0.7),  // held, weighted
  marcato: x => x.sustain(0.5).gain(0.9), // marked, accented
  portato: x => x.sustain(0.6)            // semi-detached
}

// === EXPRESSION LIBRARY ===
const mood = {
  cantabile: x => x.sustain(1.2).gain(0.55),  // singing style
  dolce: x => x.sustain(1).gain(0.35),        // sweet, gentle
  espressivo: x => x.sustain(1.1).gain(0.6),  // expressive
  maestoso: x => x.sustain(0.9).gain(0.8)     // majestic
}

// --- SOUND PALETTE (with spatial staging) ---
// Soprano voice: right side, moderate depth (highest register)
const sopranoVoice = x => x.s("sawtooth")
  .lpf(3500).hpf(500)
  .attack(0.01).decay(0.35).sustain(0.5).release(0.3)
  .pan(0.7)
  .room(0.4).roomsize(6).roomlp(4000)

// Alto voice: center-right (mid-high register)
const altoVoice = x => x.s("sawtooth")
  .lpf(2800).hpf(300)
  .attack(0.01).decay(0.4).sustain(0.5).release(0.3)
  .pan(0.55)
  .room(0.35).roomsize(5).roomlp(4500)

// Tenor voice: center-left (mid-low register)
const tenorVoice = x => x.s("sawtooth")
  .lpf(2000).hpf(150)
  .attack(0.01).decay(0.35).sustain(0.5).release(0.3)
  .pan(0.35)
  .room(0.3).roomsize(4)

// Bass voice: left side, closer, foundation
const bassVoice = x => x.s("sawtooth")
  .lpf(800).hpf(40)
  .attack(0.01).decay(0.3).sustain(0.6)
  .pan(0.5).room(0.05)

// Continuo: wide stereo, deep reverb, background
const continuoVoice = x => x.s("sawtooth")
  .lpf(1600).hpf(150)
  .attack(0.15).decay(0.3).sustain(0.4).release(0.5)
  .juxBy(0.6, x => x.add(note(0.05)))
  .room(0.55).roomsize(8).roomlp(3000)
  .gain(0.28)

// === THE FUGUE SUBJECT (8-note theme in D major) ===
const subject = note("fs4 e4 d4 cs4 b3 a3 b3 cs4")

// === THE ANSWER (subject transposed to dominant - A major) ===
const answer = note("cs5 b4 a4 gs4 fs4 e4 fs4 gs4")

// === COUNTERSUBJECT (contrasting melody that accompanies the answer) ===
const countersubject = note("a3 b3 d4 e4 fs4 g4 fs4 e4")

// === CANONIC VOICES (imitative counterpoint) ===
// Voice 1: Subject enters alone (Soprano)
const voice1 = subject.apply(sopranoVoice).apply(art.legato).apply(dyn.mf)
  .color("gold")._pianoroll()

// Voice 2: Answer enters after delay (Alto) - canon at the fifth
const voice2 = answer.late(0.5).apply(altoVoice).apply(art.legato).apply(dyn.mp)
  .color("orange")._pianoroll()

// Voice 3: Subject in lower octave (Tenor) - tonal answer
const voice3 = subject.late(1).transpose(-12).apply(tenorVoice).apply(art.legato).apply(dyn.mp)
  .color("coral")._pianoroll()

// Voice 4: Answer in bass register (Bass)
const voice4 = answer.late(1.5).transpose(-24).apply(bassVoice).apply(art.tenuto).apply(dyn.p)
  .color("brown")._pianoroll()

// === HARMONIC PROGRESSIONS ===
// Main progression: I → V → vi → iii → IV → I → IV → V (Pachelbel Canon)
const mainProgression = chord("<D A Bm F#m G D G A>").voicing()

// Development progression with secondary dominants: I → iii → vi → V/V → V → I → IV → V7
const developmentProg = chord("<D F#m Bm E7 A D G A7>").voicing()

// Cadential progressions
const authenticCadence = chord("<A D>").voicing()      // V → I (perfect cadence)
const halfCadence = chord("<D G A>").voicing()         // ends on V
const deceptiveCadence = chord("<A Bm>").voicing()     // V → vi (surprise!)
const plagalCadence = chord("<G D>").voicing()         // IV → I (Amen)

// === PEDAL POINT (sustained tonic under changing harmony) ===
const pedalTone = note("d2 d2 d2 d2 d2 d2 d2 d2")

// === BASS LINES (basso continuo style) ===
const walkingBass = chord("<D A Bm F#m G D G A>").rootNotes(2).note()
const developmentBass = chord("<D F#m Bm E7 A D G A7>").rootNotes(2).note()

// === DEVELOPMENT TECHNIQUES ===

// AUGMENTATION: Subject stretched to double duration (.slow(2))
const subjectAugmented = subject.slow(2).apply(altoVoice).apply(mood.maestoso)
  .color("skyblue")._scope()

// DIMINUTION: Subject compressed to half duration (.fast(2))
const subjectDiminished = subject.fast(2).apply(sopranoVoice).apply(art.staccato).apply(dyn.f)
  .color("deepskyblue")._punchcard()

// RETROGRADE: Subject played backwards (.rev())
const subjectRetrograde = subject.rev().apply(tenorVoice).apply(art.legato).apply(dyn.mp)
  .color("steelblue")._pianoroll()

// INVERSION: Melodic intervals flipped (ascending → descending)
const subjectInverted = note("a3 b3 d4 e4 fs4 g4 fs4 e4")
  .apply(altoVoice).apply(art.legato).apply(dyn.mp)
  .color("dodgerblue")._pianoroll()

// SEQUENCE: Pattern repeated at ascending pitch levels
const sequenceUp = cat(
  subject.apply(altoVoice),
  subject.transpose(2).apply(altoVoice),
  subject.transpose(4).apply(altoVoice),
  subject.transpose(5).apply(altoVoice)
).apply(dyn.mf)
  .color("royalblue")._pianoroll()

// === STRETTO (overlapping entries for climax) ===
const stretto = stack(
  subject.apply(sopranoVoice).apply(dyn.f).color("gold"),
  subject.late(0.25).transpose(-5).apply(altoVoice).apply(dyn.mf).color("orange"),
  subject.late(0.5).transpose(-12).apply(tenorVoice).apply(dyn.mf).color("coral")
)._pianoroll()

// === ORNAMENTS ===
// Trill on D (rapid alternation with upper note)
const trillOnD = note("d4 [e4 d4]*4 e4 fs4")
  .apply(sopranoVoice).apply(dyn.mp)
  .color("pink")._punchcard()

// Mordent (quick neighbor note decoration)
const withMordent = note("[d4 e4 d4] fs4 [g4 a4 g4] b4")
  .apply(sopranoVoice).apply(art.legato).apply(dyn.mf)
  .color("lightcoral")._punchcard()

// Turn figure (upper → main → lower → main)
const withTurn = note("[e4 d4 cs4 d4] fs4 [g4 fs4 e4 fs4] a4")
  .apply(altoVoice).apply(dyn.mp)
  .color("salmon")._punchcard()

// === SECTIONS (SONATA FORM) ===

// --- EXPOSITION (subject entries, building texture) ---
// First entry: Subject alone, monophonic (p → mp crescendo)
const exposition1 = stack(
  voice1,
  walkingBass.apply(bassVoice).apply(dyn.p)
).apply(art.legato)

// Second entry: Answer joins with countersubject (homophonic texture)
const exposition2 = stack(
  subject.apply(sopranoVoice).apply(dyn.mf),
  countersubject.apply(altoVoice).apply(dyn.mp),
  mainProgression.apply(continuoVoice),
  walkingBass.apply(bassVoice).apply(dyn.mp)
)

// Third entry: Full 3-voice polyphony (stile antico)
const exposition3 = stack(
  voice1,
  voice2,
  voice3,
  mainProgression.apply(continuoVoice),
  walkingBass.apply(bassVoice).apply(dyn.mp)
)

// Fourth entry: Complete 4-voice texture with half cadence
const exposition4 = stack(
  subject.apply(sopranoVoice).apply(dyn.mf),
  countersubject.late(0.5).apply(altoVoice).apply(dyn.mp),
  subjectInverted.late(1).apply(tenorVoice).apply(dyn.mp),
  walkingBass.apply(bassVoice).apply(dyn.mf),
  halfCadence.slow(4).apply(continuoVoice)
)

// --- DEVELOPMENT (thematic transformation) ---
// Episode 1: Diminution with sequence (allegro character)
const development1 = stack(
  subjectDiminished,
  countersubject.fast(2).apply(tenorVoice).apply(art.staccato).apply(dyn.mf),
  developmentProg.apply(continuoVoice),
  developmentBass.apply(bassVoice).apply(dyn.mf)
)

// Episode 2: Augmentation over pedal point (maestoso)
const development2 = stack(
  subjectAugmented.slow(0.5),
  withTurn,
  pedalTone.apply(bassVoice).apply(art.tenuto).apply(dyn.mp),
  developmentProg.apply(continuoVoice).apply(dyn.p)
)

// Episode 3: Retrograde and inversion (mirror counterpoint)
const development3 = stack(
  subjectRetrograde,
  subjectInverted.late(0.5),
  deceptiveCadence.slow(4).apply(continuoVoice), // surprise! V → vi
  developmentBass.apply(bassVoice).apply(dyn.mp)
)

// Episode 4: Stretto climax (fortissimo)
const development4 = stack(
  stretto,
  trillOnD.late(0.75),
  developmentProg.apply(continuoVoice).apply(dyn.f),
  developmentBass.apply(bassVoice).apply(dyn.f)
)

// --- RECAPITULATION (return of subject in tonic) ---
const recapitulation = stack(
  subject.apply(sopranoVoice).apply(mood.cantabile).apply(dyn.f),
  countersubject.late(0.5).apply(altoVoice).apply(art.legato).apply(dyn.mf),
  subjectInverted.late(1).apply(tenorVoice).apply(dyn.mf),
  walkingBass.apply(bassVoice).apply(dyn.f),
  mainProgression.apply(continuoVoice).apply(dyn.mf),
  withMordent.late(0.75).apply(dyn.mp)
)

// --- CODA (plagal cadence, morendo) ---
const coda = stack(
  subject.slow(2).apply(sopranoVoice).apply(mood.dolce).room(0.55),
  plagalCadence.slow(2).apply(continuoVoice).room(0.6).apply(dyn.p),
  note("<d2 g1 d2>").slow(2).apply(bassVoice).apply(art.tenuto).apply(dyn.p)
)

// === FINAL ARRANGEMENT (Sonata Form) ===
slowcat(
  // EXPOSITION (4 sections, ~20 seconds)
  exposition1,        // Subject alone - piano
  exposition2,        // Answer + countersubject - mezzo piano
  exposition3,        // Three voices - mezzo forte
  exposition4,        // Four voices + half cadence - forte

  // DEVELOPMENT (4 episodes, ~20 seconds)
  development1,       // Diminution + sequence - allegro character
  development2,       // Augmentation + pedal - maestoso
  development3,       // Retrograde + inversion - mirror counterpoint
  development4,       // Stretto climax - fortissimo

  // RECAPITULATION (2 statements, ~10 seconds)
  recapitulation,     // Full return - cantabile, forte
  recapitulation,     // Extended ending - with ornaments

  // CODA (slowed, ~8 seconds)
  coda                // Plagal cadence - dolce, morendo
).cpm(tempo.andante)
`;

// ============================================================================
// DEMOSCENE SHOWCASE - Chiptune (150 BPM)
// Duration: ~70 seconds | Structure: Intro → Main A → Main B → Bridge → Main A'
// ============================================================================
export const demosceneShowcase = `// Demoscene Showcase: "Pixel Dreams"
// A chiptune track with arpeggios, chip drums, and SID-style filters
// Duration: ~70 seconds | 150 BPM
//
// === MODIFY THESE ===
// - Arpeggio speed: change .fast() values
// - Filter sweep: adjust lpf sine.range() and lpq
// - Stereo positioning: modify .pan() values
// - Waveforms: swap square/triangle/sawtooth

// --- SOUND PALETTE (with spatial positioning) ---
// Lead: slightly right, some depth, high-mids
const chipLead = x => x.s("square")
  .lpf(4000).hpf(600)
  .decay(0.1).sustain(0.3)
  .pan(0.6)
  .room(0.15).roomsize(3)
  .delay(0.18).delaytime(0.166).delayfeedback(0.25)
  .gain(0.52)

// Bass: centered, dry, low frequencies
const chipBass = x => x.s("triangle")
  .lpf(800).hpf(40)
  .decay(0.15).sustain(0.4)
  .pan(0.5).room(0)
  .gain(0.68)

// Arpeggio: stereo movement, mid frequencies
const chipArp = x => x.s("square")
  .lpf(3000).hpf(300)
  .decay(0.04).sustain(0.1)
  .pan(sine.range(0.35, 0.65).slow(2))
  .room(0.1)
  .gain(0.42)

// SID bass: centered, filter sweep, gritty
const sidBass = x => x.s("sawtooth")
  .lpq(10)
  .decay(0.12).sustain(0.3)
  .pan(0.5).room(0)
  .gain(0.58)

// --- CHIP DRUMS (synthesized, with spatial placement) ---
const chipKick = note("c1").s("sine")
  .decay(0.12).penv(24).pdec(0.03)
  .pan(0.5).room(0)
  .gain(0.88)

const chipSnare = stack(
  sound("white").decay(0.08).lpf(4500).hpf(800),
  note("c3").s("sine").decay(0.04)
).pan(0.48).room(0.08).gain(0.52)

const chipHat = sound("white")
  .decay(0.02).hpf(9000)
  .pan(sine.range(0.55, 0.75).fast(2))
  .room(0.05)
  .gain(0.32)

const chipHatOpen = sound("white")
  .decay(0.06).hpf(6000)
  .pan(0.35)
  .room(0.1)
  .gain(0.28)

const mainDrums = stack(
  chipKick.struct("x ~ x ~").color("red"),
  chipSnare.struct("~ x").color("orange"),
  chipHat.struct("x*8").color("yellow"),
  chipHatOpen.struct("~ ~ ~ ~ ~ ~ x ~").color("gold")
)._punchcard()

const bridgeDrums = stack(
  chipKick.struct("x ~ ~ x ~ ~ x ~").color("red"),
  chipSnare.struct("~ ~ x ~ ~ ~ x ~").color("orange"),
  chipHat.struct("x*4").color("yellow")
)._punchcard()

// --- ARPEGGIOS ---
// Main arpeggio: C minor chord cycling
const mainArp = note("c4 eb4 g4 c5 g4 eb4".fast(4))
  .apply(chipArp)
  .color("cyan")._punchcard()

// Secondary arpeggio: Ab major, different pan
const secondArp = note("ab3 c4 eb4 ab4 eb4 c4".fast(4))
  .apply(chipArp)
  .pan(sine.range(0.4, 0.7).slow(2))
  .color("deepskyblue")._punchcard()

// Bridge arpeggio: slower, more melodic
const bridgeArp = note("c4 eb4 g4 c5".fast(2))
  .apply(chipArp)
  .vib(4).vibmod(0.15)
  .pan(0.45)
  .color("dodgerblue")._punchcard()

// --- BASS PATTERNS ---
const mainBassA = note("<c2 c2 ab1 bb1>")
  .apply(chipBass)
  .color("lime")._scope()

const mainBassB = note("<ab1 ab1 bb1 c2>")
  .apply(chipBass)
  .color("chartreuse")._scope()

const sidFilterBass = note("c2 c2 eb2 c2 c2 g2 c2 c2")
  .apply(sidBass)
  .lpf(sine.range(300, 2000).fast(2))
  .color("limegreen")._scope()

// --- LEAD MELODIES ---
const leadA = note("~ ~ g4 ~ c5 ~ eb5 ~, ~ ~ ~ ~ ~ g5 ~ ~")
  .apply(chipLead)
  .color("magenta")._scope()

const leadB = note("eb5 ~ c5 ~ g4 ~ eb4 c4, ~ ~ ~ ~ ~ ~ g4 ~")
  .apply(chipLead)
  .pan(0.4)
  .color("hotpink")._scope()

const bridgeLead = note("c5 eb5 g5 ~ eb5 c5 g4 ~")
  .apply(chipLead)
  .vib(5).vibmod(0.2)
  .pan(0.55)
  .room(0.25)
  .color("violet")._scope()

// --- CHORD PADS (fast arpeggios simulating chords, wide stereo) ---
const padA = note("c3 eb3 g3 c4 g3 eb3".fast(8))
  .s("triangle")
  .lpf(1500).hpf(150)
  .decay(0.03)
  .juxBy(0.4, rev)
  .room(0.2)
  .gain(0.22)
  .color("slateblue")._punchcard()

const padB = note("ab2 c3 eb3 ab3 eb3 c3".fast(8))
  .s("triangle")
  .lpf(1400).hpf(150)
  .decay(0.03)
  .juxBy(0.4, rev)
  .room(0.2)
  .gain(0.22)
  .color("mediumpurple")._punchcard()

// --- SECTIONS ---
const intro = stack(
  chipKick.struct("x ~ ~ ~"),
  chipHat.struct("x*4").gain(0.18),
  mainArp.lpf(sine.range(500, 2500).slow(4)).gain(0.28)
).slow(2)

const mainA = stack(
  mainDrums,
  mainArp,
  mainBassA,
  leadA,
  padA
)

const mainA2 = stack(
  mainDrums,
  mainArp,
  mainBassA,
  leadA,
  padA,
  note("c5 eb5 g5 c6".fast(8)).s("square")
    .lpf(5000).decay(0.02).pan(0.7).room(0.15).gain(0.18).mask("~ x")
)

const mainB = stack(
  mainDrums,
  secondArp,
  mainBassB,
  leadB,
  padB
)

const bridge = stack(
  bridgeDrums,
  bridgeArp,
  sidFilterBass,
  bridgeLead
)

const mainAPrime = stack(
  mainDrums.sometimes(x => x.fast(2)),
  mainArp.sometimes(x => x.fast(2)),
  mainBassA,
  leadA,
  padA,
  note("g5 c6 eb6 g6".fast(8)).s("square")
    .lpf(6000).decay(0.02).pan(0.3).room(0.12).gain(0.18).struct("~ ~ ~ ~ ~ ~ x ~")
)

const outro = stack(
  chipKick.struct("x ~ ~ ~"),
  mainArp.lpf(sine.range(2500, 500).slow(4)).gain(0.38),
  note("c3").apply(chipBass)
).slow(2)

// --- ARRANGEMENT ---
slowcat(
  intro,            // 8 bars
  mainA,            // 4 bars
  mainA,            // 4 bars
  mainB,            // 4 bars
  mainB,            // 4 bars
  mainA2,           // 4 bars
  mainA2,           // 4 bars
  bridge,           // 4 bars
  bridge,           // 4 bars
  mainAPrime,       // 4 bars
  mainAPrime,       // 4 bars
  outro             // 8 bars
).cpm(37.5)
`;

// ============================================================================
// ROCK/POP SHOWCASE - 80s Synth-Pop / New Wave (120 BPM)
// Duration: ~70 seconds | Structure: Intro → Verse → Pre-Chorus → Chorus → Bridge → Outro
// ============================================================================
export const rockPopShowcase = `// Rock/Pop Showcase: "Digital Horizon"
// An 80s synth-pop/new wave track with drum machines and synth arpeggios
// Duration: ~70 seconds | 120 BPM
//
// === MODIFY THESE ===
// - Drum machine: change .bank() to try different kits
// - Synth bass filter: adjust lpf modulation range
// - Stereo width: modify .juxBy() and .pan() values
// - Spatial depth: adjust .room() and .delay() settings

// --- SOUND PALETTE (with spatial positioning) ---
// Synth bass: centered, dry, filtered lows
const synthBass = x => x.s("sawtooth")
  .lpf(sine.range(400, 1200).fast(0.5)).lpq(5).hpf(40)
  .attack(0.001).decay(0.15).sustain(0.3)
  .pan(0.5).room(0)
  .gain(0.58)

// Synth pad: wide stereo, deep reverb, mid frequencies
const synthPad = x => x.s("sawtooth")
  .lpf(2200).hpf(250)
  .attack(0.1).decay(0.2).sustain(0.6).release(0.4)
  .juxBy(0.55, x => x.add(note(0.06)))
  .room(0.4).roomsize(6).roomlp(3500)
  .gain(0.32)

// Synth arp: off-center, delay throws, high-mids
const synthArp = x => x.s("sawtooth")
  .lpf(3200).hpf(500)
  .attack(0.001).decay(0.1).sustain(0.15)
  .pan(0.38)
  .room(0.2)
  .delay(0.35).delaytime(0.125).delayfeedback(0.4)
  .gain(0.38)

// Synth lead: opposite side, reverb, presence
const synthLead = x => x.s("sawtooth")
  .lpf(4000).hpf(600)
  .attack(0.01).decay(0.2).sustain(0.5)
  .pan(0.65)
  .room(0.3).roomsize(5)
  .delay(0.2).delaytime(0.25).delayfeedback(0.25)
  .gain(0.42)

// TR-808 with spatial placement
const tr808 = x => x.bank("RolandTR808")

// --- DRUM PATTERNS (with spatial separation) ---
const verseDrums = stack(
  sound("bd").euclid(4, 8).apply(tr808).pan(0.5).room(0.03).color("red"),
  sound("sd").euclidRot(2, 8, 4).apply(tr808).pan(0.48).room(0.12).color("orange"),
  sound("hh").euclid(8, 8).apply(tr808).hpf(7500).pan(sine.range(0.55, 0.7).slow(2)).gain(0.38).color("yellow")
)._punchcard()

const chorusDrums = stack(
  sound("bd").euclid(4, 8).apply(tr808).pan(0.5).room(0.03).color("red"),
  sound("[sd,cp]").euclidRot(2, 8, 4).apply(tr808).pan(0.48).room(0.15).color("orange"),
  sound("hh").euclid(8, 8).apply(tr808).hpf(8000).pan(sine.range(0.5, 0.72).slow(2)).gain(0.42).color("yellow"),
  sound("oh").euclidRot(2, 8, 2).apply(tr808).hpf(5000).pan(0.35).room(0.18).gain(0.32).color("gold")
)._punchcard()

const bridgeDrums = stack(
  sound("bd").euclidRot(3, 8, 0).apply(tr808).pan(0.5).room(0.08).gain(0.65).color("red"),
  sound("sd").euclidRot(1, 4, 2).apply(tr808).pan(0.48).room(0.2).gain(0.55).color("orange"),
  sound("hh").euclid(8, 8).apply(tr808).hpf(7000).pan(0.6).gain(0.28).color("yellow")
)._punchcard()

const introDrums = stack(
  sound("bd").euclidRot(2, 8, 0).apply(tr808).pan(0.5).room(0.05).gain(0.55).color("red"),
  sound("hh").euclid(8, 8).apply(tr808).hpf(8000).pan(0.62).gain(0.28).color("yellow")
)._punchcard()

// --- BASS LINES ---
const verseBass = note("c2 c2 g2 c2 eb2 eb2 g2 eb2")
  .apply(synthBass)
  .color("lime")._scope()

const chorusBass = note("ab1 ab1 ab2 ab1 bb1 bb1 bb2 bb1")
  .apply(synthBass)
  .color("chartreuse")._scope()

const bridgeBass = note("f2 ~ f2 ~ g2 ~ g2 ~")
  .apply(synthBass)
  .lpf(700)
  .color("limegreen")._scope()

// --- CHORD PROGRESSIONS ---
// Verse: Cm → Eb
const verseChords = chord("<Cm Eb>").voicing()
// Chorus: Ab → Bb → Cm → Eb
const chorusChords = chord("<Ab Bb Cm Eb>").voicing()
// Bridge: Fm → Gm
const bridgeChords = chord("<Fm Gm>").voicing()

// --- ARPEGGIOS ---
const verseArp = note("c4 eb4 g4 c5 g4 eb4".fast(2))
  .apply(synthArp)
  .color("cyan")._punchcard()

const chorusArp = note("<ab3 c4 eb4 ab4> <bb3 d4 f4 bb4> <c4 eb4 g4 c5> <eb4 g4 bb4 eb5>".fast(2))
  .apply(synthArp)
  .pan(0.35)
  .color("deepskyblue")._punchcard()

// --- LEAD MELODY ---
const verseMelody = note("~ ~ eb4 ~ c4 ~ g4 ~")
  .apply(synthLead)
  .color("magenta")._scope()

const chorusMelody = note("ab4 ~ c5 ~ bb4 ~ g4 ~, ~ ~ ~ eb5 ~ ~ ~ c5")
  .apply(synthLead)
  .color("hotpink")._scope()

const bridgeMelody = note("f4 ~ g4 ~ ab4 ~ bb4 ~")
  .apply(synthLead)
  .vib(5).vibmod(0.1)
  .pan(0.6)
  .color("violet")._scope()

// --- SECTIONS ---
const intro = stack(
  introDrums,
  verseArp.lpf(sine.range(800, 2500).slow(4)),
  note("c2").apply(synthBass).struct("x ~ ~ ~")
).slow(2)

const verse = stack(
  verseDrums,
  verseBass,
  verseChords.apply(synthPad),
  verseArp,
  verseMelody
)

const preChorus = stack(
  verseDrums,
  note("ab1 ab1 bb1 bb1").apply(synthBass),
  chord("<Ab Bb>").voicing().apply(synthPad),
  note("ab3 c4 eb4 ab4 bb3 d4 f4 bb4".fast(2)).apply(synthArp).pan(0.4)
)

const chorus = stack(
  chorusDrums,
  chorusBass,
  chorusChords.apply(synthPad),
  chorusArp,
  chorusMelody
)

const bridge = stack(
  bridgeDrums,
  bridgeBass,
  bridgeChords.apply(synthPad).lpf(1400).room(0.5),
  bridgeMelody
)

const outro = stack(
  introDrums,
  verseArp.lpf(sine.range(2500, 600).slow(4)),
  note("c2").apply(synthBass).struct("x ~ ~ ~"),
  chord("Cm").voicing().apply(synthPad).lpf(sine.range(1500, 500).slow(4)).room(0.55)
).slow(2)

// --- ARRANGEMENT ---
slowcat(
  intro,            // 8 bars
  verse,            // 4 bars
  verse,            // 4 bars
  preChorus,        // 4 bars
  chorus,           // 4 bars
  chorus,           // 4 bars
  verse,            // 4 bars
  preChorus,        // 4 bars
  chorus,           // 4 bars
  chorus,           // 4 bars
  bridge,           // 4 bars
  bridge,           // 4 bars
  outro             // 8 bars
).cpm(30)
`;
