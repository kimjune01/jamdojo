# JamHub: A Community Hub for Strudel Recipes

## Executive Summary

JamHub is a social platform for the Strudel community to **learn, share, jam, and version** musical patterns. Think of it as GitHub meets SoundCloud for live coding - a place where musicians and coders collaborate on "recipes" (Strudel patterns), track their evolution, discover new sounds, and jam together in real-time.

## Core Philosophy

**"Fork it. Jam it. Share it."**

Music is collaborative and iterative. JamHub embraces:
1. **Learn** - Discover patterns from the community
2. **Share** - Publish your recipes for others to explore
3. **Jam** - Collaborate in real-time with other coders
4. **Version** - Track how patterns evolve over time

## What is a "Recipe"?

A **recipe** is a Strudel pattern/composition that can be:
- A single line of generative code
- A complete multi-track composition
- A reusable building block (drum kit, bass line, chord progression)
- An experimental sound exploration

Recipes include:
- The code itself
- Audio preview/recording
- Tags and metadata (genre, difficulty, BPM, key)
- Version history
- Attribution chain (who forked from whom)
- Comments and annotations

## The JamHub Experience

### 1. Discover & Explore

**Browse the Recipe Gallery**
```
🔥 Trending Today
   "Ambient Forest" by @forestcoder
   127 likes | 43 forks | 12 jams

   "Techno Template" by @beatmaker
   301 likes | 156 forks | 89 jams

   "Jazz Chords Pack" by @harmonizer
   89 likes | 234 forks | 5 jams
```

**Smart Discovery**
- Filter by genre, difficulty, instruments used
- Search by pattern features (Euclidean rhythms, specific scales, effects)
- "Similar to this" recommendations
- Follow your favorite creators
- Curated collections ("Best Ambient 2025", "Beginner Drum Patterns")

**Interactive Preview**
- Play recipe directly in browser
- See code + visualization side-by-side
- Scrub through timeline for longer compositions
- View pattern evolution (compare v1 vs v5)

### 2. Learn Through Remixing

**Fork & Modify**
```javascript
// Original by @jazzmaster
stack(
  note("c3 eb3 g3 bb3").slow(2),
  note("c5 d5 eb5 g5").fast(2)
)

// Your fork: Added rhythm variation
stack(
  note("c3 eb3 g3 bb3").slow(2),
  note("c5 d5 eb5 g5").fast(2).euclidean(5,8),  // ← Your addition
  s("bd ~ sd ~")                                 // ← New drum line
)
```

**Learning Features**
- Annotated recipes with inline comments explaining techniques
- "Deconstruct" mode: Toggle layers on/off to hear contributions
- Diff view: See exactly what changed between versions
- Tutorial recipes: Step-by-step pattern building
- "Try this" suggestions when viewing code

**Study Collections**
- "10 Ways to Use Euclidean Rhythms"
- "Chord Progression Pack"
- "Ambient Texture Library"
- "Polyrhythm Examples"

### 3. Share Your Creations

**Publishing Flow**
```
1. Write code in Strudel REPL
2. Click "Share to JamHub"
3. Add metadata:
   - Title & description
   - Tags (ambient, techno, experimental)
   - Difficulty level
   - Key/BPM (auto-detected, editable)
   - License (Creative Commons, GPL, etc.)
4. Choose visibility:
   - Public (everyone)
   - Unlisted (link only)
   - Community (registered users)
   - Private (you only)
5. Publish!
```

**Recipe Page**
- Audio player with waveform
- Live code editor (editable for remixing)
- Pattern visualization
- Stats (plays, likes, forks)
- Comments and discussion
- Version history timeline
- Attribution tree (shows all forks/remixes)
- Related recipes

**Creator Profiles**
```
@beatmaker
🎵 127 recipes | 🌟 2,341 likes | 🎸 345 followers

Popular Recipes:
▶ Techno Template (301 ❤️)
▶ Acid Bass Line (156 ❤️)
▶ Break Beat Pack (98 ❤️)

Styles: Techno, House, Breaks
Influences: @oldskool, @acidrain
```

### 4. Jam Together (Real-Time Collaboration)

**Jam Rooms**
```
🎹 Live Jam Sessions

Public Rooms:
🟢 Ambient Lounge          4/8 people    Join
🟢 Techno Tuesday         7/12 people   Join
🔴 Experimental Lab       12/12 people  [Full]

Private Rooms:
Create your own jam room (invite only)
```

**Collaborative Features**
- Multi-cursor editing (like Google Docs for code)
- Individual tracks per user
- Global sync/tempo control
- Chat sidebar for coordination
- Audio mixing panel (adjust levels)
- Record entire jam session
- Publish jam as collaborative recipe

**Jam Modes**

**Free Jam**: Open canvas, everyone codes simultaneously
```javascript
// User 1's track
$: note("c3 eb3 g3").slow(2)

// User 2's track
$: s("bd sd").bank("RolandTR808")

// User 3's track
$: note("c5(5,8)").scale("C:minor")
```

**Turn-Based**: Take turns adding 4-bar sections

**Challenge Mode**: Given constraints, build collaboratively
- "Only use 3 notes"
- "Must include Euclidean rhythm"
- "16-bar composition, 2 bars per person"

**Jam Replays**
- Watch jams unfold over time
- See who added what and when
- Jump to any moment in the jam
- Fork from any point in the jam

### 5. Version Control for Music

**Git-Like Workflow**
```
Recipe: "Ambient Meditation"

v1.0 (Jan 1)  - Initial drone
  └─ v1.1 (Jan 2)  - Added reverb
       └─ v1.2 (Jan 5)  - Tempo adjustment
            └─ v2.0 (Jan 10) - Major rework: added melody
                 ├─ v2.1 (Jan 12) - Bug fix
                 └─ v2.2-beta (Jan 15) - Experimental branch
```

**Version Features**
- Automatic versioning on publish
- Manual version tagging (v1.0, v2.0)
- Branch alternative versions
- Compare any two versions (visual + audio diff)
- Restore previous versions
- Version comments ("Added bass line", "Fixed timing issue")

**Forking & Attribution**
```
Original: "Drum Pattern" by @original
  ├─ Fork: "Drum + Bass" by @user1 (143 likes)
  │    └─ Fork: "Full Track" by @user2 (89 likes)
  └─ Fork: "Minimal Drums" by @user3 (234 likes)
       └─ Fork: "Techno Edit" by @user4 (67 likes)
```

- Attribution tree visualization
- "Based on X by Y" automatic credit
- Fork statistics on original recipe
- Discover creative branches

**Change History**
```
v2.3 → v2.4 (2 days ago)
+ Added polyrhythmic hi-hat pattern
+ Increased reverb on ambient pad
- Removed bass drop (too aggressive)
~ Modified chord progression (minor → major)
```

### 6. Social & Community Features

**Engagement**
- Like/favorite recipes
- Comment threads on recipes
- @mention other users
- Follow creators
- Share to social media (with audio preview)
- Embed recipes on external sites

**Notifications**
- @yourusername mentioned you
- @creator published a new recipe
- Your recipe was forked 10 times
- New comments on your recipe
- Weekly digest of trending recipes

**Challenges & Contests**
```
🏆 Weekly Challenge: "Winter Vibes"
Create a recipe that evokes winter using only:
- Max 4 tracks
- Must use reverb
- Include at least one Euclidean rhythm

Submissions: 47 | Ends in: 3 days
Top 3 featured on homepage
```

**Community Playlists**
- Curated by users or moderators
- "Best of Ambient"
- "Beginner-Friendly Patterns"
- "Algorithmic Masterpieces"
- "This Week's Jams"

**Groups & Collectives**
- Create groups around genres/styles
- Group-specific recipe collections
- Private jam rooms for group members
- Collaborative projects

### 7. Learning Integration

**Recipe Difficulty Levels**
```
🟢 Beginner    - Simple patterns, basic syntax
🟡 Intermediate - Multiple functions, effects
🔴 Advanced     - Complex nesting, transformations
⚫ Expert       - Generative algorithms, custom functions
```

**Educational Tags**
- `#tutorial` - Step-by-step learning
- `#technique:euclidean` - Demonstrates specific technique
- `#building-block` - Reusable component
- `#commented` - Heavily annotated code
- `#challenge` - Try to recreate this

**"Learn This Recipe" Mode**
- Interactive tutorial overlays
- Code annotations appear as you read
- "Try changing this value" prompts
- Progressive disclosure (show complexity gradually)
- Quiz yourself on what each line does

**From Learning Platform to JamHub**
- Complete lesson → Get related recipes
- "See this technique in action" links
- Community examples of lesson concepts
- Share your lesson completions as recipes

### 8. Technical Features

#### Recipe Data Structure
```javascript
{
  id: "recipe-uuid",
  title: "Ambient Forest",
  author: "forestcoder",
  code: "note('c2 eb2 g2').slow(8).room(0.9)",
  version: "2.3",
  parent: "recipe-parent-uuid",  // Fork source
  tags: ["ambient", "drone", "slow"],
  metadata: {
    bpm: 60,
    key: "C minor",
    duration: 120, // seconds
    difficulty: "intermediate"
  },
  audio: "audio-file-url",
  stats: {
    plays: 1234,
    likes: 127,
    forks: 43,
    jams: 12
  },
  created: "2025-01-15",
  updated: "2025-01-20",
  license: "CC-BY-SA"
}
```

