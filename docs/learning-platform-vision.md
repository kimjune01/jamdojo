# Strudel Music Theory Learning Platform: Vision Document

## Executive Summary

An interactive, gamified music theory learning platform that uses Strudel's live coding environment to teach music through **methodical observation and creation**. Combines Duolingo's engagement mechanics with Khan Academy's mastery-based pedagogy, while leveraging Strudel's unique ability to provide immediate audio-visual feedback for code-based music creation.

## Core Philosophy

**"Hear it. Code it. Master it."**

Learning happens through three interconnected modes:
1. **Listen** - Develop ear training through pattern recognition
2. **Create** - Express musical ideas through code
3. **Experiment** - Discover theory through guided exploration

## Layered Learning Architecture

The platform is built as **layers of abstraction** on top of the Strudel REPL core. Each layer adds scaffolding and guidance while preserving access to the raw power beneath. As learners progress, they can "peel back" layers to work closer to the core.

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: COMMUNITY HUB (JamHub)                            │
│  Share, discover, remix recipes                             │
│  Social learning, competitions, showcases                   │
└─────────────────────────────────────────────────────────────┘
                          ↓ builds on
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: COLLABORATIVE LEARNING                            │
│  Jam rooms, peer review, study groups                       │
│  Shared challenges, teacher dashboards                      │
└─────────────────────────────────────────────────────────────┘
                          ↓ builds on
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: STRUCTURED LESSONS                                │
│  Skill trees, progressive challenges, mastery tracking      │
│  Gamification: XP, streaks, achievements                    │
└─────────────────────────────────────────────────────────────┘
                          ↓ builds on
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: INTERACTIVE WRAPPERS                              │
│  Multiple choice, fill-in-blanks, hear-and-guess           │
│  Hints, scaffolding, constrained exercises                  │
└─────────────────────────────────────────────────────────────┘
                          ↓ builds on
┌─────────────────────────────────────────────────────────────┐
│  Layer 0: STRUDEL REPL (CORE)                               │
│  Raw live coding environment                                │
│  Full power, no constraints, direct feedback                │
└─────────────────────────────────────────────────────────────┘
```

### Layer 0: Strudel REPL (Core)

**The Foundation**: Raw, powerful live coding environment

```javascript
// Direct access, full power
note("c3 e3 g3").slow(2)
  .stack(s("bd sd"))
  .room(0.9)
```

**Characteristics:**
- Immediate audio feedback
- No guardrails
- Infinite creative freedom
- Requires understanding of syntax
- Direct manipulation

**Always accessible** - even at highest layers, users can drop down to raw REPL

---

### Layer 1: Interactive Wrappers

**Adds**: Scaffolding, hints, constraints, multiple choice

These are **UI components that wrap the REPL** with learning affordances.

#### Example: Hear-and-Guess Multiple Choice

```
┌────────────────────────────────────────────────────┐
│  Exercise: Identify this rhythm pattern            │
├────────────────────────────────────────────────────┤
│                                                     │
│  🔊 [Play Sound]                                   │
│                                                     │
│  Which Strudel code produces this sound?           │
│                                                     │
│  ○ A) s("bd sd bd sd")                             │
│  ○ B) s("bd ~ sd ~")                               │
│  ○ C) s("bd*4")                                    │
│  ○ D) s("bd sd [bd bd] sd")                        │
│                                                     │
│  [Submit Answer]                                   │
│                                                     │
│  ┌────────────────────────────────────────────────┐│
│  │ Behind the scenes (hidden):                    ││
│  │ // Correct answer                              ││
│  │ s("bd ~ sd ~")                                 ││
│  │                                                 ││
│  │ // Playing in REPL core                        ││
│  │ StrudelREPL.evaluate('s("bd ~ sd ~")')         ││
│  └────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────┘
```

**How it works:**
1. Exercise UI is a **wrapper component**
2. Core REPL runs underneath (hidden or visible)
3. Multiple choice options are **scaffolding**
4. When answered, learner can "see the code" (reveal REPL)

**Other Layer 1 wrappers:**

**Fill-in-the-Blank:**
```
┌────────────────────────────────────────────────────┐
│  Complete the pattern to create a C major chord:   │
│                                                     │
│  note("[c, ____, ____]")                          │
│         ↑  type here                               │
│                                                     │
│  Hint: A major chord is notes 1, 3, and 5         │
│  [Show me the scale] [Play what I have]           │
│                                                     │
│  ┌─────────── REPL (visible) ──────────┐          │
│  │ note("[c, ____, ____]")              │          │
│  │ // Type directly in the REPL         │          │
│  │ // Instant feedback                  │          │
│  └──────────────────────────────────────┘          │
└────────────────────────────────────────────────────┘
```

**Constrained Sandbox:**
```
┌────────────────────────────────────────────────────┐
│  Create a 4-beat pattern using ONLY:               │
│  • 3 notes from C major scale                      │
│  • No effects allowed yet                          │
│                                                     │
│  ┌─────────── REPL ──────────────────┐            │
│  │ note("___")                        │            │
│  │                                    │            │
│  │ // Autocomplete limited to:       │            │
│  │ // c, d, e, f, g, a, b            │            │
│  └────────────────────────────────────┘            │
│                                                     │
│  ✓ Using 3 notes                                   │
│  ✓ Valid syntax                                    │
│  ✗ Not 4 beats yet (currently 2)                   │
└────────────────────────────────────────────────────┘
```

**Code Comparison:**
```
┌────────────────────────────────────────────────────┐
│  Compare these two patterns:                       │
│                                                     │
│  ┌─── Pattern A ───┐  ┌─── Pattern B ───┐        │
│  │ note("c e g")    │  │ note("[c,e,g]")  │        │
│  │ [▶ Play]         │  │ [▶ Play]         │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  What's the difference?                            │
│  ○ A plays sequence, B plays chord                 │
│  ○ No difference                                   │
│  ○ B is louder                                     │
│                                                     │
│  Both use same REPL, just different rendering      │
└────────────────────────────────────────────────────┘
```

**Key principle**: All Layer 1 wrappers are **thin UI layers** that:
- Use the REPL underneath
- Add constraints or scaffolding
- Provide hints and feedback
- Can be "unwrapped" to show raw code

---

### Layer 2: Structured Lessons

**Adds**: Progression paths, skill trees, mastery tracking, gamification

Layer 2 **sequences Layer 1 exercises** into coherent learning journeys.

```
┌────────────────────────────────────────────────────┐
│  Lesson 3: Rests and Silence                       │
│  ━━━━━━━━●━━━━━━━━━━━━━━━━━  60% complete          │
│                                                     │
│  You've mastered:                                  │
│  ✓ Exercise 1: Identify rest symbol (~)            │
│  ✓ Exercise 2: Hear and identify rests             │
│  ✓ Exercise 3: Fill in missing rests               │
│                                                     │
│  Current:                                          │
│  → Exercise 4: Create your own rhythm with rests   │
│                                                     │
│     [Layer 1: Constrained Sandbox wrapper]         │
│     ┌────────────────────────────────────┐         │
│     │ Create pattern with 2 rests        │         │
│     │ ┌─── REPL ─────────────┐           │         │
│     │ │ s("bd ~ sd ~")        │           │         │
│     │ └───────────────────────┘           │         │
│     └────────────────────────────────────┘         │
│                                                     │
│  Next:                                             │
│  ○ Exercise 5: Rhythm patterns quiz                │
│                                                     │
│  [Skip to free play REPL] ← Drop to Layer 0       │
└────────────────────────────────────────────────────┘
```

**How Layer 2 orchestrates Layer 1:**

```typescript
// Lesson structure
interface Lesson {
  id: "lesson-rests";
  exercises: [
    {
      type: "multiple-choice",        // Layer 1 wrapper
      wrapper: MultipleChoiceWrapper,
      content: { /* ... */ }
    },
    {
      type: "hear-and-guess",         // Layer 1 wrapper
      wrapper: HearAndGuessWrapper,
      content: { /* ... */ }
    },
    {
      type: "fill-in-blank",          // Layer 1 wrapper
      wrapper: FillInBlankWrapper,
      content: { /* ... */ }
    },
    {
      type: "free-play",              // Layer 0 (raw REPL)
      wrapper: REPLWrapper,
      constraints: { /* optional */ }
    }
  ];