#### Code Features
- **Syntax highlighting** in recipe viewer
- **Live preview** while browsing
- **Code validation** before publishing
- **Audio rendering** server-side for previews
- **Pattern analysis** (auto-detect key, BPM, instruments)
- **Smart search** (search by audio features)

#### Jam Room Technology
- **WebRTC** for real-time collaboration
- **Operational Transform** for multi-cursor editing
- **Synchronized playback** across clients
- **Audio mixing** per user
- **Low latency** (<100ms for audio)

#### Performance
- **Lazy loading** for recipe gallery
- **Audio streaming** (not full download)
- **CDN delivery** for popular recipes
- **Caching** for faster browsing
- **Progressive rendering** of long lists

### 9. Moderation & Safety

**Content Guidelines**
- No copyrighted samples
- No offensive/harmful content
- Respect open source licenses
- Give attribution when forking
- Be constructive in comments

**Moderation Tools**
- Report inappropriate content
- Community moderators
- Automated content filtering
- User blocking
- Private recipes for sensitive work

**Licensing Support**
- Choose license per recipe
- Default: Creative Commons BY-SA
- GPL-compatible options
- "All Rights Reserved" option
- Clear attribution requirements

### 10. Monetization & Sustainability

#### Free for Everyone (Core Features)
- Unlimited recipe publishing
- Browse all public recipes
- Fork and remix
- Join public jam rooms
- Basic profile

#### JamHub Pro ($5/month or $40/year)
- Private recipes (unlimited)
- Priority jam room creation
- Advanced analytics
  - Play statistics over time
  - Audience demographics
  - Fork tree visualization
- Custom profile themes
- Ad-free experience
- Extended audio storage (2hr+ recipes)
- Early access to new features

#### JamHub Teams ($15/month for 5 users)
- Team workspace
- Private group jam rooms
- Shared recipe libraries
- Collaboration tools
- Team analytics

#### Creator Support
- Tip jar for creators
- "Support this creator" button
- Monthly supporters get badges
- Revenue sharing (80/20 split)

### 11. Integration with Strudel Ecosystem

**REPL Integration**
```javascript
// In Strudel REPL:
// Import recipe from JamHub
import("jamhub:beatmaker/techno-template")
  .then(pattern => pattern.play())

// Or use recipe as building block
stack(
  jamhub("forestcoder/ambient-pad"),
  note("c3 eb3 g3").s("bass")
)
```

**Learning Platform Connection**
- "Browse community examples" links in lessons
- "Share your solution" after completing exercises
- Leaderboard integration
- Earn badges for publishing quality recipes

**Discord/Forum Integration**
- Share recipes directly to Discord
- Preview embeds with audio player
- "Discuss on forum" link per recipe
- Bot commands (!jamhub search ambient)

### 12. Launch Strategy

#### Phase 1: Recipe Gallery (Months 1-2)
- Core recipe publishing
- Browse and search
- Forking and versioning
- User profiles
- Comments and likes

#### Phase 2: Jam Rooms (Months 3-4)
- Real-time collaboration
- Jam room creation
- Multi-user editing
- Audio recording
- Jam replays

#### Phase 3: Community Features (Months 5-6)
- Challenges and contests
- Groups and collectives
- Curated playlists
- Notifications system
- Advanced search

#### Phase 4: Pro Features (Month 7+)
- Monetization launch
- Private recipes
- Advanced analytics
- Team workspaces
- API access

### 13. Success Metrics

**Engagement**
- Recipes published per week
- Average forks per recipe
- Jam room usage hours
- Daily active users
- Return visitor rate

**Quality**
- Average plays per recipe
- Like/publish ratio
- Comment engagement
- Fork depth (how many generations)
- Recipe retention (come back to same recipe)

**Community Health**
- Creator retention rate
- Collaboration frequency
- Cross-pollination (users trying new genres)
- Constructive feedback ratio
- Moderation incident rate

**Growth**
- New users per month
- Conversion to Pro
- Recipe library growth rate
- Cross-platform sharing
- Educational adoption

## Why JamHub Will Succeed

### 1. Network Effects
More recipes → More discovery → More users → More recipes

### 2. Lower Barrier to Creativity
- Start with someone else's recipe
- Modify one line to make it yours
- Learn by seeing others' techniques
- No fear of blank canvas

### 3. Credit & Attribution Built-In
- Fork trees show influence
- Automatic attribution
- Celebrate remixing culture
- Original creators get recognition

### 4. Live Coding Community Needs This
- TidalCycles community is active but scattered
- No central place to share patterns
- Discord/forum isn't designed for code browsing
- Version control for music doesn't exist yet

### 5. Unique Value Proposition
- **vs GitHub**: Audio-first, music-specific features
- **vs SoundCloud**: Code-centric, full remix capability
- **vs YouTube**: Interactive, forkable, real-time collab
- **vs Discord**: Organized, searchable, permanent

## Design Principles

### 1. Code is the Source of Truth
- Always show the code
- Code diff is more important than audio diff
- Pattern visualization helps but code is primary

### 2. Remixing is Creation
- Forking is encouraged, not frowned upon
- Attribution is automatic
- Small changes can be profound
- Evolution is as valuable as revolution

### 3. Audio is Social
- Every recipe has a voice
- Music brings people together
- Collaboration happens through sound
- Listening is as important as coding

### 4. Lightweight and Fast
- No installation required
- Instant preview
- Fast browsing
- Mobile-friendly (read-only mode)

### 5. Open by Default, Private by Choice
- Public sharing is encouraged
- But respect privacy needs
- Experiments can be private
- Choose your own licensing

## Example User Journeys

### Journey 1: The Curious Beginner
**Day 1**: Discovers JamHub link on social media
- Browses trending recipes
- Plays "Chill Beats" recipe
- Clicks "Remix this"
- Changes one note value
- Hears difference immediately
- Publishes first fork

**Week 1**: Returns daily
- Follows 5 creators
- Forks 10 recipes
- Makes small modifications
- Gets first like on own recipe

**Month 1**: Becoming confident
- Publishes original recipe
- Gets 20 likes
- Joins first jam room
- Feels part of community

### Journey 2: The Experienced Coder
**Day 1**: Active on TidalCycles Discord
- Imports favorite patterns to JamHub
- Creates "My Essentials" collection
- Shares with Discord community

**Week 1**: Discovering new techniques
- Browses advanced recipes
- Finds new approach to polyrhythms
- Forks and experiments
- Publishes improved version

**Month 1**: Teaching others
- Publishes tutorial recipe series
- Annotates code extensively
- Hosts weekly jam room
- Becomes trusted community member

### Journey 3: The Collaborator
**Day 1**: Friend invites to jam room
- Joins private room
- Adds drum pattern to friend's bass line
- Real-time tweaking together
- Records 10-minute jam

**Week 1**: Collaboration continues
- Creates shared recipe collection
- Builds track layer by layer
- Each person adds instrument
- Publishes as collaborative work

**Month 1**: Growing community
- Starts genre-specific group
- Weekly jam sessions
- Recipe challenges within group
- Publishing group compilations

## Tree-Based Content Architecture

### Core Concept: Composable Content Nodes

JamHub content is organized as a **tree structure** where each node is independently renderable and composable. Content can be linked via **references** (links to other repos) or **embedded** (inline content).

```
        course
       /      \
   lesson     lesson (reference)
   /  |  \       \
 sample quiz activity
  |     |      |
(embedded) (reference) (embedded)
```

**Node Types:**
- **Leaf nodes** (atomic): `sample`, `quiz`, `activity`, `jam`, `article`
- **Inner nodes** (containers): `lesson`, `course`, `collection`, `module`

**Edge Types:**
- **Reference**: `jamhub://alice/kick-pattern` - Links to external repo
- **Embedded**: Inline content stored in parent node

**Key Principle**: Every node has a `type` and is **independently linkable and renderable**

### Metadata & Audio: Rich Content at Every Node

**Every node type** (sample, quiz, activity, lesson, course, collection, jam, article) supports:
- **Title** - User-written name
- **Description** - User-written explanation
- **Audio file** - User-generated recording with reasonable size limits
- **Auto-generated audio** - From code evaluation (where applicable)
- **Tags & metadata** - Genre, difficulty, categories

**Audio Duration and Size Limits by Node Type:**

All audio files use **WebM container with Opus codec** for optimal compression and universal browser support.

**Duration limits are enforced at recording time** (users see a countdown timer):

| Node Type | Max Duration | Typical | Max File Size | Typical Size | Bitrate |
|-----------|-------------|---------|---------------|--------------|---------|
| **sample** | 4 minutes | 30s | 2 MB | ~240 KB | 64 kbps |
| **quiz / activity** | 10 minutes | 2m | 5 MB | ~960 KB | 64 kbps |
| **lesson** | 21 minutes | 5m | 15 MB | ~3.6 MB | 96 kbps |
| **jam** | 140 minutes (2.3h) | 45m | 50 MB | ~16 MB | 48 kbps |
| **collection / course** | 7 minutes | 2m | 5 MB | ~1.4 MB | 96 kbps |

**Format**: `.webm` files with `audio/webm;codecs=opus` MIME type

**Enforcement Strategy**:
- **Duration limits** enforced in browser at recording time (auto-stop with countdown timer)
- **File size limits** act as safety checks for uploads
- Limits stay well under GitHub's 50 MB file warning threshold
- Opus compression provides 4-10x headroom over typical use cases

### Node Type: `sample` (Strudel Pattern)

**What it is:** A single Strudel pattern - the fundamental atomic unit

**Capabilities:**
- Raw Strudel code (executable)
- Can be played directly in REPL
- Audio preview (auto-generated or user-uploaded)
- Metadata (BPM, key, tags)
- Version history

**Node Schema:**
```json
{
  "id": "jamhub://alice/kick-pattern",
  "type": "sample",
  "metadata": {
    "title": "Kick Pattern with Euclidean",
    "description": "A foundational kick drum pattern using Euclidean rhythms",
    "author": "alice",
    "created": "2025-01-15T10:30:00Z",
    "updated": "2025-01-20T14:22:00Z",
    "tags": ["drums", "euclidean", "kick"],
    "difficulty": 1,
    "license": "CC-BY-4.0"
  },
  "content": {
    "code": "s('bd(3,8,0)').bank('RolandTR808')",
    "bpm": 120,
    "key": null,
    "instruments": ["kick"]
  },
  "media": {
    "audio": {
      "url": "https://github.com/alice/kick-pattern/releases/download/v2.3/preview.webm",
      "duration": 30,
      "size": 240000
    }
  }
}
```

**GitHub Storage:**
```
github.com/alice/kick-pattern/
├── node.json            # Full node definition
├── README.md            # Human-readable
└── media/
    └── preview.webm     # Audio preview (Opus codec)
```

**URL Pattern:**
```
jamhub://alice/kick-pattern
jamhub://alice/kick-pattern@v2.3  (with version)
```

### Node Type: `quiz` (Interactive Challenge)

**What it is:** An interactive coding challenge with validation

**Node Schema:**
```json
{
  "id": "jamhub://bob/rhythm-quiz-1",
  "type": "quiz",
  "metadata": {
    "title": "Identify the Rhythm Pattern",
    "description": "Listen and select the correct code",
    "author": "bob",
    "tags": ["rhythm", "listening", "euclidean"],
    "difficulty": 2
  },
  "content": {
    "prompt": "Which code produces this rhythm?",
    "targetPattern": "s('bd(3,8,0)')",
    "hints": ["Listen for the Euclidean distribution"],
    "validation": "exact"
  },
  "media": {
    "audio": {
      "url": "https://github.com/bob/rhythm-quiz-1/releases/download/v1.0/walkthrough.webm",
      "duration": 45,
      "size": 360000
    }
  }
}
```

**URL:** `jamhub://bob/rhythm-quiz-1`

### Node Type: `activity` (Guided Exercise)

**What it is:** Step-by-step coding exercise with starter code

**Node Schema:**
```json
{
  "id": "jamhub://carol/build-bassline",
  "type": "activity",
  "metadata": {
    "title": "Build Your First Bassline",
    "description": "Learn to create bass patterns",
    "author": "carol",
    "tags": ["bass", "beginner", "melody"],
    "difficulty": 1
  },
  "content": {
    "instructions": "Add a bass note on beats 1 and 3...",
    "starterCode": "note(\"c2 ~ ~ ~\")",
    "solution": "note(\"c2 ~ c2 ~\").s('sawtooth')"
  },
  "media": {
    "audio": {
      "url": "https://github.com/carol/build-bassline/releases/download/v1.0/preview.webm",
      "duration": 120,
      "size": 960000
    }
  }
}
```

**URL:** `jamhub://carol/build-bassline`

### Node Type: `lesson` (Container - Structured Learning)

**What it is:** A structured learning unit that composes other nodes via references or embedding

**Capabilities:**
- Contains ordered sequence of samples, quizzes, activities
- Uses reference edges (links to external content) or embedded edges (inline content)
- Progress tracking, prerequisites, learning objectives
- Instructor audio narration

**Node Schema:**
```json
{
  "id": "jamhub://carol/rests-and-silence",
  "type": "lesson",
  "metadata": {
    "title": "Understanding Rests and Silence",
    "description": "Learn how to use rests effectively in patterns",
    "author": "carol",
    "tags": ["rhythm", "rests", "beginner"],
    "difficulty": 1
  },
  "content": {
    "introduction": "Rests are as important as notes...",
    "objectives": [
      "Understand the ~ rest symbol",
      "Use rests to create rhythmic variation"
    ],
    "prerequisites": ["jamhub://carol/basic-patterns"]
  },
  "children": [
    {
      "edgeType": "reference",
      "target": "jamhub://bob/rest-quiz-1",
      "metadata": { "description": "Test your understanding", "order": 1 }
    },
    {
      "edgeType": "embedded",
      "content": {
        "type": "sample",
        "metadata": { "title": "Quick Example" },
        "content": { "code": "sound(\"bd ~ sd ~\")" }
      },
      "metadata": { "description": "Inline example", "order": 2 }
    },
    {
      "edgeType": "reference",
      "target": "jamhub://carol/rest-activity",
      "metadata": { "order": 3 }
    }
  ],
  "media": {
    "audio": {
      "url": "https://github.com/carol/rests-and-silence/releases/download/v1.0/intro.webm",
      "duration": 180,
      "size": 2160000
    }
  }
}
```

**URL:** `jamhub://carol/rests-and-silence`

### Node Type: `jam` (Recorded Session)

**What it is:** A recorded live coding session (solo or collaborative)

**Capabilities:**
- Full session audio recording
- Timeline playback
- Can reference initial samples
- Produces new samples as artifacts

**Node Schema:**
```json
{
  "id": "jamhub://forestcoder/ambient-collab-jan-2025",
  "type": "jam",
  "metadata": {
    "title": "Ambient Collaboration Session",
    "description": "Three coders building an ambient track",
    "author": "forestcoder",
    "created": "2025-01-20T14:30:00Z",
    "tags": ["ambient", "collaborative"],
    "difficulty": null
  },
  "content": {
    "participants": ["forestcoder", "beatmaker", "harmonizer"],
    "duration": 2700
  },
  "media": {
    "audio": {
      "url": "https://github.com/forestcoder/ambient-collab-jan-2025/releases/download/v1.0/session.webm",
      "duration": 2700,
      "size": 16200000
    }
  }
}
```

**URL:** `jamhub://forestcoder/ambient-collab-jan-2025`

### Node Type: `collection` (Container - Curated Playlist)

**What it is:** A curated playlist that references any other content

**Capabilities:**
- References samples, lessons, jams, or other collections
- Curator's narrative/context
- Ordered or thematic grouping
- Can include curator's audio mix

**Node Schema:**
```json
{
  "id": "jamhub://dave/best-ambient-2025",
  "type": "collection",
  "metadata": {
    "title": "Best Ambient Patterns of 2025",
    "description": "My favorite ambient recipes from the year",
    "author": "dave",
    "tags": ["ambient", "2025", "curated"],
    "difficulty": null
  },
  "content": {
    "description": "A curated journey through the year's best ambient patterns"
  },
  "children": [
    {
      "edgeType": "reference",
      "target": "jamhub://forestcoder/ambient-forest",
      "metadata": { "description": "Perfect use of reverb", "order": 1 }
    },
    {
      "edgeType": "reference",
      "target": "jamhub://droner/deep-space",
      "metadata": { "description": "Masterclass in drones", "order": 2 }
    },
    {
      "edgeType": "reference",
      "target": "jamhub://forestcoder/ambient-collab-jan-2025",
      "metadata": { "description": "Collaborative magic", "order": 3 }
    }
  ],
  "media": {
    "audio": {
      "url": "https://github.com/dave/best-ambient-2025/releases/download/v1.0/mix.webm",
      "duration": 600,
      "size": 7200000
    }
  }
}
```

**URL:** `jamhub://dave/best-ambient-2025`

### Node Type: `course` (Container - Learning Path)

**What it is:** Multi-lesson structured learning path

**Node Schema:**
```json
{
  "id": "jamhub://alice/strudel-beginners",
  "type": "course",
  "metadata": {
    "title": "Strudel for Beginners",
    "description": "Complete introduction to live coding with Strudel",
    "author": "alice",
    "tags": ["beginner", "course"],
    "difficulty": 1
  },
  "content": {
    "syllabus": "Week 1: Rhythms, Week 2: Melodies, Week 3: Composition",
    "prerequisites": []
  },
  "children": [
    {
      "edgeType": "reference",
      "target": "jamhub://alice/lesson-rhythms",
      "metadata": { "description": "Week 1", "order": 1 }
    },
    {
      "edgeType": "reference",
      "target": "jamhub://alice/lesson-melodies",
      "metadata": { "description": "Week 2", "order": 2 }
    }
  ]
}
```

**URL:** `jamhub://alice/strudel-beginners`

---

## Tree Composition Examples

### Example 1: Simple Lesson (References Only)

```json
{
  "type": "lesson",
  "children": [
    { "edgeType": "reference", "target": "jamhub://bob/kick-sample" },
    { "edgeType": "reference", "target": "jamhub://carol/rhythm-quiz" }
  ]
}
```

### Example 2: Mixed References and Embedded Content

```json
{
  "type": "lesson",
  "children": [
    {
      "edgeType": "reference",
      "target": "jamhub://alice/sample-1"
    },
    {
      "edgeType": "embedded",
      "content": {
        "type": "activity",
        "metadata": { "title": "Quick Exercise" },
        "content": { "instructions": "Try this...", "starterCode": "..." }
      }
    }
  ]
}
```

---

## Content Addressing & References

Every node has a unique `jamhub://` URL:
- `jamhub://username/content-name` - Latest version
- `jamhub://username/content-name@v2.3` - Specific version (future)

References are resolved at render time by fetching from GitHub:
```
jamhub://alice/kick-pattern
  ↓
https://github.com/alice/kick-pattern
  ↓
https://raw.githubusercontent.com/alice/kick-pattern/main/node.json
```