  // Each exercise uses REPL core
  repl_instance: StrudelREPL;
}
```

**Escape hatches at every level:**
```
┌────────────────────────────────────────┐
│  Lesson 3, Exercise 4                  │
│                                         │
│  Too easy? [Skip ahead]                │
│  Too hard? [Get hints]                 │
│  Want freedom? [Open sandbox REPL] ←   │
│                                         │
│  All options use same REPL core        │
└────────────────────────────────────────┘
```

**Gamification wraps progression:**
- XP for completing exercises
- Streaks for daily practice
- Achievements for milestones
- All metadata, core learning still uses REPL

---

### Layer 3: Collaborative Learning

**Adds**: Real-time multiplayer, peer learning, social features

Layer 3 **connects multiple users** to shared REPL instances.

```
┌────────────────────────────────────────────────────┐
│  Jam Room: "Beginner Drum Circle"                  │
│  3/8 participants                                  │
├────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────── Shared REPL ──────────────┐        │
│  │ // @alice                              │        │
│  │ s("bd sd").bank("RolandTR808")        │        │
│  │                                        │        │
│  │ // @bob                                │        │
│  │ s("hh*8").gain(0.5)                   │        │
│  │                                        │        │
│  │ // Your cursor here ↓                 │        │
│  │ _                                      │        │
│  └────────────────────────────────────────┘        │
│                                                     │
│  Chat:                                             │
│  alice: Try adding a hi-hat!                       │
│  bob: Nice, I'll lower my volume                   │
│                                                     │
│  [Still the same REPL, just multi-user]            │
└────────────────────────────────────────────────────┘
```

**Layer 3 features built on REPL:**

**Teacher Dashboard:**
```
┌────────────────────────────────────────────────────┐
│  Class: "Music Theory 101"                         │
│  Live: 12 students practicing                      │
├────────────────────────────────────────────────────┤
│                                                     │
│  Student        Current Exercise      Progress     │
│  ─────────────────────────────────────────────────│
│  alice          Layer 1: Fill-blank   ●●●●●○       │
│  bob            Layer 0: Free REPL    (exploring)  │
│  charlie        Layer 1: Multi-choice ●●○○○○       │
│                                                     │
│  [View alice's REPL] ← See their actual code       │
│  [Join bob's session] ← Collaborate in real-time   │
│                                                     │
│  Each student has their own REPL instance          │
│  Teacher can observe or join any instance          │
└────────────────────────────────────────────────────┘
```

**Study Groups:**
```
┌────────────────────────────────────────────────────┐
│  Study Group: "Euclidean Explorers"                │
│                                                     │
│  Shared challenge: Master euclidean rhythms        │
│                                                     │
│  ┌─── Layer 2: Group lesson sequence ────┐        │
│  │                                         │        │
│  │  Each member works through:             │        │
│  │  1. Layer 1: Hear-and-guess            │        │
│  │  2. Layer 1: Fill-in-blank             │        │
│  │  3. Layer 0: Free experimentation      │        │
│  │                                         │        │
│  │  Progress synced, help each other       │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  [Open group jam room] ← Layer 3 feature           │
└────────────────────────────────────────────────────┘
```

---

### Layer 4: Community Hub (JamHub)

**Adds**: Discovery, sharing, remixing at scale

Layer 4 is where **learning artifacts become community resources**.

```
┌────────────────────────────────────────────────────┐
│  JamHub: Discover & Share                          │
├────────────────────────────────────────────────────┤
│                                                     │
│  🔥 Trending Recipe: "Ambient Forest"              │
│                                                     │
│  ┌────────────────────────────────────────────────┐│
│  │ 🔊 [Audio Preview]                             ││
│  │                                                 ││
│  │ ┌─── REPL (Layer 0) ───────────────┐          ││
│  │ │ note("c2 eb2 g2").slow(8)         │          ││
│  │ │   .room(0.9)                      │          ││
│  │ └───────────────────────────────────┘          ││
│  │                                                 ││
│  │ [Remix This] ← Fork & open in REPL             ││
│  │ [View Session Playback] ← Layer 3 recording    ││
│  │ [Try Guided Tutorial] ← Layer 2 lesson         ││
│  │ [Hear & Identify] ← Layer 1 exercise           ││
│  │                                                 ││
│  │ All layers available for different approaches  ││
│  └────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────┘
```

**Multiple entry points to same content:**

```
Recipe: "Techno Beat"
│
├─ Layer 0: Open in REPL (direct code)
├─ Layer 1: Guided deconstruction (hear each part)
├─ Layer 2: Tutorial lesson (step-by-step)
├─ Layer 3: Join jam room (collaborate)
└─ Layer 4: Browse similar recipes (discover)

All views share the same core REPL instance
```

---

## Layer Interaction Principles

### 1. **Always Accessible Core**
```
At any layer, user can "drop down" to raw REPL:

Layer 3 (Jam Room)
  ↓ [Open my own REPL]
Layer 0 (Raw REPL)

Layer 2 (Guided lesson)
  ↓ [Skip to sandbox]
Layer 0 (Raw REPL)

Layer 1 (Multiple choice)
  ↓ [Show me the code]
Layer 0 (Raw REPL)
```

### 2. **Progressive Disclosure**
```
Beginner path:
Start at Layer 2 → Use Layer 1 wrappers → Gradually reveal Layer 0

Advanced path:
Jump straight to Layer 0 → Maybe use Layer 1 for specific practice

The platform adapts to skill level
```

### 3. **Shared State**
```
All layers operate on the same REPL:

Layer 1 exercise modifies → REPL state
                              ↓
Layer 2 tracks progress   → REPL output
                              ↓
Layer 3 shares session    → REPL instance
                              ↓
Layer 4 publishes         → REPL code
```

### 4. **Composability**
```
Layers can be mixed:

┌─────────────────────────────────────────┐
│  Layer 2: Lesson "Chords"               │
│  ┌───────────────────────────────────┐  │
│  │  Layer 1: Multiple Choice         │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Layer 0: REPL              │  │  │
│  │  │  note("[c,e,g]")            │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│  [Invite friend] → Add Layer 3          │
│  [Publish solution] → Share to Layer 4  │
└─────────────────────────────────────────┘
```

---

## Technical Implementation

### Component Architecture

```typescript
// Layer 0: Core REPL
class StrudelREPL {
  evaluate(code: string): AudioOutput;
  getState(): REPLState;
  subscribe(callback: Function): void;
}

// Layer 1: Wrapper Components
interface ExerciseWrapper {
  repl: StrudelREPL;           // Reference to core
  scaffold: ScaffoldingUI;      // Hints, constraints
  validate: ValidationFn;       // Check answers
  render(): ReactElement;
}

class MultipleChoiceWrapper implements ExerciseWrapper {
  constructor(repl: StrudelREPL, options: MultipleChoiceOptions) {
    this.repl = repl;
    // Wrapper logic...
  }

  handleAnswer(choice: string) {
    // Run in REPL to verify
    const output = this.repl.evaluate(choice);
    const correct = this.validate(output);
    // Show feedback...
  }
}

// Layer 2: Lesson Orchestrator
class LessonSequence {
  private repl: StrudelREPL;
  private exercises: ExerciseWrapper[];

  constructor() {
    this.repl = new StrudelREPL();  // One REPL for lesson
  }

  nextExercise() {
    // Load next wrapper around same REPL
    const exercise = this.exercises[this.currentIndex];
    return <exercise.render repl={this.repl} />;
  }

  skipToREPL() {
    // Remove all wrappers, show raw REPL
    return <REPLView repl={this.repl} />;
  }
}

// Layer 3: Collaborative Session
class JamRoomSession {
  private sharedREPL: SharedStrudelREPL;  // WebRTC synced
  private participants: User[];

  constructor() {
    this.sharedREPL = new SharedStrudelREPL();
    // Multi-cursor editing, conflict resolution...
  }
}

// Layer 4: Community Platform
class RecipeViewer {
  private repl: StrudelREPL;

  showRecipe(recipe: Recipe) {
    // Can view in multiple ways:
    return {
      rawREPL: () => this.repl.load(recipe.code),
      tutorial: () => new LessonSequence(recipe),
      exercise: () => new ExerciseWrapper(this.repl, recipe),
      jam: () => new JamRoomSession(recipe)
    };
  }
}
```

### State Flow

```
User action (any layer)
        ↓
Update REPL state (Layer 0)
        ↓
REPL evaluates code
        ↓
Audio output + state change
        ↓
Layer-specific feedback
        ↓
Update UI (all layers observing)
```

---

## Example User Journeys Through Layers

### Journey 1: Complete Beginner

**Week 1: Start at Layer 2 (Structured)**
```
Day 1: Lesson 1 → Layer 1: "Click to hear note"
  ↓ (Uses Layer 0 underneath)
  User sees: "This is note('c')"
  Doesn't need to type yet

Day 3: Lesson 3 → Layer 1: "Fill in the blank"
  ↓ (Partially exposed Layer 0)
  User types: note("e")
  Guided by constraints

Day 7: Lesson 7 → Layer 0: "Free sandbox"
  ↓ (Full REPL access)
  User writes: note("c e g")
  No training wheels!
```

**Month 1: Add Layer 3 (Social)**
```
Week 4: Join study group
  ↓ (Layer 3 wrapping Layer 2)
  Collaborative lessons
  Still using REPL core

Week 6: First jam room
  ↓ (Layer 3 + Layer 0)
  Real-time coding with peers
  Direct REPL manipulation
```

**Month 3: Contribute to Layer 4 (Community)**
```
Week 10: Publish first recipe
  ↓ (Layer 4)
  Share REPL code to JamHub
  Others can remix

Week 12: Create tutorial
  ↓ (Layer 4 → Layer 2)
  Your Layer 0 code becomes
  someone else's Layer 2 lesson!
```

### Journey 2: Experienced Musician

**Day 1: Jump to Layer 0**
```
"I know music, teach me code"
  ↓
Start with raw REPL
Learn syntax through experimentation
Use Layer 1 only for specific practice
```

**Week 2: Use Layer 1 selectively**
```
Struggle with Euclidean rhythms
  ↓
Drop to Layer 1: Hear-and-guess exercises
  ↓
Back to Layer 0: Apply in free play
```

**Month 1: Layer 3 & 4 immediately**
```
Comfortable with code
  ↓
Join advanced jam rooms (Layer 3)
Publish complex recipes (Layer 4)
Skip Layer 2 entirely
```

---

## Visual Layer Indicator

**UI shows current layer context:**

```
┌────────────────────────────────────────┐
│  🎯 Layer 2: Lesson 5                  │  ← Layer indicator
│  ┌────────────────────────────────────┐│
│  │  📝 Layer 1: Fill in blank         ││  ← Wrapper type
│  │  ┌────────────────────────────────┐││
│  │  │  💻 REPL                       │││  ← Core always visible
│  │  │  note("c e ___")               │││
│  │  └────────────────────────────────┘││
│  │  [💡 Hint] [⚙️ Advanced mode]      ││  ← Layer controls
│  └────────────────────────────────────┘│
│  [⬇️ Drop to raw REPL]                 │  ← Escape hatch
└────────────────────────────────────────┘
```

---

## Key Benefits of Layered Architecture

### For Learners
- ✅ Start at comfortable abstraction level
- ✅ Peel back layers as skills grow
- ✅ Never lose access to core power
- ✅ Multiple learning styles supported

### For Teachers
- ✅ Choose appropriate layer for students
- ✅ Gradually reduce scaffolding
- ✅ Same tool from beginner to expert
- ✅ Can demonstrate at any layer

### For Developers
- ✅ Clean separation of concerns
- ✅ Layers are composable
- ✅ Core REPL stays simple
- ✅ Easy to add new wrappers

### For Platform
- ✅ Single codebase, multiple experiences
- ✅ Content reusable across layers
- ✅ Each layer optional
- ✅ Users choose their own path

**The REPL is the source of truth. Everything else is just a view.** 🎵🧅

---

## Content as References: Everything is Addressable

**Key principle**: Each layer references inner layers by ID/URL, not by copying content.

This creates a **composable content graph** where:
- Recipes can be used in multiple exercises
- Exercises can be used in multiple lessons
- Lessons can be remixed into new sequences
- Everything is a first-class, shareable entity

### Content Addressing System

**Every piece of content at every layer has its own unique, independently accessible URL:**

```
// Layer 0: REPL patterns (recipes)
jamhub://recipe/forestcoder/ambient-forest@v2.3

// Layer 1: Exercise wrappers
jamhub://exercise/alice/rhythm-identification-1

// Layer 2: Lesson sequences
jamhub://lesson/bob/beginner-rhythms-unit-3

// Layer 3: Jam sessions
jamhub://session/2025-01-20-ambient-collab

// Layer 4: Community collections
jamhub://collection/curator/best-ambient-2025
```

---

## Independent Linkability: Every Layer Stands Alone

**Critical principle**: Content at any layer can be accessed, shared, and used **completely independently** of parent containers.

### Direct Access to Exercises

**Exercises are NOT locked inside lessons:**

```typescript
// Access exercise directly (no lesson context needed)
jamhub.com/exercise/alice/rhythm-quiz-1

// This works even if the exercise is used in 5 different lessons!
```

**Example: Sharing a Single Exercise**

```
Teacher Alice: "Students, practice this exercise on rests"
Link: https://jamhub.com/exercise/alice/hear-the-rests

Student clicks → Goes directly to exercise
  ✓ Can practice it standalone
  ✓ No need to navigate through lesson
  ✓ Progress still tracked
  ✓ XP still earned
```

**Exercise can be:**
- Accessed directly via URL
- Shared on social media
- Embedded in external sites
- Used in multiple lessons simultaneously
- Practiced outside of any lesson context

---

### Direct Access to Lessons

**Lessons are NOT locked inside courses:**

```typescript
// Access lesson directly (no course/collection context needed)
jamhub.com/lesson/bob/intro-to-rests

// This works even if the lesson is part of 3 different curricula!
```

**Example: Sharing a Single Lesson**

```
Teacher Bob: "Here's a great lesson on Euclidean rhythms"
Link: https://jamhub.com/lesson/carol/euclidean-mastery

Anyone clicks → Goes directly to lesson
  ✓ Can complete it standalone
  ✓ No course enrollment needed
  ✓ Prerequisites shown but optional
  ✓ Unlocks tracked independently
```

**Lesson can be:**
- Accessed directly via URL
- Completed without being in a course
- Used in multiple skill trees
- Shared as standalone learning resource
- Embedded in blog posts/documentation

---

### Direct Access to Recipes

**Recipes are completely independent:**

```typescript
// Access recipe directly
jamhub.com/recipe/forestcoder/ambient-forest

// Works everywhere:
  ✓ Open in REPL directly
  ✓ View code immediately
  ✓ Play audio preview
  ✓ Fork and remix
  ✓ No exercise/lesson context required
```

**Example: Sharing a Recipe**

```
Musician: "Check out this pattern I made"
Link: https://jamhub.com/recipe/myname/techno-kick

Friend clicks →
  ✓ Sees code + audio
  ✓ Can play in REPL
  ✓ Can fork
  ✓ Can see what exercises use it (optional)
  ✓ Can see session history (optional)
```

---

### Deep Linking Within Containers

**Link to specific exercise within a lesson:**

```typescript
// Link directly to exercise #3 in a lesson
jamhub.com/lesson/intro-to-rests#exercise-3

// Or by exercise ID
jamhub.com/lesson/intro-to-rests?exercise=alice/hear-rests

// User lands directly on that exercise
// But can still navigate full lesson if desired
```

**Link to specific moment in jam session:**

```typescript
// Link to 2:30 in a session
jamhub.com/session/2025-ambient-collab?t=150

// Or to featured moment
jamhub.com/session/2025-ambient-collab#drums-added

// User sees session at that exact moment
```

---

### Multiple Contexts, Same Content

**Exercise used in 3 different lessons:**

```typescript
Exercise: jamhub://exercise/alice/identify-rests

Used in:
  ├─ lesson/bob/intro-to-rests (as exercise #2)
  ├─ lesson/carol/rhythm-review (as exercise #5)
  └─ lesson/dave/percussion-basics (as exercise #1)

Direct link: jamhub.com/exercise/alice/identify-rests
  → Standalone, works without any lesson
  → Shows "Used in 3 lessons" (optional info)
  → Can practice independently
```

**Lesson used in 2 skill trees:**

```typescript
Lesson: jamhub://lesson/bob/euclidean-rhythms

Used in:
  ├─ skill-tree/rhythm-fundamentals (Week 3)
  └─ skill-tree/advanced-patterns (Week 1)

Direct link: jamhub.com/lesson/bob/euclidean-rhythms
  → Standalone, works without skill tree
  → Shows skill tree context (optional)
  → Can complete independently
```

---

### Embedding Content

**Embed exercise in external site:**

```html
<!-- Blog post about rhythm -->
<iframe
  src="https://jamhub.com/embed/exercise/alice/rhythm-quiz-1"
  width="800"
  height="600"
></iframe>

<!-- Readers can practice right in the blog! -->
```

**Embed recipe:**

```html
<!-- Documentation about Strudel syntax -->
<jamhub-recipe
  src="jamhub://recipe/examples/basic-pattern@v1.0"
  mode="interactive"
></jamhub-recipe>

<!-- Shows code + audio player + "Try it" button -->
```

**Embed lesson:**

```html
<!-- Course platform embeds JamHub lesson -->
<iframe
  src="https://jamhub.com/embed/lesson/intro-to-chords"
  width="100%"
  height="800"
></iframe>

<!-- Students complete lesson without leaving course site -->
```

---

### URL Patterns & Resolution

**All content follows consistent URL pattern:**

```
https://jamhub.com/{type}/{creator}/{name}[@version][?params][#fragment]

Examples:
  jamhub.com/recipe/alice/kick-pattern
  jamhub.com/recipe/alice/kick-pattern@v2.3
  jamhub.com/exercise/bob/rhythm-quiz
  jamhub.com/exercise/bob/rhythm-quiz?hint=1
  jamhub.com/lesson/carol/intro-to-rests
  jamhub.com/lesson/carol/intro-to-rests#exercise-2
  jamhub.com/session/2025-collab?t=150
  jamhub.com/collection/best-of-2025
```

**Resolves to:**

```typescript
// Parse URL
const { type, creator, name, version, params, fragment } = parseURL(url);

// Fetch content
const content = await resolver.resolve(`jamhub://${type}/${creator}/${name}@${version}`);

// Render standalone
<ContentViewer
  content={content}
  startAt={fragment}  // Optional: Jump to specific part
  params={params}     // Optional: Hints, etc.
/>
```

---

### Sharing & Discovery

**Every content type has share buttons:**

```
┌──────────────────────────────────────────────────┐
│  Exercise: Identify Rests                        │
│  by alice                                        │
├──────────────────────────────────────────────────┤
│  [▶ Try Exercise]                                │
│                                                  │
│  Share:                                          │
│  🔗 https://jamhub.com/exercise/alice/hear-rests│
│  [Copy Link] [Tweet] [Email] [Embed]            │
│                                                  │
│  Used in:                                        │
│  → lesson/bob/intro-to-rests                    │
│  → lesson/carol/rhythm-review                   │
│  [View all uses (12)]                           │
└──────────────────────────────────────────────────┘
```

**Discover related content:**

```typescript
// API endpoint for content relationships
GET /api/exercise/alice/hear-rests/relationships

Response: {
  usedIn: [
    { type: "lesson", id: "bob/intro-to-rests" },
    { type: "lesson", id: "carol/rhythm-review" }
  ],
  references: [
    { type: "recipe", id: "alice/kick-with-rest" }
  ],
  similar: [
    { type: "exercise", id: "bob/rhythm-quiz" }
  ]
}
```

---

### Context is Optional, Not Required

**Viewing content shows context, but doesn't require it:**

```
┌──────────────────────────────────────────────────┐
│  Exercise: Hear the Rests (alice/hear-rests)    │
├──────────────────────────────────────────────────┤
│                                                  │
│  [Exercise UI here]                              │
│                                                  │
│  ────────────────────────────────────────────────│
│  📍 Context (optional):                          │
│  Currently in: No lesson (standalone practice)  │
│                                                  │
│  This exercise is used in:                      │
│  → lesson/bob/intro-to-rests (as #2)           │
│  → lesson/carol/rhythm-review (as #5)          │
│                                                  │
│  [Start lesson/bob/intro-to-rests] (optional)  │
└──────────────────────────────────────────────────┘
```

**vs. viewing within lesson:**

```
┌──────────────────────────────────────────────────┐
│  Lesson: Intro to Rests (bob/intro-to-rests)    │
│  Progress: Exercise 2/4                          │
├──────────────────────────────────────────────────┤
│                                                  │
│  Exercise: Hear the Rests                        │
│  [Exercise UI here]                              │
│                                                  │
│  ────────────────────────────────────────────────│
│  📍 Context:                                     │
│  In lesson: bob/intro-to-rests                  │
│                                                  │
│  [⬅ Previous] [Next ➡] [Jump to...]            │
│  [Practice standalone] (opens direct URL)        │
└──────────────────────────────────────────────────┘
```

---

### Progress Tracking: Context-Aware but Not Required

**Standalone practice:**

```typescript
// User completes exercise standalone
user.complete("jamhub://exercise/alice/hear-rests");

// Progress tracked:
{
  exerciseId: "alice/hear-rests",
  completed: true,
  xpEarned: 20,
  context: null,  // No lesson context
  timestamp: "2025-01-20T10:30:00Z"
}
```

**Within lesson:**

```typescript
// User completes same exercise in lesson
user.complete("jamhub://exercise/alice/hear-rests", {
  lessonContext: "bob/intro-to-rests",
  exerciseIndex: 2
});

// Progress tracked:
{
  exerciseId: "alice/hear-rests",
  completed: true,
  xpEarned: 20,
  context: {
    lessonId: "bob/intro-to-rests",
    exerciseIndex: 2,
    lessonProgress: "2/4"
  },
  timestamp: "2025-01-20T10:45:00Z"
}

// Also updates lesson progress:
lessonProgress["bob/intro-to-rests"] = {
  currentExercise: 2,
  completed: [0, 1, 2],
  totalExercises: 4
}
```

**Both count!**
- XP earned in both cases
- Completion tracked either way
- Can complete exercise once standalone, skip in lesson
- Or vice versa

---

### Search & Discovery Across All Layers

**Search finds content at every layer:**

```
User searches: "euclidean rhythm"

Results:
  Recipes (23):
    → recipe/alice/euclidean-kick (45 uses)
    → recipe/bob/poly-euclidean (12 uses)
    ...

  Exercises (12):
    → exercise/carol/identify-euclidean (in 3 lessons)
    → exercise/dave/build-euclidean (in 5 lessons)
    ...

  Lessons (5):
    → lesson/carol/euclidean-mastery (in 2 skill trees)
    → lesson/eve/advanced-rhythms (in 1 skill tree)
    ...

  Sessions (3):
    → session/2025-euclidean-exploration
    ...

  Collections (2):
    → collection/rhythm-patterns
    ...

Every result is directly linkable!
```

---

### API Access to Any Content

**RESTful API for all layers:**

```typescript
// Get any content by URL
GET /api/resolve?url=jamhub://exercise/alice/hear-rests

Response: {
  id: "exercise/alice/hear-rests",
  type: "multiple-choice",
  title: "Hear the Rests",
  // ... full exercise definition
  references: {
    correctAnswer: "jamhub://recipe/alice/kick-with-rest@v1.0",
    wrongAnswers: [...]
  },
  usedIn: [
    "jamhub://lesson/bob/intro-to-rests",
    "jamhub://lesson/carol/rhythm-review"
  ]
}

// Everything is addressable via API
GET /api/recipe/{creator}/{name}
GET /api/exercise/{creator}/{name}
GET /api/lesson/{creator}/{name}
GET /api/session/{id}
GET /api/collection/{creator}/{name}
```

---

### Command Line Access

**CLI can access any content:**

```bash
# Clone any content type
$ jamhub clone exercise/alice/hear-rests
✓ Cloned to: ./hear-rests/
  exercise.json
  metadata.json

# Play recipe directly
$ jamhub play recipe/alice/kick-with-rest
🔊 Playing...

# Start lesson directly
$ jamhub start lesson/bob/intro-to-rests
📖 Lesson: Introduction to Rests
   Exercise 1/4: Identify rest symbol
   [Start]

# Open session at specific time
$ jamhub replay session/2025-collab --time 2:30
🎬 Playing session at 2:30...
```

---

### Benefits of Independent Linkability

**For Learners:**
- ✅ Practice specific exercises repeatedly
- ✅ Share favorite content with friends
- ✅ Bookmark useful resources
- ✅ Learn in any order
- ✅ Skip unnecessary context

**For Teachers:**
- ✅ Share individual exercises as homework
- ✅ Link specific resources in lesson plans
- ✅ Embed in external course materials
- ✅ Reuse content across curricula
- ✅ Direct students to specific practice

**For Creators:**
- ✅ Content discoverable independently
- ✅ Credit maintained across contexts
- ✅ Can track usage everywhere
- ✅ Easier to collaborate
- ✅ Build reusable library

**For Platform:**
- ✅ Content graph = SEO gold
- ✅ Every URL is shareable
- ✅ Viral potential (share what works)
- ✅ Flexible learning paths
- ✅ No artificial containers

**"Everything has a URL. Everything is a first-class citizen."** 🔗✨

## Metadata & Audio: Rich Content at Every Layer

**Every layer supports:**
- ✅ Title and description (user-written)
- ✅ User-generated audio file (optional)
- ✅ Automatically generated audio (from code evaluation)
- ✅ Tags, categories, difficulty
- ✅ Custom metadata

### Audio File Guidelines

**Size Limits:**
- **Recipes**: 5 MB (auto-generated from code, ~30 seconds typical)
- **Exercises**: 10 MB (user can upload explanation/example, ~2 minutes)
- **Lessons**: 25 MB (intro/summary recording, ~5 minutes)
- **Sessions**: 100 MB (full jam recording, ~45 minutes)
- **Collections**: 10 MB (curated playlist preview, ~2 minutes)

**Supported Formats:**
- MP3 (preferred)
- WAV
- OGG
- FLAC (converted to MP3 on upload)

**Use Cases:**
- Explanations by instructor
- Example performances
- Audio walkthroughs
- Curated mixes
- Session recordings

---

### Layer 0: Recipe (REPL Pattern)

**The atomic unit**: A piece of Strudel code

```json
{
  "id": "recipe/forestcoder/ambient-forest",
  "version": "2.3",
  "type": "recipe",
  "code": "note('c2 eb2 g2').slow(8).room(0.9)",

  "metadata": {
    "title": "Ambient Forest",
    "description": "A slow evolving drone inspired by forest sounds. Uses room reverb for spaciousness.",
    "author": "forestcoder",
    "tags": ["ambient", "drone", "nature"],
    "bpm": 60,
    "key": "C minor",
    "difficulty": "intermediate"
  },

  "audio": {
    "generated": "https://cdn.jamhub.cc/recipes/ambient-forest-auto.mp3",
    "generated_at": "2025-01-20T10:00:00Z",
    "user_uploaded": null,
    "duration_seconds": 30
  }
}
```

**URL**: `jamhub://recipe/forestcoder/ambient-forest@v2.3`

**Audio options:**
- **Auto-generated**: Evaluates Strudel code → renders audio (always available)
- **User-uploaded**: Optional alternate version (e.g., live performance of the pattern)

**Example with user audio:**
```typescript
// Recipe with custom performance
{
  "audio": {
    "generated": "https://cdn.jamhub.cc/recipes/ambient-forest-auto.mp3",
    "user_uploaded": {
      "url": "https://cdn.jamhub.cc/recipes/ambient-forest-performance.mp3",
      "duration_seconds": 120,
      "description": "Extended live performance with improvisation",
      "uploaded_at": "2025-01-21T14:30:00Z"
    }
  }
}
```

This recipe can be:
- Played in REPL directly
- Referenced by exercises
- Referenced by lessons
- Forked and modified
- Used in jam rooms

---

### Layer 1: Exercise Wrapper

**References Layer 0 content**

```json
{
  "id": "exercise/rhythm-quiz-1",
  "type": "multiple-choice",
  "title": "Identify the Rhythm Pattern",
  "description": "Listen carefully to the rhythm and identify which Strudel code produces it. Pay attention to the placement of rests.",
  "created_by": "teacher-alice",

  "content": {
    "question": "Which code produces this rhythm?",
    "correct_answer": {
      "recipe_ref": "jamhub://recipe/beatmaker/basic-kick@v1.0",
      "display": "s(\"bd ~ sd ~\")"
    },
    "wrong_answers": [
      {
        "recipe_ref": "jamhub://recipe/beatmaker/kick-var-1@v1.0",
        "display": "s(\"bd sd bd sd\")"
      },
      {
        "recipe_ref": "jamhub://recipe/beatmaker/kick-var-2@v1.0",
        "display": "s(\"bd*4\")"
      },
      {
        "recipe_ref": "jamhub://recipe/beatmaker/kick-var-3@v1.0",
        "display": "s(\"bd sd [bd bd] sd\")"
      }
    ]
  },

  "settings": {
    "show_code": false,
    "allow_reveal": true,
    "play_limit": 3,
    "hints_available": 1
  },

  "audio": {
    "user_uploaded": {
      "url": "https://cdn.jamhub.cc/exercises/rhythm-quiz-1-intro.mp3",
      "duration_seconds": 45,
      "description": "Audio walkthrough explaining how to approach this exercise",
      "uploaded_at": "2025-01-20T10:00:00Z"
    }
  },

  "metadata": {
    "difficulty": "beginner",
    "estimated_time_seconds": 30,
    "tags": ["rhythm", "rests", "kick-drum"]
  }
}
```

**Exercise audio uses:**
- **User-uploaded**: Teacher's voice explanation
  - "In this exercise, you'll hear a drum pattern. Listen for where the rests are..."
- **Generated**: Auto-played from referenced recipes (correct + wrong answers)
- **Both**: Explanation plays first, then exercise begins

**Example UI with audio:**
```
┌────────────────────────────────────────────────────┐
│  Exercise: Identify the Rhythm Pattern            │
│  by teacher-alice                                  │
├────────────────────────────────────────────────────┤
│  📖 Description:                                   │
│  Listen carefully to the rhythm and identify which │
│  Strudel code produces it. Pay attention to rests.│
│                                                     │
│  🎧 Instructor Audio (optional):                   │
│  [▶ Listen to walkthrough] (0:45)                 │
│                                                     │
│  ────────────────────────────────────────────────  │
│  🔊 [Play Rhythm]                                  │
│                                                     │
│  Which code produces this rhythm?                  │
│  ○ A) s("bd sd bd sd")                             │
│  ○ B) s("bd ~ sd ~")                               │
│  ○ C) s("bd*4")                                    │
│                                                     │
│  [Submit Answer]                                   │
└────────────────────────────────────────────────────┘
```

**URL**: `jamhub://exercise/rhythm-quiz-1`

**Key insight**: Exercise doesn't contain the code, it **references recipes**!

```
Exercise "rhythm-quiz-1"
  ├─ references → recipe/beatmaker/basic-kick@v1.0
  ├─ references → recipe/beatmaker/kick-var-1@v1.0
  ├─ references → recipe/beatmaker/kick-var-2@v1.0
  └─ references → recipe/beatmaker/kick-var-3@v1.0
```

**Benefits:**
- Recipe updates automatically propagate
- Same recipe used in multiple exercises
- Can remix exercise with different recipes
- Exercise is separate from content

#### Other Layer 1 Exercise Types

**Fill-in-the-Blank Exercise:**
```json
{
  "id": "exercise/chord-completion-1",
  "type": "fill-in-blank",
  "title": "Complete the C Major Chord",

  "content": {
    "template": "note('[c, ____, ____]')",
    "correct_answer": {
      "recipe_ref": "jamhub://recipe/music-theory/c-major-chord@v1.0",
      "blanks": ["e", "g"]
    },
    "hints": [
      "A major chord uses notes 1, 3, and 5 of the scale",
      {
        "type": "audio",
        "recipe_ref": "jamhub://recipe/music-theory/c-major-scale@v1.0"
      }
    ]
  }
}
```

**Constrained Sandbox Exercise:**
```json
{
  "id": "exercise/create-4-beat-pattern",
  "type": "constrained-sandbox",
  "title": "Create a 4-Beat Pattern",

  "content": {
    "initial_code": "note('___')",
    "constraints": {
      "allowed_notes": ["c", "d", "e", "f", "g", "a", "b"],
      "required_beats": 4,
      "max_notes": 3,
      "forbidden_functions": ["slow", "fast", "room"]
    },
    "validation": {
      "check_beat_count": true,
      "check_note_count": true
    },
    "examples": [
      {
        "recipe_ref": "jamhub://recipe/examples/4-beat-simple@v1.0",
        "label": "Example solution"
      }
    ]
  }
}
```

**Hear-and-Reproduce Exercise:**
```json
{
  "id": "exercise/reproduce-melody-1",
  "type": "hear-and-reproduce",
  "title": "Listen and Recreate",

  "content": {
    "target": {
      "recipe_ref": "jamhub://recipe/melodies/simple-c-major@v1.0"
    },
    "validation": {
      "type": "audio-similarity",
      "threshold": 0.8,
      "check_notes": true,
      "check_rhythm": true
    },
    "starting_point": "note('')"
  }
}
```

---

### Layer 2: Lesson Sequence

**References Layer 1 exercises**

```json
{
  "id": "lesson/rests-and-silence",
  "type": "lesson",
  "title": "Lesson 3: Rests and Silence",
  "description": "Discover how silence shapes rhythm. Learn to identify, use, and create rhythmic patterns with rests. By the end, you'll understand that what you don't play is just as important as what you do play.",
  "created_by": "teacher-alice",

  "sequence": [
    {
      "exercise_ref": "jamhub://exercise/identify-rest-symbol",
      "xp_reward": 10
    },
    {
      "exercise_ref": "jamhub://exercise/hear-and-identify-rests",
      "xp_reward": 20
    },
    {
      "exercise_ref": "jamhub://exercise/fill-missing-rests",
      "xp_reward": 20
    },
    {
      "exercise_ref": "jamhub://exercise/create-rhythm-with-rests",
      "xp_reward": 30
    },
    {
      "type": "free-play",
      "recipe_ref": "jamhub://recipe/templates/empty-drum-canvas@v1.0",
      "prompt": "Create your own rhythm using at least 2 rests",
      "xp_reward": 50
    }
  ],

  "audio": {
    "user_uploaded": {
      "url": "https://cdn.jamhub.cc/lessons/rests-and-silence-intro.mp3",
      "duration_seconds": 180,
      "description": "Lesson introduction and overview by teacher-alice",
      "uploaded_at": "2025-01-20T09:00:00Z",
      "sections": [
        { "timestamp": 0, "label": "Introduction" },
        { "timestamp": 45, "label": "Why rests matter" },
        { "timestamp": 120, "label": "What you'll learn" }
      ]
    }
  },

  "prerequisites": [
    "jamhub://lesson/basic-note-patterns"
  ],

  "unlocks": [
    "jamhub://lesson/nested-sequences"
  ],

  "metadata": {
    "difficulty": "beginner",
    "estimated_time_minutes": 15,
    "skill_tree": "rhythm-fundamentals",
    "tags": ["rhythm", "rests", "percussion"]
  }
}
```

**Lesson audio uses:**
- **Introduction**: Teacher explains lesson goals and context
- **Summary**: Recap of key concepts learned
- **Tips**: Additional insights and advice
- **Examples**: Audio demonstrations of techniques

**Example UI with audio:**
```
┌────────────────────────────────────────────────────┐
│  Lesson 3: Rests and Silence                       │
│  by teacher-alice                                  │
├────────────────────────────────────────────────────┤
│  📖 Description:                                   │
│  Discover how silence shapes rhythm. Learn to      │
│  identify, use, and create rhythmic patterns with  │
│  rests...                                          │
│                                                     │
│  🎧 Lesson Introduction (3:00):                    │
│  [▶ Listen to introduction]                       │
│  Sections:                                         │
│    0:00 - Introduction                            │
│    0:45 - Why rests matter                        │
│    2:00 - What you'll learn                       │
│                                                     │
│  ────────────────────────────────────────────────  │
│  Progress: 0/5 exercises complete                  │
│                                                     │
│  Exercises:                                        │
│  1. ○ Identify rest symbol (10 XP)                │
│  2. ○ Hear and identify rests (20 XP)             │
│  3. ○ Fill missing rests (20 XP)                  │
│  4. ○ Create rhythm with rests (30 XP)            │
│  5. ○ Free play (50 XP)                           │
│                                                     │
│  [Start Lesson]                                    │
└────────────────────────────────────────────────────┘
```

**URL**: `jamhub://lesson/rests-and-silence`

**Structure:**
```
Lesson "rests-and-silence"
  ├─ references → exercise/identify-rest-symbol
  ├─ references → exercise/hear-and-identify-rests
  ├─ references → exercise/fill-missing-rests
  ├─ references → exercise/create-rhythm-with-rests
  └─ references → recipe/templates/empty-drum-canvas
```

**Benefits:**
- Exercises are reusable in multiple lessons
- Update exercise once, all lessons update
- Can remix lesson with different exercises
- Easy to create variants (hard mode, slow mode)

---

### Layer 3: Jam Session

**References recipes and creates session recording**

```json
{
  "id": "session/2025-01-20-ambient-collab",
  "type": "jam-session",
  "title": "Ambient Collaboration: Building Soundscapes Together",
  "description": "Three musicians explore ambient textures in real-time. Watch us build a layered soundscape from scratch, starting with a simple drone and evolving into a rich atmospheric piece. Great example of collaborative live coding.",
  "participants": [
    {
      "username": "forestcoder",
      "role": "Pads & Drones",
      "joined_at": 0
    },
    {
      "username": "beatmaker",
      "role": "Rhythm & Percussion",
      "joined_at": 120000
    },
    {
      "username": "harmonizer",
      "role": "Melody & Effects",
      "joined_at": 480000
    }
  ],

  "starting_point": {
    "recipe_ref": "jamhub://recipe/templates/empty-canvas@v1.0"
  },

  "final_output": {
    "recipe_ref": "jamhub://recipe/collaborative/ambient-forest-jam@v1.0"
  },

  "recording": {
    "events_file": ".jamhub/sessions/2025-01-20.json",
    "duration_ms": 2700000
  },

  "audio": {
    "session_recording": {
      "url": "https://cdn.jamhub.cc/sessions/2025-01-20-full.mp3",
      "duration_seconds": 2700,
      "description": "Full 45-minute jam session recording",
      "recorded_at": "2025-01-20T14:30:00Z",
      "format": "stereo_mix"
    },
    "user_commentary": {
      "url": "https://cdn.jamhub.cc/sessions/2025-01-20-commentary.mp3",
      "duration_seconds": 120,
      "description": "Post-jam reflection by forestcoder on the creative process",
      "uploaded_at": "2025-01-21T10:00:00Z"
    }
  },

  "metadata": {
    "is_public": true,
    "genre": ["ambient", "experimental", "collaborative"],
    "featured_moments": [
      {
        "timestamp": 15000,
        "title": "Initial chord established",
        "description": "forestcoder sets the tonal foundation",
        "snapshot_ref": "jamhub://recipe/snapshots/session-2025-01-20-t15000@v1.0"
      },
      {
        "timestamp": 130000,
        "title": "Drums enter",
        "description": "beatmaker introduces subtle euclidean rhythm",
        "snapshot_ref": "jamhub://recipe/snapshots/session-2025-01-20-t130000@v1.0"
      },
      {
        "timestamp": 480000,
        "title": "Melodic layer added",
        "description": "harmonizer adds ethereal melody on top",
        "snapshot_ref": "jamhub://recipe/snapshots/session-2025-01-20-t480000@v1.0"
      }
    ]
  }
}
```

**Session audio types:**
- **Session recording**: Auto-recorded full audio of the jam (always present)
- **User commentary**: Optional post-jam reflection/explanation
- **Tutorial overlay**: Optional instructional commentary for learning

**Example UI with audio:**
```
┌────────────────────────────────────────────────────┐
│  Session: Ambient Collaboration                    │
│  45 minutes • 3 participants • Jan 20, 2025        │
├────────────────────────────────────────────────────┤
│  📖 Description:                                   │
│  Three musicians explore ambient textures in       │
│  real-time. Watch us build a layered soundscape... │
│                                                     │
│  👥 Participants:                                  │
│  • forestcoder (Pads & Drones)                    │
│  • beatmaker (Rhythm & Percussion)                │
│  • harmonizer (Melody & Effects)                  │
│                                                     │
│  🎧 Audio:                                         │
│  [▶ Play full session] (45:00)                    │
│  [▶ Listen to commentary] (2:00)                  │
│    "Post-jam reflection on the creative process"  │
│                                                     │
│  ────────────────────────────────────────────────  │
│  Timeline:                                         │
│  ├────────●─────────●──────────────●──────────┤   │
│  0:00   0:15      2:10           8:00        45:00 │
│    │      │         │               │              │
│    │      │         │               └─ Melody      │
│    │      │         └───────────────── Drums       │
│    │      └─────────────────────────── Chord       │
│    └────────────────────────────────── Start       │
│                                                     │
│  [▶ Play from start] [View code timeline]         │
│  [Fork this session] [Download audio]             │
└────────────────────────────────────────────────────┘
```

**URL**: `jamhub://session/2025-01-20-ambient-collab`

**References:**
```
Session "2025-01-20-ambient-collab"
  ├─ references → recipe/templates/empty-canvas (starting point)
  ├─ produces → recipe/collaborative/ambient-forest-jam (output)
  └─ contains → recipe/snapshots/* (keyframes)
```

**Special feature**: Each keyframe in the session can be extracted as a standalone recipe!

---

### Layer 4: Community Collection

**References any combination of layers**

```json
{
  "id": "collection/best-ambient-2025",
  "type": "collection",
  "title": "Best Ambient Recipes of 2025",
  "description": "A curated collection of the finest ambient and drone patterns created in 2025. Features range from minimalist drones to complex layered soundscapes. Perfect for meditation, study, or inspiration. Includes recipes, lessons, and collaborative sessions showing various approaches to ambient music production.",
  "created_by": "curator-bob",

  "items": [
    {
      "item_ref": "jamhub://recipe/forestcoder/ambient-forest@v2.3",
      "note": "Classic drone, perfect for meditation",
      "order": 1
    },
    {
      "item_ref": "jamhub://recipe/droner/deep-space@v1.5",
      "note": "Amazing reverb technique - listen for the tail decay",
      "order": 2
    },
    {
      "item_ref": "jamhub://session/2025-01-20-ambient-collab",
      "note": "Watch how this was built collaboratively in real-time",
      "order": 3
    },
    {
      "item_ref": "jamhub://lesson/advanced-ambient-techniques",
      "note": "Learn the techniques used in these recipes",
      "order": 4
    }
  ],

  "audio": {
    "user_uploaded": {
      "url": "https://cdn.jamhub.cc/collections/best-ambient-2025-mix.mp3",
      "duration_seconds": 600,
      "description": "10-minute curated mix showcasing highlights from this collection",
      "uploaded_at": "2025-01-25T16:00:00Z",
      "tracklist": [
        { "timestamp": 0, "title": "Ambient Forest intro", "item_ref": "jamhub://recipe/forestcoder/ambient-forest@v2.3" },
        { "timestamp": 120, "title": "Deep Space excerpt", "item_ref": "jamhub://recipe/droner/deep-space@v1.5" },
        { "timestamp": 300, "title": "Collab session highlight", "item_ref": "jamhub://session/2025-01-20-ambient-collab" }
      ]
    }
  },

  "metadata": {
    "tags": ["ambient", "drone", "2025", "curated"],
    "visibility": "public",
    "curated": true,
    "category": "music-styles",
    "item_count": 4,
    "total_duration_seconds": 3600
  }
}
```

**Collection audio uses:**
- **Curated mix**: DJ-style mix highlighting the collection's content
- **Introduction**: Curator explains their selection criteria and highlights
- **Audio tour**: Guided walkthrough of the collection with commentary
- **Playlist**: Continuous playback of all items in sequence

**Example UI with audio:**
```
┌────────────────────────────────────────────────────┐
│  Collection: Best Ambient Recipes of 2025          │
│  by curator-bob • 4 items • Updated Jan 25, 2025   │
├────────────────────────────────────────────────────┤
│  📖 Description:                                   │
│  A curated collection of the finest ambient and    │
│  drone patterns created in 2025. Features range... │
│                                                     │
│  🎧 Curator's Mix (10:00):                         │
│  [▶ Play curated mix]                             │
│  A 10-minute showcase of highlights from this     │
│  collection with smooth transitions.               │
│                                                     │
│  Tracklist:                                        │
│    0:00 - Ambient Forest intro                    │
│    2:00 - Deep Space excerpt                      │
│    5:00 - Collab session highlight                │
│                                                     │
│  ────────────────────────────────────────────────  │
│  Items in this collection:                         │
│                                                     │
│  1. 🎵 Recipe: Ambient Forest                     │
│     by forestcoder                                 │
│     "Classic drone, perfect for meditation"       │
│     [▶ Play] [View] [Fork]                        │
│                                                     │
│  2. 🎵 Recipe: Deep Space                         │
│     by droner                                      │
│     "Amazing reverb technique..."                 │
│     [▶ Play] [View] [Fork]                        │
│                                                     │
│  3. 🎬 Session: Ambient Collaboration             │
│     "Watch how this was built..."                 │
│     [▶ Play] [View Timeline]                      │
│                                                     │
│  4. 📚 Lesson: Advanced Ambient Techniques        │
│     "Learn the techniques..."                     │
│     [Start Lesson]                                 │
│                                                     │
│  [Play All] [Subscribe] [Fork Collection]         │
└────────────────────────────────────────────────────┘
```

**URL**: `jamhub://collection/best-ambient-2025`

**Can reference:**
- Recipes (Layer 0)
- Exercises (Layer 1)
- Lessons (Layer 2)
- Sessions (Layer 3)
- Other collections (Layer 4)

---

## User-Created Content at Every Layer

### Creating Recipes (Layer 0)

**Everyone can create**:

```typescript
// In REPL, create pattern
note('c2 eb2 g2').slow(8).room(0.9)

// Click "Publish"
// → Creates: jamhub://recipe/yourname/my-ambient-pad@v1.0
```

---

### Creating Exercises (Layer 1)

**Teachers and advanced users can create exercises programmatically**:

#### Option A: Code-First Approach (Recommended for Coders)

**Write exercise as code:**

```typescript
// exercise/rhythm-quiz-1.ts
import { MultipleChoiceExercise, Recipe } from '@jamhub/builder';

// Define recipes inline or reference existing ones
const correctAnswer = new Recipe({
  code: 's("bd ~ sd ~")',
  title: "Kick with Rests"
});

const wrongAnswers = [
  new Recipe({ code: 's("bd sd bd sd")' }),
  new Recipe({ code: 's("bd*4")' }),
  new Recipe({ code: 's("bd sd [bd bd] sd")' })
];

export default new MultipleChoiceExercise({
  title: "Identify the Rhythm Pattern",
  question: "Which code produces this rhythm?",

  correctAnswer,
  wrongAnswers,

  settings: {
    showCode: false,
    allowReveal: true,
    playLimit: 3,
    hints: ["Listen for the rests"]
  },

  metadata: {
    difficulty: "beginner",
    tags: ["rhythm", "rests", "kick-drum"]
  }
});
```

**Publish:**
```bash
$ jamhub publish exercise/rhythm-quiz-1.ts
✓ Created recipes:
  - jamhub://recipe/yourname/kick-with-rests@v1.0
  - jamhub://recipe/yourname/kick-var-1@v1.0
  - jamhub://recipe/yourname/kick-var-2@v1.0
  - jamhub://recipe/yourname/kick-var-3@v1.0
✓ Published exercise:
  - jamhub://exercise/yourname/rhythm-quiz-1@v1.0
```

**Key insight**: Code is published as recipes automatically, exercise references them!

#### Option B: Programmatic Generation

**Generate variations algorithmically:**

```typescript
// exercise/euclidean-patterns.ts
import { MultipleChoiceExercise, Recipe } from '@jamhub/builder';

// Generate euclidean rhythm variations
function generateEuclideanVariations(pulses: number, steps: number) {
  const variations = [
    { pulses, steps, rotate: 0 },
    { pulses: pulses + 1, steps, rotate: 0 },
    { pulses, steps: steps + 1, rotate: 0 },
    { pulses, steps, rotate: 1 }
  ];

  return variations.map((v, i) =>
    new Recipe({
      code: `s("bd(${v.pulses},${v.steps},${v.rotate})")`,
      title: `Euclidean ${v.pulses},${v.steps},${v.rotate}`,
      metadata: { generated: true, index: i }
    })
  );
}

// Generate 10 exercises programmatically
export function generateExerciseSeries() {
  const exercises = [];

  for (let i = 0; i < 10; i++) {
    const pulses = 3 + i;
    const steps = 8;

    const [correct, ...wrong] = generateEuclideanVariations(pulses, steps);

    exercises.push(new MultipleChoiceExercise({
      title: `Euclidean Pattern ${i + 1}`,
      question: `Which pattern has ${pulses} pulses in ${steps} steps?`,
      correctAnswer: correct,
      wrongAnswers: wrong.slice(0, 3),
      metadata: { difficulty: i < 5 ? "beginner" : "intermediate" }
    }));
  }

  return exercises;
}

export default generateExerciseSeries();
```

**Publish:**
```bash
$ jamhub publish exercise/euclidean-patterns.ts
✓ Generated 10 exercises
✓ Created 40 recipe variations
✓ Published exercise series: euclidean-patterns-1 through euclidean-patterns-10
```

#### Option C: Template-Based with Code

**Use templates but write code directly:**

```typescript
// exercise/chord-identification.ts
import { MultipleChoiceExercise } from '@jamhub/builder';

const chordExercise = MultipleChoiceExercise.fromTemplate({
  type: "hear-and-identify",

  // Write Strudel code directly
  correctAnswer: {
    code: `note("[c,e,g]")`,  // C major chord
    label: "C major"
  },

  wrongAnswers: [
    { code: `note("[c,e,g#]")`, label: "C augmented" },
    { code: `note("[c,eb,g]")`, label: "C minor" },
    { code: `note("[c,e,g,b]")`, label: "C major 7" }
  ],

  question: "Which chord is this?",

  // Generate explanation programmatically
  explanation: (answer) => {
    const intervals = analyzeIntervals(answer.code);
    return `This is a ${answer.label} because: ${intervals.join(", ")}`;
  },

  validation: {
    checkPitches: true,
    checkTiming: false,
    similarity: 0.9
  }
});

export default chordExercise;
```

#### Option D: Constraint-Based Generation

**Define rules, generate content:**

```typescript
// exercise/scale-practice.ts
import { ConstrainedSandboxExercise, ScaleTheory } from '@jamhub/builder';

const scaleExercise = new ConstrainedSandboxExercise({
  title: "Build a C Major Scale",

  // Define constraints programmatically
  constraints: {
    allowedNotes: ScaleTheory.notes("C", "major"),  // ["c", "d", "e", "f", "g", "a", "b"]
    requiredNotes: 8,
    pattern: /^note\("[\w\s]+"\)$/,
    forbiddenFunctions: ["slow", "fast", "stack"]
  },

  // Validation function
  validate: (userCode) => {
    const output = evaluate(userCode);
    const notes = extractNotes(output);
    const scale = ScaleTheory.notes("C", "major");

    return {
      valid: notes.every(n => scale.includes(n)) && notes.length === 8,
      feedback: notes.length !== 8
        ? `You have ${notes.length} notes, need 8`
        : "Check that all notes are in C major scale"
    };
  },

  // Provide examples
  examples: [
    { code: `note("c d e f g a b c2")`, label: "Ascending scale" },
    { code: `note("c2 b a g f e d c")`, label: "Descending scale" }
  ],

  hints: [
    "Start with note('...')",
    () => `C major scale notes are: ${ScaleTheory.notes("C", "major").join(" ")}`,
    "Remember to include the octave (c2) at the end"
  ]
});

export default scaleExercise;
```

#### Option E: Visual UI for Non-Coders

**For those who prefer GUI:**

```
┌────────────────────────────────────────────────────┐
│  Create Exercise (Visual Mode)                     │
├────────────────────────────────────────────────────┤
│  Type: [Multiple Choice ▼]                        │
│                                                     │
│  Question: Which code produces this rhythm?        │
│                                                     │
│  Correct Answer:                                   │
│  ┌────────────────────────────────────┐            │
│  │ ┌─── REPL ────────────────┐       │            │
│  │ │ s("bd ~ sd ~")           │  [▶]  │            │
│  │ └──────────────────────────┘       │            │
│  │ [Search recipes...] or write code  │            │
│  └────────────────────────────────────┘            │
│                                                     │
│  Wrong Answers:                                    │
│  ┌────────────────────────────────────┐            │
│  │ ┌─── REPL ────────────────┐       │            │
│  │ │ s("bd sd bd sd")         │  [▶]  │            │
│  │ └──────────────────────────┘       │            │
│  └────────────────────────────────────┘            │
│  [+ Add wrong answer]                              │
│                                                     │
│  [💻 Switch to Code Mode]                          │
└────────────────────────────────────────────────────┘
```

**Both modes produce same output:**
- Visual mode → Generates TypeScript/JSON
- Code mode → Write TypeScript directly
- Can switch between modes

---

#### Exercise Builder API

**Full programmatic control:**

```typescript
import {
  MultipleChoiceExercise,
  FillInBlankExercise,
  ConstrainedSandboxExercise,
  HearAndReproduceExercise,
  Recipe
} from '@jamhub/builder';

// Create recipe on the fly
const myPattern = new Recipe({
  code: 'note("c e g").slow(2)',
  metadata: { key: "C major" }
});

// Or reference existing
const existingPattern = Recipe.fromRef(
  "jamhub://recipe/beatmaker/techno-kick@v1.0"
);

// Compose exercises
const ex1 = new MultipleChoiceExercise({ /* ... */ });
const ex2 = new FillInBlankExercise({ /* ... */ });
const ex3 = new ConstrainedSandboxExercise({ /* ... */ });

// Publish all at once
await jamhub.publish([ex1, ex2, ex3], {
  namespace: "yourname",
  visibility: "public"
});
```

---

#### Testing Exercises Before Publishing

**Run locally:**

```typescript
// exercise/rhythm-quiz-1.test.ts
import { test, render } from '@jamhub/testing';
import exercise from './rhythm-quiz-1';

test('exercise renders correctly', async () => {
  const { getByText, getAllByRole } = await render(exercise);

  expect(getByText("Which code produces this rhythm?")).toBeInTheDocument();
  expect(getAllByRole('button')).toHaveLength(4); // 4 choices
});

test('correct answer plays expected sound', async () => {
  const audio = await exercise.correctAnswer.evaluate();

  expect(audio.events).toHaveLength(4); // 4 beats
  expect(audio.events[1].type).toBe('rest'); // Second is rest
});

test('wrong answers are distinct', async () => {
  const outputs = await Promise.all(
    exercise.wrongAnswers.map(a => a.evaluate())
  );

  // Each wrong answer should sound different
  outputs.forEach((out, i) => {
    expect(out).not.toEqual(exercise.correctAnswer.evaluate());
  });
});
```

**Run tests:**
```bash
$ jamhub test exercise/rhythm-quiz-1.test.ts
✓ exercise renders correctly
✓ correct answer plays expected sound
✓ wrong answers are distinct

$ jamhub preview exercise/rhythm-quiz-1.ts
🌐 Preview at http://localhost:3000
```

---

#### Advanced: Exercise Builders as Functions

**Higher-order exercises:**

```typescript
// lib/exercise-builders.ts

// Factory function for creating scale exercises
export function createScaleExercise(
  key: string,
  mode: "major" | "minor"
) {
  const notes = ScaleTheory.notes(key, mode);

  return new MultipleChoiceExercise({
    title: `Identify ${key} ${mode} Scale`,
    question: "Which scale is this?",
    correctAnswer: new Recipe({
      code: `note("${notes.join(" ")}")`,
      title: `${key} ${mode}`
    }),
    wrongAnswers: generateWrongScales(key, mode, 3),
    metadata: { key, mode }
  });
}

// Generate exercise series for all keys
export function createScaleExerciseSeries() {
  const keys = ["C", "D", "E", "F", "G", "A", "B"];
  const modes = ["major", "minor"];

  return keys.flatMap(key =>
    modes.map(mode => createScaleExercise(key, mode))
  );
}

// Create chord identification exercises
export function createChordExercise(root: string, quality: ChordQuality) {
  const chord = ChordTheory.buildChord(root, quality);

  return new MultipleChoiceExercise({
    title: `Identify ${root} ${quality}`,
    correctAnswer: new Recipe({
      code: `note("[${chord.notes.join(",")}]")`,
      title: `${root} ${quality}`
    }),
    wrongAnswers: generateSimilarChords(root, quality, 3)
  });
}

// Usage
const allScaleExercises = createScaleExerciseSeries();
const cMajorExercise = createScaleExercise("C", "major");
const cMinor7Exercise = createChordExercise("C", "minor7");
```

**Publish series:**
```bash
$ jamhub publish lib/scale-exercises.ts --series
✓ Generated 14 scale exercises (7 keys × 2 modes)
✓ Created 56 recipes (14 × 4 options)
✓ Published series: scale-exercises/c-major through scale-exercises/b-minor
```

---

#### DSL for Exercise Creation

**Domain-specific language for common patterns:**

```typescript
// exercise/rhythm-series.jamhub
import { ExerciseDSL } from '@jamhub/builder';

// Use fluent API
const exercise = ExerciseDSL
  .multipleChoice()
  .title("Identify the Rhythm")
  .playSound('s("bd ~ sd ~")')
  .correctAnswer({ code: 's("bd ~ sd ~")', label: "Kick and snare with rests" })
  .wrongAnswer({ code: 's("bd sd bd sd")', label: "Straight kick and snare" })
  .wrongAnswer({ code: 's("bd*4")', label: "Four kicks" })
  .wrongAnswer({ code: 's("~ bd sd ~")', label: "Different rest placement" })
  .showCodeInitially(false)
  .allowReveal(true)
  .playLimit(3)
  .difficulty("beginner")
  .tags("rhythm", "rests", "drums")
  .build();

export default exercise;
```

**Even more concise YAML/JSON:**

```yaml
# exercise/rhythm-quiz.yaml
type: multiple-choice
title: "Identify the Rhythm"

audio: 's("bd ~ sd ~")'

options:
  - code: 's("bd ~ sd ~")'
    correct: true
    label: "Kick and snare with rests"

  - code: 's("bd sd bd sd")'
    label: "Straight kick and snare"

  - code: 's("bd*4")'
    label: "Four kicks"

  - code: 's("~ bd sd ~")'
    label: "Different rest placement"

settings:
  showCode: false
  allowReveal: true
  playLimit: 3

metadata:
  difficulty: beginner
  tags: [rhythm, rests, drums]
```

**Publish YAML:**
```bash
$ jamhub publish exercise/rhythm-quiz.yaml
✓ Validated YAML structure
✓ Created 4 recipes from code blocks
✓ Published: jamhub://exercise/yourname/rhythm-quiz@v1.0
```

---

### Creating Lessons (Layer 2)

**Teachers create lessons programmatically:**

#### Option A: Code-First Lesson

**Write lesson as code:**

```typescript
// lesson/intro-to-rests.ts
import { Lesson, Exercise, Recipe } from '@jamhub/builder';

export default new Lesson({
  title: "Introduction to Rests",
  description: "Learn how silence creates rhythm",

  sequence: [
    // Reference existing exercises
    Exercise.fromRef("jamhub://exercise/alice/identify-rest-symbol", {
      xp: 10
    }),

    Exercise.fromRef("jamhub://exercise/bob/hear-rests", {
      xp: 20
    }),

    // Create exercise inline
    new MultipleChoiceExercise({
      title: "Fill Missing Rests",
      correctAnswer: new Recipe({ code: 's("bd ~ sd ~")' }),
      wrongAnswers: [
        new Recipe({ code: 's("bd sd sd ~")' }),
        new Recipe({ code: 's("bd ~ ~ sd")' })
      ],
      xp: 20
    }),

    // Free play section
    {
      type: "free-play",
      recipe: Recipe.fromRef("jamhub://recipe/templates/drum-canvas@v1.0"),
      prompt: "Create your own rhythm using at least 2 rests",
      validation: (code) => {
        const restCount = (code.match(/~/g) || []).length;
        return {
          valid: restCount >= 2,
          feedback: restCount < 2 ? "Add more rests!" : "Great job!"
        };
      },
      xp: 50
    }
  ],

  prerequisites: [
    "jamhub://lesson/basic-note-patterns"
  ],

  unlocks: [
    "jamhub://lesson/nested-sequences"
  ],

  metadata: {
    difficulty: "beginner",
    estimatedTime: 15,
    skillTree: "rhythm-fundamentals",
    tags: ["rhythm", "rests", "percussion"]
  }
});
```

**Publish:**
```bash
$ jamhub publish lesson/intro-to-rests.ts
✓ Referenced 2 existing exercises
✓ Created 1 inline exercise with 3 recipes
✓ Published: jamhub://lesson/yourname/intro-to-rests@v1.0
```

---

#### Option B: Programmatic Lesson Generation

**Generate entire curriculum:**

```typescript
// curriculum/scale-mastery.ts
import { Lesson, generateScaleExercise } from '@jamhub/builder';

// Generate lessons for all major scales
export function generateScaleCurriculum() {
  const keys = ["C", "D", "E", "F", "G", "A", "B"];

  return keys.map((key, index) => {
    return new Lesson({
      title: `Master ${key} Major Scale`,
      description: `Learn to identify and play the ${key} major scale`,

      sequence: [
        // Hear and identify
        generateScaleExercise(key, "major", "hear-identify"),

        // Build the scale
        generateScaleExercise(key, "major", "construct"),

        // Practice in context
        generateScaleExercise(key, "major", "improvise"),

        // Free play
        {
          type: "free-play",
          prompt: `Compose a melody using only notes from ${key} major`,
          constraints: {
            allowedNotes: ScaleTheory.notes(key, "major")
          }
        }
      ],

      prerequisites: index > 0 ? [`lesson/scale-${keys[index - 1].toLowerCase()}-major`] : [],
      unlocks: index < keys.length - 1 ? [`lesson/scale-${keys[index + 1].toLowerCase()}-major`] : [],

      metadata: {
        difficulty: "intermediate",
        estimatedTime: 20,
        skillTree: "scale-mastery"
      }
    });
  });
}

export default generateScaleCurriculum();
```

**Publish:**
```bash
$ jamhub publish curriculum/scale-mastery.ts --series
✓ Generated 7 lessons (one for each key)
✓ Created 84 exercises (7 lessons × 12 exercises)
✓ Created 336 recipes (84 exercises × 4 options)
✓ Published series: lesson/scale-c-major through lesson/scale-b-major
```

---

#### Option C: DSL for Lesson Sequences

**Fluent API:**

```typescript
// lesson/rhythm-fundamentals.ts
import { LessonDSL } from '@jamhub/builder';

const lesson = LessonDSL
  .create("Rhythm Fundamentals")
  .description("Master the basics of rhythm notation")

  // Reference existing content
  .addExercise("alice/identify-notes", { xp: 10 })
  .addExercise("bob/rhythm-quiz", { xp: 20 })

  // Create inline
  .addMultipleChoice({
    question: "Which has rests?",
    options: [
      { code: 's("bd ~ sd ~")', correct: true },
      { code: 's("bd sd bd sd")' }
    ],
    xp: 30
  })

  // Free play
  .addFreePlay({
    prompt: "Create a 4-beat rhythm",
    constraints: { beats: 4 },
    xp: 50
  })

  // Chain prerequisites
  .requires("lesson/basic-patterns")
  .unlocks("lesson/advanced-rhythms")

  .difficulty("beginner")
  .estimatedTime(15)
  .tags("rhythm", "fundamentals")

  .build();

export default lesson;
```

---

#### Option D: YAML Curriculum

**Declarative lesson definition:**

```yaml
# lesson/intro-to-rests.yaml
title: "Introduction to Rests"
description: "Learn how silence creates rhythm"

sequence:
  # Reference existing exercises
  - exercise: jamhub://exercise/alice/identify-rest-symbol
    xp: 10

  - exercise: jamhub://exercise/bob/hear-rests
    xp: 20

  # Inline exercise definition
  - type: multiple-choice
    title: "Fill Missing Rests"
    options:
      - code: 's("bd ~ sd ~")'
        correct: true
      - code: 's("bd sd sd ~")'
      - code: 's("bd ~ ~ sd")'
    xp: 20

  # Free play section
  - type: free-play
    recipe: jamhub://recipe/templates/drum-canvas@v1.0
    prompt: "Create rhythm with at least 2 rests"
    validation:
      min_rests: 2
    xp: 50

prerequisites:
  - jamhub://lesson/basic-note-patterns

unlocks:
  - jamhub://lesson/nested-sequences

metadata:
  difficulty: beginner
  estimated_time: 15
  skill_tree: rhythm-fundamentals
  tags: [rhythm, rests, percussion]
```

**Publish:**
```bash
$ jamhub publish lesson/intro-to-rests.yaml
✓ Parsed YAML structure
✓ Referenced 2 existing exercises
✓ Created 1 inline exercise
✓ Published: jamhub://lesson/yourname/intro-to-rests@v1.0
```

---

#### Option E: Skill Tree Builder

**Define entire learning paths:**

```typescript
// curriculum/rhythm-tree.ts
import { SkillTree, Lesson } from '@jamhub/builder';

const rhythmTree = new SkillTree({
  id: "rhythm-fundamentals",
  title: "Rhythm Fundamentals",

  structure: {
    // Root nodes (no prerequisites)
    roots: [
      new Lesson({ title: "First Sounds", /* ... */ }),
      new Lesson({ title: "Note Basics", /* ... */ })
    ],

    // Define dependencies
    nodes: [
      {
        lesson: new Lesson({ title: "Simple Patterns", /* ... */ }),
        requires: ["First Sounds", "Note Basics"]
      },
      {
        lesson: new Lesson({ title: "Rests", /* ... */ }),
        requires: ["Simple Patterns"]
      },
      {
        lesson: new Lesson({ title: "Nested Patterns", /* ... */ }),
        requires: ["Rests"]
      },
      {
        lesson: new Lesson({ title: "Euclidean Rhythms", /* ... */ }),
        requires: ["Nested Patterns"]
      }
    ],

    // Final nodes
    mastery: [
      {
        lesson: new Lesson({ title: "Rhythm Mastery", /* ... */ }),
        requires: ["Euclidean Rhythms", "Polyrhythms"]
      }
    ]
  }
});

export default rhythmTree;
```

**Visualize:**
```bash
$ jamhub visualize curriculum/rhythm-tree.ts

Rhythm Fundamentals Skill Tree:

                    First Sounds
                         │
                         ▼
                  Simple Patterns ◄─── Note Basics
                         │
                         ▼
                       Rests
                         │
                         ▼
                  Nested Patterns
                         │
                         ▼
                Euclidean Rhythms
                         │
                         ▼
                  Rhythm Mastery

$ jamhub publish curriculum/rhythm-tree.ts
✓ Published 8 lessons
✓ Published skill tree: jamhub://skill-tree/rhythm-fundamentals@v1.0
```

---

#### Testing Lessons

```typescript
// lesson/intro-to-rests.test.ts
import { test, render, simulate } from '@jamhub/testing';
import lesson from './intro-to-rests';

test('lesson has correct sequence', () => {
  expect(lesson.sequence).toHaveLength(4);
  expect(lesson.sequence[0].type).toBe('exercise');
  expect(lesson.sequence[3].type).toBe('free-play');
});

test('lesson progression works', async () => {
  const session = await lesson.createSession();

  // Complete first exercise
  await session.completeExercise(0, { correct: true });
  expect(session.currentIndex).toBe(1);
  expect(session.xpEarned).toBe(10);

  // Complete all exercises
  for (let i = 1; i < lesson.sequence.length; i++) {
    await session.completeExercise(i, { correct: true });
  }

  expect(session.isComplete).toBe(true);
  expect(session.xpEarned).toBe(100);
  expect(session.unlockedLessons).toContain("jamhub://lesson/nested-sequences");
});

test('free play validation works', async () => {
  const freePlay = lesson.sequence[3];
  const userCode = 's("bd ~ sd ~")';

  const result = await freePlay.validation(userCode);

  expect(result.valid).toBe(true);
  expect(result.feedback).toContain("Great job");
});
```

---

#### Lesson Analytics

**Track effectiveness programmatically:**

```typescript
// analytics/lesson-effectiveness.ts
import { Analytics } from '@jamhub/analytics';

const lesson = Lesson.fromRef("jamhub://lesson/intro-to-rests");

// Get lesson statistics
const stats = await Analytics.getLessonStats(lesson.id);

console.log({
  completions: stats.completions,
  averageTime: stats.averageTime,
  dropoffRate: stats.dropoffRate,
  exerciseSuccessRates: stats.exercises.map(e => ({
    title: e.title,
    successRate: e.successRate,
    averageAttempts: e.averageAttempts
  }))
});

// Identify problem exercises
const problemExercises = stats.exercises.filter(e =>
  e.successRate < 0.5 || e.averageAttempts > 3
);

if (problemExercises.length > 0) {
  console.log("⚠️ These exercises may be too difficult:");
  problemExercises.forEach(e => {
    console.log(`  - ${e.title} (${e.successRate * 100}% success)`);
  });
}
```

**Output:**
```bash
$ node analytics/lesson-effectiveness.ts

Lesson: Introduction to Rests
✓ 1,234 completions
✓ Average time: 12.3 minutes
✓ Dropoff rate: 15%

Exercise Success Rates:
  ✓ Identify rest symbol: 95% (1.2 avg attempts)
  ✓ Hear rests: 87% (1.5 avg attempts)
  ⚠️ Fill missing rests: 45% (3.8 avg attempts)
  ✓ Free play: 92% (1.1 avg attempts)

⚠️ These exercises may be too difficult:
  - Fill missing rests (45% success)

Recommendation: Add hints or simplify "Fill missing rests"
```

---

### Creating Collections (Layer 4)

**Anyone can curate**:

```
┌────────────────────────────────────────────────────┐
│  Create Collection                                 │
├────────────────────────────────────────────────────┤
│  Title: My Favorite Techno Patterns                │
│                                                     │
│  Items:                                            │
│  ┌────────────────────────────────────────────────┐│
│  │ [Recipe] beatmaker/techno-template             ││
│  │ Note: "Great starting point"                   ││
│  │ [↑] [↓] [Remove]                               ││
│  ├────────────────────────────────────────────────┤│
│  │ [Session] 2025-techno-jam                      ││
│  │ Note: "Watch how we built this"               ││
│  │ [↑] [↓] [Remove]                               ││
│  ├────────────────────────────────────────────────┤│
│  │ [Lesson] advanced-techno-techniques            ││
│  │ Note: "Learn these skills"                     ││
│  │ [↑] [↓] [Remove]                               ││
│  └────────────────────────────────────────────────┘│
│                                                     │
│  [+ Add Recipe] [+ Add Exercise] [+ Add Lesson]    │
│  [+ Add Session] [+ Add Collection]                │
│                                                     │
│  [Create Collection]                               │
└────────────────────────────────────────────────────┘
```

**Result**: `jamhub://collection/yourname/favorite-techno`

---

## Content Graph & Relationships

**Everything forms a directed graph:**

```
recipe/ambient-forest
  ↑ referenced by
  ├── exercise/identify-ambient-patterns
  │     ↑ referenced by
  │     ├── lesson/ambient-basics
  │     └── lesson/advanced-ambient
  │
  ├── session/2025-ambient-collab (as starting point)
  │     ↑ featured in
  │     └── collection/best-jams-2025
  │
  └── collection/ambient-essentials

Multiple layers can reference the same content!
```

**Query examples:**

```typescript
// Find all exercises using this recipe
GET /api/recipes/ambient-forest/used-by?type=exercise

// Find all lessons teaching ambient techniques
GET /api/search?q=ambient&type=lesson

// Get full dependency graph
GET /api/recipes/ambient-forest/graph
Response: {
  node: { id: "recipe/ambient-forest", ... },
  referencedBy: [
    { type: "exercise", id: "..." },
    { type: "session", id: "..." },
    { type: "collection", id: "..." }
  ]
}
```

---

## Remixing at Every Layer

**Because everything is a reference, everything can be remixed:**

### Remix a Recipe (Layer 0)
```
Fork: recipe/ambient-forest@v2.3
  → Your version: recipe/yourname/ambient-forest-remix@v1.0
```

### Remix an Exercise (Layer 1)
```
Fork: exercise/rhythm-quiz-1
  → Swap out recipes with harder patterns
  → Save as: exercise/yourname/rhythm-quiz-hard@v1.0
```

### Remix a Lesson (Layer 2)
```
Fork: lesson/rests-and-silence
  → Reorder exercises
  → Add your own exercises
  → Save as: lesson/yourname/rests-for-advanced@v1.0
```

### Remix a Collection (Layer 4)
```
Fork: collection/best-ambient-2025
  → Add your favorite recipes
  → Save as: collection/yourname/my-ambient-favorites@v1.0
```

---

## Content Versioning & Updates

**Semantic versioning for all content:**

```
recipe/ambient-forest@v1.0 (original)
  ↓ minor update (added reverb)
recipe/ambient-forest@v1.1
  ↓ major rewrite (changed key)
recipe/ambient-forest@v2.0
  ↓ patch (fixed typo)
recipe/ambient-forest@v2.1
```

**How references handle updates:**

```json
{
  "exercise_ref": "jamhub://recipe/ambient-forest@v2.1",  // Pin to specific version
  "exercise_ref": "jamhub://recipe/ambient-forest@v2",    // Pin to major version
  "exercise_ref": "jamhub://recipe/ambient-forest@latest" // Always use latest
}
```

**Creator chooses update strategy:**
- Pin to exact version (stable, won't break)
- Pin to major version (get patches/minors)
- Use latest (always current, may break)

---

## Example: Community-Created Learning Path

**User "teacher-alice" creates:**

1. **Creates recipes** (Layer 0)
   ```
   recipe/alice/simple-kick
   recipe/alice/kick-with-rest
   recipe/alice/complex-rhythm
   ```

2. **Creates exercises** (Layer 1)
   ```
   exercise/alice/hear-the-rest
     ├─ references → recipe/alice/kick-with-rest
     └─ references → recipe/alice/simple-kick (as contrast)

   exercise/alice/build-complex
     └─ references → recipe/alice/complex-rhythm (as target)
   ```

3. **Creates lesson** (Layer 2)
   ```
   lesson/alice/rhythm-mastery
     ├─ references → exercise/alice/hear-the-rest
     ├─ references → exercise/bob/rhythm-quiz (reuses someone else's!)
     └─ references → exercise/alice/build-complex
   ```

4. **Publishes to collection** (Layer 4)
   ```
   collection/alice/drum-fundamentals
     ├─ references → lesson/alice/rhythm-mastery
     ├─ references → lesson/bob/kick-patterns (reuses!)
     └─ references → session/2025-drum-jam (showcases techniques)
   ```

**Other users can now:**
- Use alice's recipes in their own exercises
- Include alice's exercises in their lessons
- Fork alice's lesson and customize it
- Add alice's collection to their curriculum

**Everything is composable!**

---

## Technical Implementation

### Content Storage (Git-Based)

Each content type is a git repository:

```
recipe/alice/simple-kick/
├── recipe.js              # The code
├── recipe.json            # Metadata
└── preview.mp3

exercise/alice/hear-the-rest/
├── exercise.json          # Exercise definition (with references)
└── metadata.json

lesson/alice/rhythm-mastery/
├── lesson.json            # Lesson sequence (with references)
└── README.md

collection/alice/drum-fundamentals/
└── collection.json        # List of references
```

### Reference Resolution

```typescript
interface ContentReference {
  url: string;               // jamhub://type/creator/name@version
  type: ContentType;
  id: string;
  version?: string;
}

class ContentResolver {
  async resolve(ref: ContentReference): Promise<Content> {
    // 1. Parse reference URL
    const { type, creator, name, version } = parseURL(ref.url);

    // 2. Look up in registry
    const metadata = await registry.lookup(type, creator, name);

    // 3. Fetch from git repo
    const gitURL = metadata.git_url;
    const content = await fetchFromGit(gitURL, version);

    // 4. Recursively resolve nested references
    if (content.references) {
      for (const nestedRef of content.references) {
        content[nestedRef.key] = await this.resolve(nestedRef);
      }
    }

    return content;
  }
}

// Usage
const exercise = await resolver.resolve(
  "jamhub://exercise/alice/hear-the-rest@v1.0"
);

// exercise.content.correct_answer.recipe_ref is automatically resolved
const correctRecipe = exercise.content.correct_answer.recipe;
// → Full recipe object, ready to evaluate in REPL
```

### Rendering Pipeline

```typescript
// User navigates to lesson
const lesson = await resolver.resolve("jamhub://lesson/alice/rhythm-mastery");

// Render first exercise
const firstExerciseRef = lesson.sequence[0].exercise_ref;
const exercise = await resolver.resolve(firstExerciseRef);

// Exercise references recipes
const correctRecipe = await resolver.resolve(
  exercise.content.correct_answer.recipe_ref
);

// Render in UI
<MultipleChoiceWrapper exercise={exercise}>
  <StrudelREPL code={correctRecipe.code} />
</MultipleChoiceWrapper>
```

**Key insight**: References are resolved on-demand, creating a live content graph!

---

## Benefits of Reference-Based Architecture

### For Content Creators
- ✅ Create once, use everywhere
- ✅ Update propagates automatically (if unpinned)
- ✅ Build on others' work
- ✅ Credit is built-in (references show attribution)

### For Learners
- ✅ Consistent content quality (vetted recipes)
- ✅ Can explore connections (what uses this?)
- ✅ Discover related content
- ✅ Learn by remixing existing content

### For Teachers
- ✅ Reuse community exercises
- ✅ Customize existing lessons
- ✅ Share curriculum easily
- ✅ Collaborate on content

### For Platform
- ✅ No content duplication
- ✅ Easy to update/moderate
- ✅ Rich content graph for recommendations
- ✅ Scales naturally (distributed via git)

**"Don't repeat yourself" - applied to educational content!** 📚🔗

## Inspiration from Successful Platforms

### From Duolingo

**Gamification Elements:**
- **Streaks**: Users who maintain 7-day streaks are 3.6x more engaged long-term
- **XP System**: Active leaderboard users complete 40% more lessons per week
- **Leagues**: Increased lesson completion by 25%
- **Loss Aversion**: Streak Freeze reduced churn by 21%
- **Bite-sized lessons**: 5-15 minute daily sessions
- **Immediate feedback**: Instant validation of answers

### From Khan Academy

**Mastery Learning:**
- **Progressive skill trees**: Unlock advanced concepts by mastering fundamentals
- **Mastery levels**: Attempted → Familiar → Proficient → Mastered
- **Hints system**: Scaffolded learning with optional guidance
- **Personalized dashboard**: Visual progress tracking
- **Practice until mastery**: No time pressure, focus on understanding
- **45-minute weekly goals**: Structured practice recommendations

### From Music Theory Apps (musictheory.net, Teoria)

**Domain-Specific Features:**
- **Ear training exercises**: Interval recognition, chord identification
- **Challenge modes**: Timed exercises with high scores
- **Interactive tutorials**: Step-by-step theory lessons
- **Progressive difficulty**: Adaptive question complexity
- **Multiple exercise types**: Variety maintains engagement

## Platform Features

### 1. Learning Paths (Skill Trees)

**Beginner Path: Rhythm & Patterns**
```
Level 1: First Sounds
├─ Play your first note
├─ Create a simple rhythm
└─ Understand cycles

Level 2: Pattern Building
├─ Space-separated sequences
├─ Rests and silence
└─ Speed multiplication (*, /)

Level 3: Advanced Patterns
├─ Nested sequences []
├─ Alternating patterns <>
└─ Random elements ?
```

**Intermediate Path: Melody & Harmony**
```
Level 4: Note Names
├─ Pitch notation (c, d, e)
├─ Octaves (c2, c3, c4)
└─ Sharps and flats

Level 5: Scales & Intervals
├─ Major scales
├─ Minor scales
├─ Interval recognition
└─ Scale degrees

Level 6: Chords
├─ Building triads [c,e,g]
├─ Chord progressions
└─ Inversions
```

**Advanced Path: Composition**
```
Level 7: Euclidean Rhythms
├─ (n,m) notation
├─ Cultural rhythm patterns
└─ Polyrhythms

Level 8: Effects & Transformations
├─ Temporal effects (@, !)
├─ Pattern manipulation
└─ Layering techniques

Level 9: Creative Composition
├─ Song structure
├─ Arrangement
└─ Performance techniques
```

### 2. Exercise Types

#### A. Ear Training Exercises

**"Hear & Code"**
- Listen to a pattern
- Recreate it in Strudel code
- Get immediate audio comparison feedback
```
Example:
🔊 [Play sound]
Your code: note("____")
Hint: Uses 3 notes in the C major scale
```

**"Interval Detective"**
- Hear two notes
- Identify the interval by coding it
- Progressive difficulty: seconds → thirds → octaves

**"Chord Builder"**
- Listen to a chord
- Build it using comma notation
- Visual feedback showing correct notes

**"Rhythm Mirror"**
- Hear a rhythmic pattern
- Match it using mini-notation
- See waveform comparison

#### B. Code Challenges

**"Complete the Pattern"**
- Fill in missing parts of Strudel code
- Must sound correct when played
```
Example:
note("c e ___ c")
Goal: Complete a C major arpeggio
```

**"Fix the Bug"**
- Broken code that sounds wrong
- Identify and fix the musical error
```
Example:
note("[c e g b]")  // Should be C major chord
Fix: note("[c,e,g]")  // Commas for simultaneity
```

**"Code Golf"**
- Create a specific sound with minimal code
- Leaderboard for shortest solutions
- Teaches efficiency and deep syntax knowledge

**"Constraint Composition"**
- Create music with specific rules
- "Use only 3 notes"
- "Make a 4-beat pattern with 2 rests"
- "Create a pattern that uses both <> and []"

#### C. Guessing Games

**"Will It Sound?"**
- See Strudel code, predict the sound
- Multiple choice: rhythm patterns, melodies, or chords
- Builds code-reading skills

**"Pattern Match"**
- Hear 3 patterns, see 3 code snippets
- Match code to sound
- Tests pattern recognition

**"What Comes Next?"**
- Hear a sequence: c, e, g, ?
- Predict and code the next note
- Teaches scale patterns and theory

**"Spot the Difference"**
- Two similar code snippets
- Hear both and identify the difference
- Builds attention to detail

#### D. Creative Challenges

**"Daily Jam"**
- New creative prompt every day
- "Make something spooky using only 2 notes"
- "Create a happy melody using Euclidean rhythms"
- Community voting on favorites

**"Remix Challenge"**
- Given a simple pattern, enhance it
- Add layers, effects, or variations
- Progression through complexity

**"Theme Compositions"**
- Weekly themed challenges
- "Rainy Day," "Video Game Boss," "Coffee Shop"
- Showcases on community page

### 3. Gamification Mechanics

#### XP & Progression

**Earn XP for:**
- Completing exercises: 10-50 XP
- Perfect streaks (5 in a row): 100 XP bonus
- Daily challenges: 75 XP
- Helping others: 25 XP
- Creative submissions: 50-200 XP (voted)

**XP Multipliers:**
- Streak bonus: +10% per week maintained
- Double XP weekends
- Challenge mode: 2x XP

#### Streaks & Habits

**Daily Goals:**
- Complete 3 exercises minimum
- 15-minute daily commitment
- Visual streak counter
- Streak freeze available (earn through progress)

**Streak Milestones:**
- 7 days: Bronze badge
- 30 days: Silver badge
- 100 days: Gold badge
- Special sound packs unlocked at milestones

#### Leagues & Competition

**Weekly Leagues:**
- Bronze → Silver → Gold → Diamond → Master
- Top 10 advance, bottom 5 drop
- Based on XP earned that week
- Creates social motivation

**Leaderboards:**
- Daily challenge leaders
- Code golf champions
- Creative challenge winners
- All-time XP rankings

#### Achievements & Badges

**Skill Badges:**
- "Rhythm Master" - Master all rhythm exercises
- "Chord Wizard" - Complete chord section
- "Pattern Detective" - 100 ear training exercises
- "Code Composer" - Publish 10 compositions

**Special Badges:**
- "Early Bird" - Exercise before 8am
- "Night Owl" - Exercise after 10pm
- "Helping Hand" - Help 50 learners
- "Explorer" - Try every exercise type

### 4. Learning Experience Flow

#### New User Journey

**Day 1: "Your First Sound"**
```
1. Watch 30-second intro video
2. Interactive tutorial: Type note("c")
3. Hear it play immediately
4. Challenge: Play note("e")
5. Success celebration + 50 XP
6. Set streak goal prompt
```

**Week 1: Foundation Building**
- 5 exercises per day (15 minutes)
- Focus on basic rhythm and single notes
- Unlock "Pattern Builder" at week end
- Earn first badge

**Month 1: Expanding Skills**
- Introduce melodies and scales
- First creative challenge
- Join a league
- Access community features

#### Daily Session Flow

**1. Warm-up (2 minutes)**
- Quick ear training exercise
- "Listen & identify" game
- Low pressure, builds habit

**2. Lesson (5-8 minutes)**
- New concept introduction
- Interactive examples
- Immediate practice

**3. Practice (5-10 minutes)**
- 3-5 exercises on current skill
- Mix of review and new challenges
- Adaptive difficulty

**4. Creative (3-5 minutes)**
- Optional: Daily challenge
- Free play mode
- Share creations

**5. Review**
- XP summary
- Streak status
- Tomorrow's preview

### 5. Unique Strudel Advantages

#### Immediate Audio-Visual Feedback

**See AND Hear Your Code:**
```javascript
note("c e g")  // Hear: C major arpeggio
note("[c,e,g]") // Hear: C major chord
```
Visual diff shows why brackets vs commas matter

#### Interactive Code Editor

**Live REPL Features:**
- Code runs while typing
- Inline hints for syntax
- Audio preview on hover
- Pattern visualizer shows timing

#### Pattern Visualizations

**Waveform Display:**
- See rhythm patterns visually
- Compare your code to target
- Understand timing relationships

**Piano Roll View:**
- Show note pitches over time
- Great for melody exercises
- Toggle on/off for different learning styles

#### Sandbox Mode

**Free Exploration:**
- No wrong answers
- Discover through play
- Save favorite creations
- Share with community

### 6. Pedagogical Features

#### Hints System (Khan Academy-inspired)

**Three-Tier Hints:**
```
Exercise: Create a C major scale
Hint 1: "Start with note()"
Hint 2: "Use space-separated notes: c d e..."
Hint 3: "Complete pattern: c d e f g a b c"
```
Using hints marks exercise as "needs practice"

#### Mastery Levels

**Four Stages per Skill:**
1. **Attempted** (gray) - Started exercise
2. **Familiar** (blue) - Completed 1-2 times
3. **Proficient** (green) - Completed 3-4 times
4. **Mastered** (gold) - 5+ completions, 90%+ accuracy

**Mastery Decay:**
- Skills fade to "Needs Practice" over time
- Encourages spaced repetition
- Smart review suggestions

#### Adaptive Learning

**Personalized Difficulty:**
- Track accuracy per concept
- Adjust question difficulty
- Skip mastered content
- Focus on weak areas

**Smart Recommendations:**
```
Dashboard: "Based on your progress..."
✓ Review: Intervals (dropping from Proficient)
→ Next: Minor scales (ready to learn)
⭐ Practice: Chord inversions (60% accuracy)
```

#### Error Analysis

**Intelligent Feedback:**
```
Your code: note("c e g b")
Expected: note("[c,e,g]")

Feedback:
❌ This plays notes in sequence
✓ Use commas for simultaneous notes (chords)
🔊 Listen to the difference:
   [Play both versions]

Try: note("[c,e,g]")
```

### 7. Community Features

#### Share & Discover

**Public Gallery:**
- Browse community creations
- Filter by skill level, genre, theme
- Like and comment
- Remix others' code (with credit)

**Learning Together:**
- Study groups (5-10 people)
- Group challenges
- Shared progress tracking
- Private messaging

#### Teaching Tools

**Teacher Dashboard:**
- Create classes
- Assign exercises
- Track student progress
- Custom lesson paths

**Student Accounts:**
- Parent/teacher oversight
- Age-appropriate content
- Privacy controls
- Progress reports

### 8. Content Structure

#### Lesson Format

**Micro-Lessons (5 minutes):**
1. **Concept Introduction** (1 min)
   - Short explanation
   - Why it matters
   - Audio examples

2. **Interactive Demo** (2 min)
   - Guided code-along
   - Play with parameters
   - Hear immediate results

3. **Practice Exercise** (2 min)
   - Apply the concept
   - Get instant feedback
   - Unlock next lesson

#### Progressive Complexity

**Rhythm Module Example:**

**Lesson 1: Single Notes**
```javascript
note("c")  // One note per cycle
```

**Lesson 2: Multiple Notes**
```javascript
note("c d e")  // Three notes, evenly spaced
```

**Lesson 3: Speed Control**
```javascript
note("c d e*2")  // Last note plays twice as fast
```

**Lesson 4: Rests**
```javascript
note("c ~ e ~")  // Silence creates rhythm
```

**Lesson 5: Nested Patterns**
```javascript
note("c [d e]")  // Subdivisions
```

Each builds on previous knowledge, gradually increasing complexity.

### 9. Technical Features

#### Audio Comparison Engine

**Smart Matching:**
- Compare student output to target
- Detect pitch errors
- Identify rhythm mistakes
- Highlight differences visually

#### Code Validation

**Real-time Checks:**
- Syntax highlighting
- Error detection before playing
- Suggestions for common mistakes
- Auto-complete for functions

#### Progress Tracking

**Detailed Analytics:**
- Time spent per skill
- Accuracy trends
- Strength/weakness visualization
- Recommended practice areas

#### Offline Mode

**Progressive Web App:**
- Download lessons for offline use
- Sync progress when reconnected
- Practice anywhere
- Reduced dependency on connection

### 10. Monetization (Optional)

#### Free Tier
- Core curriculum access
- Daily practice limits (3 lessons/day)
- Community features
- Basic sound library

#### Premium ($10/month or $80/year)
- Unlimited lessons
- Advanced sound packs
- No ads
- Detailed analytics
- Priority support
- Early access to features

#### Freemium Balance
- Keep core learning free (like Khan Academy)
- Premium enhances but doesn't gate learning
- School/teacher plans available

## Example User Scenarios

### Scenario 1: Complete Beginner (Age 12)

**Day 1:**
- Signs up, watches intro
- Completes "First Sound" tutorial: `note("c")`
- Tries changing it to `note("e")`
- Hears the difference, gets excited
- Earns 50 XP, starts streak

**Week 1:**
- 10-15 minutes daily
- Masters basic note patterns
- Unlocks "rhythm" section
- Earns "First Week" badge
- Shares first creation with friends

**Month 3:**
- Building simple melodies
- Understanding major vs minor
- Competing in Bronze league
- Created 20+ patterns
- Starting to understand music theory naturally

### Scenario 2: Musician Learning to Code (Age 25)

**Day 1:**
- Already knows music theory
- Placement test suggests "Advanced Syntax" path
- Jumps to Euclidean rhythms
- Immediately sees power of algorithmic composition

**Week 1:**
- Focuses on Strudel-specific features
- Completes code challenges
- Ranks high in leagues (music knowledge advantage)
- Discovers new ways to think about music

**Month 1:**
- Creating complex compositions
- Teaching friends using platform
- Contributing to community discussions
- Exploring generative music concepts

### Scenario 3: Teacher with Class (Age 35)

**Setup:**
- Creates teacher account
- Adds 25 students
- Assigns "Rhythm Basics" unit
- Sets weekly goals

**Usage:**
- Students work 20 min/class, 2x per week
- Teacher monitors dashboard
- Identifies students struggling with rests
- Creates custom practice set
- Hosts end-of-unit showcase

## Success Metrics

### Engagement
- Daily Active Users (DAU)
- 7-day streak retention
- Average session length
- Exercises completed per user

### Learning Outcomes
- Mastery level distribution
- Time to proficiency per skill
- Pre/post assessment scores
- User confidence surveys

### Community Health
- Creations shared per week
- Comments and engagement
- Teacher adoption rate
- Student satisfaction scores

## Development Phases

### Phase 1: MVP (3 months)
- Core exercise engine
- 20 lessons (rhythm & melody basics)
- XP and streak system
- Basic ear training
- User accounts and progress tracking

### Phase 2: Gamification (2 months)
- Leagues and leaderboards
- Badges and achievements
- Daily challenges
- Community sharing

### Phase 3: Content Expansion (3 months)
- 100+ lessons
- All skill trees complete
- Advanced ear training
- Creative challenges
- Teacher tools

### Phase 4: Polish & Scale (2 months)
- Mobile optimization
- Offline mode
- Analytics dashboard
- Performance optimization
- Accessibility features

## Technology Stack Recommendations

### Frontend
- **Strudel Core**: Music engine
- **React**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations

### Backend
- **Node.js**: Server
- **PostgreSQL**: User data, progress
- **Redis**: Leaderboards, sessions
- **S3**: Audio/media storage

### Features
- **Web Audio API**: Advanced audio
- **Monaco Editor**: Code editing
- **D3.js**: Visualizations
- **PWA**: Offline support

## Competitive Advantages

1. **Only platform teaching music through code**
2. **Immediate audio feedback** (not just visual)
3. **Creative expression** built into learning
4. **Pattern-based thinking** transfers to composition
5. **Free and open-source** core (Strudel)
6. **Works in browser** (no installation)
7. **Community-driven** content and creativity

## Conclusion

This platform combines the best of modern educational technology with the unique power of Strudel's live coding environment. By making music theory learning:

- **Interactive**: Immediate audio feedback
- **Creative**: Express yourself while learning
- **Gamified**: Addictive engagement mechanics
- **Mastery-based**: Learn at your own pace
- **Social**: Share and learn together

We can create a revolutionary way to learn music that's accessible, fun, and effective for learners of all ages and backgrounds.

---

## Sources & Research

- [Duolingo's Gamification Secrets](https://www.orizon.co/blog/duolingos-gamification-secrets)
- [Duolingo Gamification Strategy](https://www.nudgenow.com/blogs/duolingo-gamification-strategy)
- [How Duolingo Utilises Gamification](https://raw.studio/blog/how-duolingo-utilises-gamification/)
- [Khan Academy Mastery Learning](https://www.cultofpedagogy.com/khan-mastery-learning/)
- [Creating Mastery Goals with Khan Academy](https://www.khanacademy.org/khan-for-educators/k4e-us-demo/xb78db74671c953a7:getting-to-know-khan/xb78db74671c953a7:introduction-to-mastery-learning/a/using-khan-academy-for-personalized-practice-and-mastery)
- [musictheory.net Exercises](https://www.musictheory.net/exercises)
- [Ear Training Apps & Exercises](https://www.hooktheory.com/blog/ear-training-apps-and-exercises/)
- [Best Music Theory Apps](https://www.musicianwave.com/music-theory-ear-training-apps/)