---

## Summary: Tree Architecture Benefits

1. **Flexible Composition** - No rigid layers, compose arbitrarily
2. **Content Reuse** - Same sample used in multiple lessons via references
3. **Clear Ownership** - References preserve attribution
4. **Independent Renderability** - Every node displays standalone
5. **Version Control** - Each node is a Git repo with full history

## Content Addressing & Versioning

**Every node has a canonical URL scheme:**

```
jamhub://{username}/{content-name}[@version]
```

**Examples:**
```
jamhub://alice/kick-pattern@v2.3
jamhub://bob/rhythm-quiz
jamhub://carol/rests-and-silence
jamhub://forestcoder/ambient-collab-jan-2025
jamhub://dave/best-ambient-2025
```

**Web URLs:**
```
https://jamhub.com/alice/kick-pattern@v2.3
https://jamhub.com/bob/rhythm-quiz
https://jamhub.com/carol/rests-and-silence#step-2
https://jamhub.com/forestcoder/ambient-collab-jan-2025?t=150
https://jamhub.com/dave/best-ambient-2025
```

**Semantic Versioning:**
- All nodes support semantic versioning: `v2.3.1` (major.minor.patch)
- Jams are typically immutable (no versions after creation)
- Collections and courses can be versioned when content changes

### Independent Linkability

**Core Principle:** Every node is independently linkable and renderable

**Sample Standalone:**
```
https://jamhub.com/alice/kick-pattern@v2.3
→ Can play directly, without context
→ Shows title, description, audio
→ Optionally shows "Used in 3 lessons"
```

**Quiz Standalone:**
```
https://jamhub.com/bob/rhythm-quiz
→ Can complete directly, without lesson context
→ Shows title, description, validation
→ Optionally shows "Part of: Lesson - Understanding Rhythms"
```

**Lesson Standalone:**
```
https://jamhub.com/carol/rests-and-silence
→ Can complete directly, without course context
→ Shows lesson audio, progress through children
→ Optionally shows "Part of: Course - Beginner Rhythms"
```

**Deep Linking:**
```
# Link to specific child within lesson
jamhub.com/carol/rests-and-silence#step-2

# Link to specific timestamp in jam
jamhub.com/forestcoder/ambient-collab-jan-2025?t=150

# Link to specific version
jamhub.com/alice/kick-pattern@v2.3

# Embed node in external site
<iframe src="jamhub.com/bob/rhythm-quiz?embed=true" />
```

**API Access:**
```typescript
// Fetch any node independently
GET /api/nodes/alice/kick-pattern@v2.3
GET /api/nodes/bob/rhythm-quiz
GET /api/nodes/carol/rests-and-silence

// Fetch with children expanded
GET /api/nodes/carol/rests-and-silence?expand=true
→ Returns full tree with all references resolved

// Find usage
GET /api/nodes/alice/kick-pattern/references
→ Returns [{type: "lesson", id: "carol/rests-and-silence"}, ...]
```

### Programmatic Content Creation

**CLI Tool:**
```bash
# Generate 10 exercises algorithmically
$ jamhub generate exercises \
  --template=euclidean-rhythm \
  --count=10 \
  --output=./exercises/

✓ Generated 10 exercises
✓ Published to JamHub
```

**TypeScript SDK:**
```typescript
// Generate exercises programmatically
import { MultipleChoiceExercise, Recipe } from '@jamhub/builder';

function generateEuclideanSeries(): MultipleChoiceExercise[] {
  const exercises = [];

  for (let pulses = 3; pulses <= 12; pulses++) {
    const steps = 8;
    const correct = new Recipe({
      code: `s('bd(${pulses},${steps},0)')`,
      title: `Euclidean ${pulses}/${steps}`
    });

    const wrong = [
      new Recipe({ code: `s('bd(${pulses-1},${steps},0)')` }),
      new Recipe({ code: `s('bd(${pulses+1},${steps},0)')` }),
      new Recipe({ code: `s('bd(${pulses},${steps+1},0)')` })
    ];

    exercises.push(new MultipleChoiceExercise({
      title: `Euclidean Pattern ${pulses}/${steps}`,
      question: "Which code produces this rhythm?",
      correctAnswer: correct,
      wrongAnswers: wrong.slice(0, 3),
      settings: { showCode: false }
    }));
  }

  return exercises;
}

// Publish to JamHub
const exercises = generateEuclideanSeries();
await jamhub.publishBatch(exercises);
```

**YAML Configuration:**
```yaml
# exercises/euclidean-series.yml
exercises:
  - type: multiple_choice
    title: "Euclidean 3/8"
    question: "Which code produces this rhythm?"
    correct_answer:
      code: "s('bd(3,8,0)')"
    wrong_answers:
      - code: "s('bd(2,8,0)')"
      - code: "s('bd(4,8,0)')"
    settings:
      show_code: false

  - type: multiple_choice
    title: "Euclidean 5/8"
    question: "Which code produces this rhythm?"
    correct_answer:
      code: "s('bd(5,8,0)')"
    wrong_answers:
      - code: "s('bd(4,8,0)')"
      - code: "s('bd(6,8,0)')"
```

**Testing Framework:**
```typescript
// test/exercises/euclidean-3-8.test.ts
import { test, expect } from '@jamhub/test';

test('Euclidean 3/8 exercise', async () => {
  const exercise = await jamhub.load('exercise/bob/euclidean-3-8');

  // Verify structure
  expect(exercise.type).toBe('multiple_choice');
  expect(exercise.wrongAnswers).toHaveLength(3);

  // Verify correct answer produces distinct audio
  const correctAudio = await exercise.correctAnswer.render();
  const wrongAudio = await exercise.wrongAnswers[0].render();

  expect(correctAudio).not.toEqual(wrongAudio);

  // Verify metadata
  expect(exercise.difficulty).toBe('beginner');
  expect(exercise.tags).toContain('euclidean');
});
```

**Version Control Integration:**
```bash
# Content as code in git
my-lessons/
├── exercises/
│   ├── euclidean-3-8.ts
│   ├── euclidean-5-8.ts
│   └── euclidean-7-8.ts
├── lessons/
│   └── euclidean-rhythms.ts
├── tests/
│   └── exercises.test.ts
└── jamhub.config.ts

# Deploy pipeline
$ git push
→ GitHub Actions runs tests
→ Builds exercises
→ Publishes to JamHub
→ Updates references automatically
```

### Summary: The Power of Layers

**Each layer adds value without duplication:**

```
Layer 0 (Recipe):
  "Here's a pattern"

Layer 1 (Exercise):
  "Can you identify/create this pattern?"
  → References recipes by URL

Layer 2 (Lesson):
  "Learn through this sequence of exercises"
  → References exercises by URL

Layer 3 (Session):
  "Watch experts build patterns together"
  → References recipes, produces new ones

Layer 4 (Collection):
  "Explore curated sets of content"
  → References anything by URL
```

**Benefits:**
- ✅ No code duplication
- ✅ Updates propagate (recipe update → exercise updates)
- ✅ Flexible reuse (one recipe in many exercises)
- ✅ Independent usability (every layer works standalone)
- ✅ Rich metadata at every layer (title, description, audio)
- ✅ Composable (mix and match freely)
- ✅ Versionable (semantic versioning throughout)

## Git-Based Architecture

### Core Concept: Recipes ARE Git Repositories

Instead of building custom version control, **each recipe is a git repository**. This provides:
- ✅ True version control (commits, branches, tags)
- ✅ Built-in forking mechanism
- ✅ Distributed ownership
- ✅ Works with existing git tools
- ✅ CLI-friendly
- ✅ Open and portable (recipes live on GitHub/GitLab/Codeberg)

### Recipe Repository Structure

```
my-ambient-track/
├── recipe.js           # Main Strudel code
├── recipe.json         # Metadata
├── README.md           # Description, usage notes
├── preview.mp3         # Auto-generated audio preview
├── versions/           # Alternate versions
│   ├── minimal.js
│   └── extended.js
└── .jamhub/            # JamHub-specific data
    ├── stats.json      # Plays, likes (cached)
    └── tags.json       # Genre, difficulty, etc.
```

### Recipe Metadata (`recipe.json`)
```json
{
  "name": "Ambient Forest",
  "author": "forestcoder",
  "version": "2.3.0",
  "strudel_version": "1.0.0",
  "description": "Slow evolving ambient pad with natural reverb",
  "tags": ["ambient", "drone", "slow"],
  "difficulty": "intermediate",
  "metadata": {
    "bpm": 60,
    "key": "C minor",
    "duration": 120,
    "instruments": ["pad", "drone"]
  },
  "license": "CC-BY-SA-4.0",
  "upstream": "https://github.com/original/recipe.git",
  "preview": {
    "audio": "preview.mp3",
    "waveform": "waveform.json"
  }
}
```

### How It Works

#### Publishing a Recipe
```bash
# Option 1: CLI tool
$ jamhub publish my-pattern.js
✓ Created repository: github.com/you/my-pattern
✓ Generated audio preview
✓ Pushed to JamHub registry
✓ Recipe live at: jamhub.strudel.cc/you/my-pattern

# Option 2: Web UI
1. Paste code in Strudel REPL
2. Click "Publish to JamHub"
3. Choose: New recipe or Update existing
4. JamHub creates/updates git repo
5. Commits with message
6. Pushes to remote
```

#### Forking a Recipe
```bash
# Real git fork!
$ jamhub fork forestcoder/ambient-forest
✓ Forked to: github.com/you/ambient-forest
✓ Added upstream remote
✓ Clone local copy? [y/n]

# Or just use git directly
$ git clone https://github.com/forestcoder/ambient-forest
$ cd ambient-forest
$ # modify recipe.js
$ git commit -m "Added bass line"
$ git push
$ jamhub sync  # Updates JamHub metadata
```

#### Version Control
```bash
# All standard git operations work
$ git log --oneline
a3b4c5d Added polyrhythmic hi-hats
b2c3d4e Increased reverb on pad
c1d2e3f Initial ambient drone

$ git tag v2.0
$ git push --tags

# View version on JamHub
https://jamhub.strudel.cc/you/recipe@v2.0
```

#### Contributing to Others' Recipes
```bash
# Standard GitHub PR workflow
$ git clone https://github.com/them/cool-pattern
$ git checkout -b add-drums
$ # edit recipe.js
$ git commit -m "Add drum track"
$ git push origin add-drums
$ # Create PR on GitHub
# Author reviews and merges on GitHub
# JamHub automatically syncs updates
```

### JamHub as Git Frontend

**JamHub is a specialized UI layer on top of git**, similar to how GitHub enhances git with:
- Rich preview (audio player, waveform, code viewer)
- Social features (likes, comments, plays)
- Discovery (search, trending, recommendations)
- Analytics (play counts, fork trees)
- Jam rooms (real-time collaboration)

### Integration with Git Platforms

**Multi-Platform Support**
```javascript
// Recipe can live on any git host
jamhub.connect({
  platform: "github",    // or "gitlab", "codeberg", "gitea"
  repo: "user/recipe",
  auth: "token"
})
```

**JamHub Registry**
- Centralized index of all recipes
- Points to git repositories
- Caches metadata for fast search
- Generates audio previews
- Tracks social stats

**Example Registry Entry**
```json
{
  "id": "forestcoder/ambient-forest",
  "git_url": "https://github.com/forestcoder/ambient-forest",
  "platform": "github",
  "stars": 127,
  "forks": 43,
  "plays": 2341,
  "last_updated": "2025-01-20T10:30:00Z",
  "preview_url": "https://cdn.jamhub.cc/previews/forestcoder-ambient-forest.mp3"
}
```

### Benefits of Git-Based Approach

#### For Users
- ✅ **Ownership**: Your recipes are truly yours (git repos)
- ✅ **Portability**: Not locked into JamHub platform
- ✅ **Familiar**: Use git tools you already know
- ✅ **Backup**: Distributed copies everywhere
- ✅ **Privacy**: Can host on private git repos

#### For Developers
- ✅ **CLI workflows**: `jamhub publish`, `jamhub fork`
- ✅ **Git integration**: Works with existing tools
- ✅ **CI/CD**: Auto-test recipes on commit
- ✅ **Collaboration**: Standard PR workflow
- ✅ **History**: Full commit history preserved

#### For the Platform
- ✅ **Scalability**: Git handles storage/versioning
- ✅ **Distributed**: Not a single point of failure
- ✅ **Open**: Can't vendor lock-in users
- ✅ **Standard**: Leverage git ecosystem
- ✅ **Cost**: Don't pay for git storage

### Handling Challenges

#### Audio Previews
**Problem**: Git isn't great for binary files
**Solution**:
- Generate preview on push (GitHub Action / webhook)
- Store previews on CDN, not in git
- Optional: Store in git LFS for portability

```yaml
# .github/workflows/generate-preview.yml
on: push
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Generate audio
        run: jamhub-cli render recipe.js -o preview.mp3
      - name: Upload to CDN
        run: jamhub-cli upload preview.mp3
```

#### Social Features (Likes, Comments)
**Problem**: Git doesn't have likes/comments
**Solution**:
- Store in JamHub database
- Link to git repo URL
- Comments can also be GitHub Issues (optional)

```javascript
// JamHub API stores social data
{
  "repo": "github.com/user/recipe",
  "likes": 127,
  "comments": [
    {
      "user": "someone",
      "text": "Love the bass line!",
      "timestamp": "2025-01-20T10:30:00Z"
    }
  ],
  "plays": 2341
}
```

#### Search & Discovery
**Problem**: Can't search across all git repos efficiently
**Solution**:
- JamHub registry indexes all recipes
- Periodic sync with git remotes
- Webhooks for instant updates
- Cache metadata for fast search

#### Real-Time Collaboration (Jam Rooms)
**Problem**: Git isn't real-time
**Solution**:
- Jam rooms use WebRTC for live collab (separate from git)
- Record every edit as timeline events
- When jam ends, commit to git with full session history
- Jam session = one commit with all contributors + playback data

```bash
# After jam session
$ git log -1
commit a3b4c5d
Author: user1, user2, user3
Date:   Jan 20 10:30:00 2025

    Collaborative jam session

    Co-authored-by: user1 <user1@example.com>
    Co-authored-by: user2 <user2@example.com>
    Co-authored-by: user3 <user3@example.com>
```

**Session Recording Structure**
```
my-recipe/
├── recipe.js              # Final version
├── recipe.json            # Metadata
└── .jamhub/
    └── sessions/
        └── 2025-01-20-session-a3b4c5d.json  # Full session recording
```

### Jam Session Playback (Google Docs-Style History)

**Core Concept**: Record every edit during a jam session so you can:
- Scrub through the timeline like a video
- See who added what and when
- Learn how the pattern evolved
- Jump to any point in the creative process
- Export as educational tutorial

#### Session Recording Data Structure

```typescript
interface JamSession {
  id: string;                    // Unique session ID
  recipe_id: string;             // Recipe this belongs to
  start_time: string;            // ISO timestamp
  end_time: string;              // ISO timestamp
  duration_ms: number;           // Total duration in milliseconds
  participants: Participant[];   // Who was in the session
  initial_state: CodeState;      // Starting code
  final_state: CodeState;        // Ending code
  events: SessionEvent[];        // Every edit/action
  audio_recording?: string;      // URL to audio of full jam
  metadata: SessionMetadata;     // Tags, description, etc.
}

interface Participant {
  user_id: string;
  username: string;
  avatar_url?: string;
  color: string;                 // Unique color for this user's edits
  joined_at: number;             // Milliseconds from session start
  left_at?: number;              // When they left (if before end)
}

interface CodeState {
  code: string;                  // Full code content
  cursor_positions?: {           // Optional cursor tracking
    [user_id: string]: {
      line: number;
      column: number;
    };
  };
}

interface SessionEvent {
  timestamp: number;             // Milliseconds from session start
  type: EventType;
  user_id: string;
  data: EventData;
}

type EventType =
  | "edit"                       // Code change
  | "cursor_move"                // Cursor position change
  | "selection"                  // Text selection
  | "comment"                    // Chat message
  | "play"                       // Started playback
  | "stop"                       // Stopped playback
  | "participant_join"           // User joined
  | "participant_leave";         // User left

// Operational Transform style edits (efficient)
interface EditEvent {
  type: "edit";
  position: number;              // Character position in document
  delete_count: number;          // How many chars to delete
  insert: string;                // Text to insert
  // Alternative: use diff format
  diff?: {
    from_line: number;
    to_line: number;
    removed: string[];
    added: string[];
  };
}

interface CursorMoveEvent {
  type: "cursor_move";
  line: number;
  column: number;
}

interface CommentEvent {
  type: "comment";
  text: string;
  reply_to?: string;             // ID of message replying to
}

interface PlaybackEvent {
  type: "play" | "stop";
  audio_offset?: number;         // Sync with audio recording
}

interface SessionMetadata {
  title: string;
  description?: string;
  tags: string[];
  is_public: boolean;
  featured_moments: FeaturedMoment[];  // Highlights
}

interface FeaturedMoment {
  timestamp: number;             // When in the session
  title: string;                 // "Added bass line"
  description?: string;          // "User2 introduces polyrhythm"
  user_id: string;
}
```

#### Example Session Recording

```json
{
  "id": "session-2025-01-20-xyz",
  "recipe_id": "ambient-collab",
  "start_time": "2025-01-20T14:30:00Z",
  "end_time": "2025-01-20T15:15:00Z",
  "duration_ms": 2700000,
  "participants": [
    {
      "user_id": "user1",
      "username": "forestcoder",
      "color": "#3b82f6",
      "joined_at": 0
    },
    {
      "user_id": "user2",
      "username": "beatmaker",
      "color": "#10b981",
      "joined_at": 120000
    },
    {
      "user_id": "user3",
      "username": "harmonizer",
      "color": "#f59e0b",
      "joined_at": 480000
    }
  ],
  "initial_state": {
    "code": "// Empty canvas\n"
  },
  "final_state": {
    "code": "stack(\n  note('c2 eb2 g2').slow(8).room(0.9),\n  s('bd sd').euclidean(5,8),\n  note('c5(3,8)').scale('C:minor')\n)"
  },
  "events": [
    {
      "timestamp": 0,
      "type": "edit",
      "user_id": "user1",
      "data": {
        "position": 0,
        "delete_count": 0,
        "insert": "note('c2')"
      }
    },
    {
      "timestamp": 1500,
      "type": "play",
      "user_id": "user1",
      "data": {}
    },
    {
      "timestamp": 8000,
      "type": "comment",
      "user_id": "user1",
      "data": {
        "text": "Starting with a low drone"
      }
    },
    {
      "timestamp": 15000,
      "type": "edit",
      "user_id": "user1",
      "data": {
        "position": 10,
        "delete_count": 0,
        "insert": " eb2 g2"
      }
    },
    {
      "timestamp": 22000,
      "type": "edit",
      "user_id": "user1",
      "data": {
        "position": 20,
        "delete_count": 0,
        "insert": ".slow(8)"
      }
    },
    {
      "timestamp": 120000,
      "type": "participant_join",
      "user_id": "user2",
      "data": {}
    },
    {
      "timestamp": 125000,
      "type": "comment",
      "user_id": "user2",
      "data": {
        "text": "Nice! Adding drums"
      }
    },
    {
      "timestamp": 130000,
      "type": "edit",
      "user_id": "user2",
      "data": {
        "diff": {
          "from_line": 1,
          "to_line": 1,
          "removed": ["note('c2 eb2 g2').slow(8)"],
          "added": [
            "stack(",
            "  note('c2 eb2 g2').slow(8),",
            "  s('bd sd')",
            ")"
          ]
        }
      }
    },
    {
      "timestamp": 145000,
      "type": "play",
      "user_id": "user2",
      "data": {}
    },
    {
      "timestamp": 180000,
      "type": "edit",
      "user_id": "user1",
      "data": {
        "position": 58,
        "delete_count": 0,
        "insert": ".room(0.9)"
      }
    }
  ],
  "audio_recording": "https://cdn.jamhub.cc/sessions/2025-01-20-xyz.mp3",
  "metadata": {
    "title": "Ambient Collaboration",
    "description": "Three people building an ambient track together",
    "tags": ["ambient", "collaborative", "tutorial"],
    "is_public": true,
    "featured_moments": [
      {
        "timestamp": 15000,
        "title": "Initial chord established",
        "user_id": "user1"
      },
      {
        "timestamp": 130000,
        "title": "Drums added",
        "description": "beatmaker introduces euclidean rhythm",
        "user_id": "user2"
      },
      {
        "timestamp": 480000,
        "title": "Melody layer",
        "description": "harmonizer adds melodic element",
        "user_id": "user3"
      }
    ]
  }
}
```

#### Playback Engine

**Replaying Session**

```typescript
class SessionPlayer {
  private session: JamSession;
  private currentTime: number = 0;
  private eventIndex: number = 0;
  private currentCode: string;
  private audio?: HTMLAudioElement;

  constructor(session: JamSession) {
    this.session = session;
    this.currentCode = session.initial_state.code;
  }

  // Jump to specific time in session
  seekTo(milliseconds: number) {
    // Reset to initial state
    this.currentCode = this.session.initial_state.code;
    this.eventIndex = 0;

    // Apply all events up to target time
    for (const event of this.session.events) {
      if (event.timestamp > milliseconds) break;
      this.applyEvent(event);
      this.eventIndex++;
    }

    this.currentTime = milliseconds;

    // Sync audio if present
    if (this.audio) {
      this.audio.currentTime = milliseconds / 1000;
    }
  }

  // Play from current position
  play() {
    const startTime = Date.now() - this.currentTime;

    const playLoop = () => {
      const elapsed = Date.now() - startTime;

      // Apply events that should have happened by now
      while (
        this.eventIndex < this.session.events.length &&
        this.session.events[this.eventIndex].timestamp <= elapsed
      ) {
        this.applyEvent(this.session.events[this.eventIndex]);
        this.eventIndex++;
      }

      this.currentTime = elapsed;

      // Continue if not finished
      if (elapsed < this.session.duration_ms) {
        requestAnimationFrame(playLoop);
      }
    };

    // Start audio playback
    this.audio?.play();
    playLoop();
  }

  private applyEvent(event: SessionEvent) {
    if (event.type === "edit") {
      const edit = event.data as EditEvent;
      // Apply operational transform
      this.currentCode =
        this.currentCode.slice(0, edit.position) +
        edit.insert +
        this.currentCode.slice(edit.position + edit.delete_count);

      // Trigger UI update, syntax highlighting, etc.
      this.onCodeChange(this.currentCode, event.user_id);
    }
    // Handle other event types...
  }

  getCurrentState(): PlaybackState {
    return {
      code: this.currentCode,
      time: this.currentTime,
      progress: this.currentTime / this.session.duration_ms,
      currentEvent: this.session.events[this.eventIndex - 1],
      activeParticipants: this.getActiveParticipants(this.currentTime)
    };
  }
}
```

#### UI for Session Playback

**Timeline Scrubber**
```
┌────────────────────────────────────────────────────────┐
│  Session Playback: "Ambient Collaboration"             │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Timeline:                                             │
│  ├────────●─────────●──────────────●──────────────┤   │
│  0:00   2:00      8:00           15:00          45:00  │
│    │      │         │               │                  │
│    │      │         │               └─ Melody added    │
│    │      │         └───────────────── Drums added     │
│    │      └─────────────────────────── Chord expanded  │
│    └────────────────────────────────── Initial note    │
│                                                         │
│  ╔══════════════╗                                      │
│  ║  [▶ Play]    ║  Current: 8:23                       │
│  ║  Speed: 1x   ║  [◄◄] [▶] [►►] [⏹]                  │
│  ╚══════════════╝                                      │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ // Code at 8:23                                  │ │
│  │ stack(                                           │ │
│  │   note('c2 eb2 g2').slow(8).room(0.9),         │ │
│  │   s('bd sd')           ← Added by @beatmaker    │ │
│  │ )                                                │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  Participants (at this moment):                        │
│  ● forestcoder  (active - typing)                     │
│  ● beatmaker    (active - just added drums)           │
│  ○ harmonizer   (not joined yet)                      │
│                                                         │
│  Chat History:                                         │
│  [0:08] forestcoder: Starting with a low drone        │
│  [2:05] beatmaker: Nice! Adding drums                 │
│  [8:15] forestcoder: Love the rhythm!                 │
│                                                         │
└────────────────────────────────────────────────────────┘
```

**Features:**
- Scrub timeline to any point
- See code evolve in real-time
- Color-coded contributions by user
- Synchronized audio playback
- Chat messages appear at right times
- Highlight featured moments
- Variable playback speed (0.5x, 1x, 2x)
- Export segments as tutorials

#### Storage & Optimization

**Efficient Storage**
```javascript
// Original: 45-minute session = ~100MB of events
// Optimized: Compress timeline
{
  "compression": "gzip",
  "events_compressed": "H4sIAAAAAAAA...",  // Base64 gzipped
  "keyframes": [                           // Snapshots every 5 min
    {
      "timestamp": 0,
      "code": "// Empty"
    },
    {
      "timestamp": 300000,
      "code": "note('c2 eb2 g2').slow(8)"
    },
    {
      "timestamp": 600000,
      "code": "stack(\n  note('c2 eb2 g2')..."
    }
  ]
}
```

**Fast Seeking**
- Store keyframes (code snapshots) every N minutes
- When seeking, load nearest keyframe
- Apply events from keyframe to target time
- Much faster than replaying from start

#### Use Cases

**1. Learning by Watching**
```
Student: "How did they build this track?"
→ Open session playback
→ Watch pattern emerge line by line
→ See decision-making process
→ Pause and copy techniques
```

**2. Code Review**
```
Teacher: "Let's review your jam session"
→ Scrub to interesting moments
→ Discuss why certain choices were made
→ Highlight good patterns
→ Suggest improvements
```

**3. Tutorial Creation**
```
Expert: Creates track in jam room
→ Session auto-recorded
→ Add featured moments after
→ Publish as tutorial
→ Students follow along step-by-step
```

**4. Performance Documentation**
```
Live coder: Performs at event
→ Session recorded with audio
→ Published for fans
→ Can see exact code they performed
→ Others can fork and remix
```

**5. Debugging**
```
Collaborator: "When did the bug get introduced?"
→ Scrub through timeline
→ Find exact moment pattern broke
→ See who made the change
→ Understand context
→ Fix properly
```

#### Integration with Git

**After Jam Session Ends**
```bash
$ jamhub commit-session

✓ Compressed session recording (45 min → 2.3 MB)
✓ Generated keyframes (every 5 minutes)
✓ Extracted final code to recipe.js
✓ Created session file: .jamhub/sessions/2025-01-20.json
✓ Committed to git with all contributors

Files changed:
  recipe.js                              (final code)
  .jamhub/sessions/2025-01-20.json      (session recording)

Git commit: a3b4c5d
Message: Collaborative jam session
Co-authored-by: forestcoder <...>
Co-authored-by: beatmaker <...>
Co-authored-by: harmonizer <...>
```

**Session stays in git repo**
- Travel with the recipe
- Version controlled
- Can diff sessions
- Export/import easily
- Clone includes all sessions

#### API Endpoints

```typescript
// Fetch session recording
GET /api/recipes/:id/sessions/:session_id
Response: JamSession

// List all sessions for recipe
GET /api/recipes/:id/sessions
Response: JamSession[]

// Get code state at specific time
GET /api/recipes/:id/sessions/:session_id/at/:milliseconds
Response: {
  code: string,
  participants: string[],
  recent_events: SessionEvent[]
}

// Get featured moments
GET /api/recipes/:id/sessions/:session_id/highlights
Response: FeaturedMoment[]

// Export session as video
POST /api/recipes/:id/sessions/:session_id/export
Body: { format: "video" | "gif", fps: 30 }
Response: { video_url: string }
```

#### Future Enhancements

**Time-Travel Debugging**
```
1. Load session at any point
2. Modify code
3. Create alternate timeline (branch)
4. Compare outcomes
5. Merge best parts
```

**AI Analysis**
```
"Show me all moments where drums were modified"
"Find where @beatmaker added effects"
"Highlight sections with most activity"
"Generate summary of session"
```

**Social Features**
```
"🔥 Hot moment at 8:23!" (upvote interesting parts)
"💡 Learn from this" (bookmark techniques)
"🎓 Turn into lesson" (educational extraction)
```

This turns every jam session into a rich, replayable learning experience! 🎬🎵

### CLI Tool: `jamhub-cli`

```bash
# Installation
$ npm install -g jamhub-cli

# Authentication
$ jamhub login
? Platform: GitHub
? Token: ****
✓ Authenticated as: username

# Publish recipe
$ jamhub publish pattern.js
? Name: my-techno-beat
? Description: Fast techno with acid bass
? Tags: techno, acid, 140bpm
? License: CC-BY-SA-4.0
? Visibility: public
✓ Created repo: github.com/username/my-techno-beat
✓ Generated preview audio
✓ Published to JamHub
→ https://jamhub.strudel.cc/username/my-techno-beat

# Browse recipes
$ jamhub search "ambient"
🎵 Found 234 recipes:
  1. forestcoder/ambient-forest (127 ⭐)
  2. droner/deep-space (89 ⭐)
  3. pad-master/ocean-waves (67 ⭐)

# Clone and play
$ jamhub clone forestcoder/ambient-forest
✓ Cloned to: ./ambient-forest
$ cd ambient-forest
$ jamhub play
🔊 Playing recipe.js...
   Press Ctrl+C to stop

# Fork recipe
$ jamhub fork forestcoder/ambient-forest
✓ Forked to: github.com/username/ambient-forest
$ cd ambient-forest
$ vim recipe.js  # make changes
$ git commit -am "Added bass line"
$ jamhub push
✓ Pushed to GitHub
✓ Updated JamHub registry
✓ Generated new preview

# Stats
$ jamhub stats
Your Recipes:
  my-techno-beat: 45 plays, 12 likes, 3 forks
  ambient-fork: 23 plays, 8 likes, 1 fork

# Trending
$ jamhub trending
🔥 Trending Today:
  1. beatmaker/techno-template (301 plays today)
  2. jazzer/chord-pack (156 plays today)
  3. experimental/glitch-art (98 plays today)
```

### Web UI Integration

**Seamless Git Operations**
```
1. User clicks "Fork" on JamHub web
2. JamHub calls GitHub API to fork repo
3. User makes changes in web editor
4. Click "Save" commits to git
5. Preview regenerates automatically
```

**Authentication**
- OAuth with GitHub/GitLab/Codeberg
- No separate account needed
- Use git platform identity

**Hybrid Approach**
- Technical users: Use git directly
- Casual users: Never see git (JamHub handles it)
- Both workflows supported

### Recipe Discovery Flow

```
1. User searches "ambient" on JamHub
2. JamHub queries registry database (fast)
3. Returns cached metadata + preview URLs
4. User clicks recipe
5. JamHub shows:
   - Audio player (CDN)
   - Code viewer (fetch from git)
   - Fork tree (computed from git remotes)
   - Stats (JamHub database)
6. User clicks "View on GitHub"
   → Opens actual git repo
7. User clicks "Fork"
   → JamHub forks via GitHub API
   → Updates registry
```

### Technology Stack (Git-Based)

### Frontend
- **Strudel Core** - Pattern engine
- **React** - UI framework
- **TypeScript** - Type safety
- **Monaco Editor** - Code editing
- **TanStack Query** - Data fetching
- **WebRTC** - Real-time collaboration
- **Tone.js** - Audio processing

### Backend
- **Node.js/Deno** - API server
- **PostgreSQL** - Registry index, social data
- **Redis** - Caching, sessions
- **GitHub/GitLab API** - Git operations
- **Algolia/Meilisearch** - Search
- **WebSocket** - Jam room coordination

### Infrastructure
- **Git Platforms** - Recipe storage (GitHub/GitLab/Codeberg)
- **CDN** - Audio preview delivery (Cloudflare R2)
- **Workers** - Audio rendering (Cloudflare Workers)
- **Webhooks** - Auto-sync on git push
- **GitHub Actions** - CI/CD for recipes

### Recipe CI/CD Pipeline

```yaml
# .jamhub/validate.yml (in each recipe repo)
name: Validate Recipe
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Validate Strudel syntax
        run: jamhub-cli validate recipe.js

      - name: Generate preview
        run: jamhub-cli render recipe.js -o preview.mp3

      - name: Check duration
        run: jamhub-cli check-duration preview.mp3 --max 300

      - name: Upload preview
        if: github.ref == 'refs/heads/main'
        run: jamhub-cli upload preview.mp3 --cdn

      - name: Update registry
        if: github.ref == 'refs/heads/main'
        run: jamhub-cli sync
```

### Federation & Decentralization (Codeberg/Forgejo Approach)

#### Build JamHub as Forgejo Plugin

**Why Forgejo?**
- ✅ **Open source** - AGPL, community-driven, no corporate control
- ✅ **Federation ready** - ActivelyPub/ForgeFed in development
- ✅ **Self-hostable** - Lightweight, easy to install
- ✅ **Git-native** - Built on git, perfect for recipes
- ✅ **Privacy-focused** - Non-profit (Codeberg e.V.)
- ✅ **Proven** - Powers Codeberg.org and many instances

**JamHub = Forgejo + Music-Specific Extensions**

```
Forgejo Core (git hosting, users, repos)
    +
JamHub Plugin
    ├── Audio preview generation
    ├── Pattern visualization
    ├── Music metadata extraction
    ├── Real-time jam rooms
    ├── Recipe discovery UI
    └── Strudel integration
```

#### Federation via ActivityPub/ForgeFed

**Discover Recipes Across Instances**

```
User on jamhub.strudel.cc
    ↓ searches for "ambient"
    ↓ federated search
    ├→ jamhub.strudel.cc (local)
    ├→ forge.musiccommunity.org (federated)
    ├→ codeberg.org (if JamHub plugin installed)
    └→ your-company.com/jamhub (private instance)

Results from ALL instances!
```

**ActivityPub Integration**
- Follow users across instances
- Star/like recipes from any instance
- Fork across instances (git remotes)
- Comment federation
- Notifications across instances

**Example Federation Flow**
```
1. User on Instance A stars recipe on Instance B
2. Instance A sends ActivityPub "Like" activity to Instance B
3. Instance B increments star count
4. Recipe author gets notification (even if on Instance C)
5. Activity appears in federated timeline
```

#### Self-Hosting & Community Governance

**Non-Profit, Community-Driven**
- JamHub under open governance (like Forgejo)
- No corporate control
- Community decides features
- Transparent development
- AGPL license (must stay open)

**Easy Self-Hosting**
```bash
# Install Forgejo with JamHub plugin
$ docker run -d \
    -p 3000:3000 \
    -v ./data:/data \
    forgejo/forgejo:latest-jamhub

# Or add JamHub to existing Forgejo
$ forgejo plugin install jamhub
✓ JamHub plugin installed
✓ Audio preview worker started
✓ Recipe discovery enabled

# Your recipes stay on your server
# But discoverable via federation
```

**Multiple Deployment Options**

1. **Official JamHub Instance** (`jamhub.strudel.cc`)
   - Run by Strudel community
   - Public recipes
   - Free for everyone
   - Federated with other instances

2. **Codeberg with JamHub** (`codeberg.org`)
   - JamHub plugin available
   - Use your Codeberg account
   - Recipes are Codeberg repos
   - Optional: Enable music features

3. **Self-Hosted Private**
   - Your own Forgejo + JamHub
   - Internal recipes only
   - Can federate if desired
   - Full control

4. **Educational/Institutional**
   - School/university instance
   - Student accounts
   - Private + public recipes
   - Federate with main instance

#### Recipe Repository on Forgejo

**Standard Forgejo Features Work**
```
Your recipe at: codeberg.org/you/my-recipe

✓ Git repository
✓ Issues for feedback
✓ Pull requests for contributions
✓ Actions/CI for audio generation
✓ Wiki for documentation
✓ Releases for versions
✓ Stars & forks
✓ Topics/tags

+ JamHub Extensions:
✓ Audio preview player
✓ Pattern visualization
✓ One-click remix (fork + edit)
✓ Jam room button
✓ Recipe metadata display
```

**JamHub UI Enhancements**

When viewing a recipe repository, JamHub plugin adds:
- **Audio player** at top of README
- **"Play in Strudel"** button
- **"Remix This"** quick fork
- **Pattern visualizer** tab
- **Join Jam Room** button
- **Recipe metadata** sidebar
- **Similar recipes** suggestions

#### Federation Protocol: ForgeFed + MusicFed

**Extending ForgeFed for Music**

ForgeFed handles:
- User identity across instances
- Repository federation
- Issues and PRs across instances
- Activity streaming

**MusicFed Extension** (JamHub-specific):
```json
{
  "@context": ["https://www.w3.org/ns/activitystreams", "https://forgefed.org/ns", "https://jamhub.org/ns/musicfed"],
  "type": "Recipe",
  "id": "https://jamhub.strudel.cc/user/recipe",
  "name": "Ambient Forest",
  "attributedTo": "https://jamhub.strudel.cc/users/forestcoder",
  "content": "note('c2 eb2 g2').slow(8).room(0.9)",
  "mediaType": "application/strudel+javascript",
  "preview": {
    "type": "Audio",
    "mediaType": "audio/mpeg",
    "url": "https://cdn.jamhub.cc/previews/abc123.mp3"
  },
  "musicMetadata": {
    "bpm": 60,
    "key": "C minor",
    "difficulty": "intermediate",
    "tags": ["ambient", "drone"]
  },
  "upstreamRecipe": "https://other-instance.org/original/recipe"
}
```

**Federated Actions**
- ⭐ Star recipe on remote instance
- 🍴 Fork recipe to your instance
- 💬 Comment from any instance
- 👤 Follow creator across instances
- 🔔 Get notifications everywhere
- 🎵 Stream audio from any instance
- 🎸 Join jam rooms cross-instance

#### Architecture Comparison

**Traditional Approach (GitHub-style)**
```
┌─────────────────────────────────────┐
│        Central JamHub Server        │
│  (owns all data, single point of   │
│   failure, vendor lock-in risk)     │
└─────────────────────────────────────┘
         ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
     All users connect here
```

**Codeberg/Forgejo Approach (Federated)**
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ jamhub.      │←→  │ codeberg.org │←→  │ your-company │
│ strudel.cc   │    │ /jamhub      │    │ .com/jamhub  │
└──────────────┘    └──────────────┘    └──────────────┘
    ↑↑↑                 ↑↑↑                 ↑↑↑
  Users A             Users B             Users C

All instances communicate via ActivityPub/ForgeFed
Users can discover recipes across ALL instances
No single point of failure
No vendor lock-in
```

#### Benefits of Forgejo-Based Approach

**For Users**
- ✅ Choose your instance (or run your own)
- ✅ One account works everywhere (federation)
- ✅ Data stays where you want it
- ✅ Can't be deplatformed arbitrarily
- ✅ Privacy-respecting (no tracking)
- ✅ Familiar git workflow

**For Developers**
- ✅ Build on proven platform (Forgejo)
- ✅ Don't reinvent git hosting
- ✅ Plugin architecture (maintainable)
- ✅ Active upstream community
- ✅ Federation built-in
- ✅ Open source forever (AGPL)

**For Communities**
- ✅ Run instance for your community
- ✅ Set your own rules/moderation
- ✅ Still connected to wider network
- ✅ Control your infrastructure
- ✅ No external dependencies

**For Platform**
- ✅ No single point of failure
- ✅ Scales horizontally (more instances)
- ✅ Lower hosting costs (distributed)
- ✅ Can't be shut down (decentralized)
- ✅ Community-governed (like Forgejo)

#### Implementation Strategy

**Phase 1: Forgejo Plugin Prototype (2-3 months)**
```bash
$ forgejo plugin scaffold jamhub
$ cd jamhub-plugin/

Structure:
├── plugin.toml              # Plugin manifest
├── hooks/                   # Forgejo hooks
│   ├── post-receive.sh      # Generate audio on push
│   └── pre-render.js        # Add audio player to UI
├── api/                     # REST/ActivityPub endpoints
│   ├── recipes.ts           # Recipe metadata API
│   └── federation.ts        # MusicFed protocol
├── ui/                      # Frontend components
│   ├── AudioPlayer.tsx
│   ├── PatternViz.tsx
│   └── JamRoomButton.tsx
└── workers/
    └── audio-renderer.ts    # Background audio generation
```

**Phase 2: Core Features (3-4 months)**
- Audio preview generation on push
- Pattern visualization
- Recipe metadata extraction
- Discovery UI (search, browse)
- One-click remix (fork + edit)
- Basic federation (cross-instance discovery)

**Phase 3: Real-Time Features (2-3 months)**
- Jam rooms (WebRTC)
- Multi-user editing
- Federated jam invites
- Live collaboration

**Phase 4: Advanced Federation (2-3 months)**
- Full ActivityPub integration
- Cross-instance follows
- Federated notifications
- Instance-to-instance trust

**Phase 5: Ecosystem Growth (Ongoing)**
- More instances launch
- Community plugins
- Educational integrations
- Mobile apps (via Forgejo API)

#### Governance Model (Codeberg e.V. Approach)

**JamHub as Community Project**

Similar to [Forgejo's governance](https://forgejo.org/), JamHub should:

1. **Non-profit foundation**
   - Under Strudel Foundation or similar
   - Or join Codeberg e.V. as sub-project
   - Transparent finances
   - Community-elected board

2. **Open decision-making**
   - RFCs for major features
   - Public roadmap
   - Community votes on direction
   - No corporate veto power

3. **Contributor diversity**
   - Code of conduct
   - Mentorship programs
   - No single-company control
   - Open to all contributors

4. **Sustainable funding**
   - Donations (NLnet, NGI, foundations)
   - Optional hosting fees (instances)
   - No VC funding (to avoid incentive misalignment)
   - Grants for development

#### Migration Path

**Option A: Start with Forgejo from Day 1**
```
1. Fork Forgejo
2. Add JamHub plugin
3. Deploy jamhub.strudel.cc
4. Recruit early adopters
5. Iterate on features
```

**Option B: Build Standalone, Migrate Later**
```
1. Build JamHub as standalone app
2. Prove the concept
3. Extract to Forgejo plugin
4. Migrate data
5. Enable federation
```

**Recommendation: Option A (Forgejo-first)**
- Faster time to market (don't build git hosting)
- Federation from the start
- Community-aligned from day 1
- Lower maintenance burden
- Proven infrastructure

#### Example: JamHub on Codeberg

**Vision**: User visits `codeberg.org/you/ambient-recipe`

What they see:
```
┌─────────────────────────────────────────────────────┐
│ codeberg.org/you/ambient-recipe                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🎵 [Audio Player]  ━━━━━━━━━━○──────  1:23 / 2:00  │
│                                                      │
│  [▶ Play in Strudel]  [🍴 Remix]  [🎸 Jam Room]    │
│                                                      │
│  📊 Pattern Visualization                           │
│  [Waveform display]                                  │
│                                                      │
│  📁 Files        🔔 Issues       🔀 Pull Requests   │
│  ├── recipe.js                                      │
│  ├── recipe.json                                    │
│  └── README.md                                      │
│                                                      │
│  📖 README.md                                       │
│  # Ambient Recipe                                   │
│  Slow evolving ambient pad...                       │
│                                                      │
│  ──────────────────────────────────────────────────│
│  Sidebar:                                           │
│  🏷️ Tags: ambient, drone, slow                     │
│  🎹 Key: C minor                                    │
│  ⏱️ BPM: 60                                         │
│  📊 Difficulty: Intermediate                        │
│  ⭐ Stars: 127                                      │
│  🍴 Forks: 43                                       │
│  🎵 Plays: 2,341                                    │
│                                                      │
│  🔗 Similar Recipes:                                │
│  → other-user/deep-space                           │
│  → another-user/ocean-waves                        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

Standard Codeberg features + JamHub enhancements = Perfect combo!

#### Related Initiatives

- [Forgejo Federation](https://codeberg.org/forgejo-contrib/federation) - ActivityPub implementation
- [ForgeFed](https://forgefed.org/) - Federation protocol for forges
- [Codeberg e.V.](https://codeberg.org/) - Non-profit running public Forgejo
- [ActivityPub](https://www.w3.org/TR/activitypub/) - W3C standard for federation

**Let's make music creation as distributed as git itself.** 🚀

## Competitive Landscape

### Similar Platforms (and how JamHub differs)

**Shadertoy (shader sharing)**
- ✅ Code-centric community
- ❌ No audio, no collaboration
- 🎯 JamHub adds: Real-time jamming, audio focus

**CodePen (web dev sharing)**
- ✅ Fork and remix culture
- ❌ Not music-specific, no versioning
- 🎯 JamHub adds: Audio-first, version control

**SoundCloud (music sharing)**
- ✅ Huge music community
- ❌ No code, can't see how it's made
- 🎯 JamHub adds: Full code access, remix capability

**GitHub (code sharing)**
- ✅ Version control, forking
- ❌ Not audio-friendly, high barrier
- 🎯 JamHub adds: Audio previews, music-specific tools

**Discord/Forums (community)**
- ✅ Active live coding community
- ❌ Ephemeral, hard to search, no versioning
- 🎯 JamHub adds: Permanent, organized, discoverable

## Call to Action

JamHub positions Strudel not just as a learning tool or solo creative environment, but as a **social creative platform**. It answers the question: "What happens after I learn Strudel?"

The answer: **You join a community, share your voice, and jam with the world.**

---

## Conclusion

JamHub transforms Strudel from a tool into a movement. By combining:
- **GitHub's** collaborative coding culture
- **SoundCloud's** music sharing ethos
- **Google Docs'** real-time collaboration
- **TikTok's** remix and discovery mechanics

We create a unique platform where:
- Code is music
- Music is code
- Everyone can contribute
- Creativity is collaborative
- Learning never stops

**JamHub: Where recipes become symphonies, and coders become composers.**

---

## Next Steps

1. **Community Validation**
   - Share this vision with Strudel Discord
   - Gather feedback from active users
   - Identify must-have features for MVP

2. **Technical Proof of Concept**
   - Build recipe storage system
   - Test audio preview generation
   - Prototype forking mechanism

3. **Design Mockups**
   - Recipe gallery interface
   - Recipe detail page
   - Jam room UI
   - Profile pages

4. **MVP Scope Definition**
   - What's in Phase 1?
   - What can wait?
   - 3-month timeline

**Ready to build the future of collaborative live coding?**
