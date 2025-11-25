# Teaching Music Theory with Strudel: Research & Resources

## What is Strudel?

Strudel is a browser-based live coding environment that ports TidalCycles pattern language to JavaScript. It requires no installation and makes sound directly in the browser, making it ideal for classroom settings.

## Educational Resources & Courses

### Official Learning Materials

- [Interactive Workshop](https://strudel.cc/workshop/getting-started/) - The recommended starting point
- [Mini-Notation Tutorial](https://strudel.cc/learn/mini-notation/) - Core pattern syntax
- [First Sounds](https://strudel.cc/workshop/first-sounds/) & [First Notes](https://strudel.cc/workshop/first-notes/) - Beginner tutorials
- [Awesome Strudel Collection](https://github.com/terryds/awesome-strudel) - Curated resources

### Courses & Workshops

- Music Hackspace offers [multiple live coding courses](https://musichackspace.org/product/live-coding-compositions-in-strudel/)
- University institutions like [University of Oslo](https://www.hf.uio.no/imv/english/research/networks/creative-computing-hub-oslo/pages/c2ho-workshops/strudel-workshop.html) run workshops
- Free beginner courses on YouTube and various platforms

## Music Theory Integration

### Key Strengths

- **No theory required**: You don't need to know traditional music theory terms to start
- **Pattern-based learning**: Focuses on algorithmic patterns that teach concepts like repetition, interference patterns, and expectation
- **Euclidean rhythms**: Uses mathematical distribution of beats that naturally occurs across musical cultures
- **Immediate feedback**: Code changes morph the music instantly, reinforcing cause-and-effect

## Syntax Overview (Mini-Notation)

| Syntax | Purpose | Music Theory Concept |
|--------|---------|---------------------|
| `note("c e g b")` | Space-separated notes | Melodic sequences |
| `[b4 c5]` | Nested sequences | Subdivisions/rhythm |
| `<e5 b4 d5>` | Angle brackets | Pattern alternation per cycle |
| `[g3,b3,e4]` | Commas | Chords (harmony) |
| `~` | Rest | Silence/rests |
| `*2` or `/2` | Multiply/divide | Tempo manipulation |
| `@2` | Weight | Duration/emphasis |
| `?0.5` | Probability | Randomness/variation |
| `(3,8,0)` | Euclidean rhythm | Distributed beat patterns |

### Detailed Mini-Notation Syntax Rules

#### Core Concepts

**Cycles**: "Each space-separated note in this sequence is an _event_. The time duration of each event is based on the speed or tempo of the cycle, and how many events are present."

Time remains constant while event duration adjusts based on sequence length.

#### Syntax Elements

| Symbol | Function | Example |
|--------|----------|---------|
| **Space** | Separates events in sequence | `note("c e g b")` |
| **[]** | Nests sequences; subdivides time | `note("e5 [b4 c5] d5")` |
| **<>** | Angle brackets; treats length by event count | `note("<e5 b4 d5 c5>")` |
| **\*** | Multiplies speed | `note("[e5 b4]*2")` |
| **/** | Divides speed/extends duration | `note("[e5 b4]/2")` |
| **,** | Creates chords/parallel notes | `note("[g3,b3,e4]")` |
| **~** | Rest; creates silence | `note("[b4 [~ c5] d5 e5]")` |
| **@** | Assigns temporal weight | `note("<[g3,b3,e4]@2 [a3]>")` |
| **!** | Repeats without acceleration | `note("<[g3,b3,e4]!2 [a3]>")` |
| **?** | 50% chance removal; ?0.1 = 10% chance | `note("[g3,b3,e4]*8?0.1")` |
| **\|** | Random selection between options | `note("[g3|b3|e4]")` |
| **(n,m,o)** | Euclidean rhythm: beats, segments, offset | `s("bd(3,8,0)")` |

#### Quoting Methods

- **Backticks**: Parse multi-line mini-notation
- **Double quotes**: Parse single-line mini-notation
- **Single quotes**: Plain strings; no parsing

#### Music Theory Applications

**Euclidean Rhythms**: The notation creates mathematically-derived patterns found across musical cultures. The "Pop Clave" (`bd(3,8,0)`) demonstrates how three beats distributed across eight segments produce recognizable rhythmic structures without manual sequencing.

**Polyphonic Layering**: Commas enable chords while nested brackets allow melodic/rhythmic independence within unified cycle timing.

## Research & Outcomes

A [Chalmers University study](https://research.chalmers.se/publication/541425/file/541425_Fulltext.pdf) on teaching Strudel to girls aged 10-15 found:

### Pedagogical Approach

The study emphasizes **curiosity-based learning** as a valuable instructional method. The teaching philosophy acknowledges that students learn effectively when their natural inquisitiveness drives engagement with programming concepts through creative music-making activities.

### Key Outcomes

- **Music-Programming Integration**: Students successfully practiced Strudel while developing practical skills in organizing and executing coding workshops
- **Performance Practice**: The research documents how young learners experienced "dialogic liveliness through performance practice"
- **Technical & Logistical Competencies**: Findings highlight that organizing such educational activities requires attention to both technical instruction and practical workshop management
- Initial results from the Creative Coding course at Chalmers University of Technology showed promise, celebrated through public concerts featuring student work

### Pedagogical Recommendations

The study presents several best practices:
- Structure courses around student curiosity and creative expression
- Use performance-based assessment and public sharing
- Design activities allowing immediate creative feedback
- Balance technical coding instruction with musical exploration

### Notable Challenge

The research reflects on how educators must simultaneously teach programming fundamentals while maintaining engagement through musical creativity, requiring careful instructional design to serve both objectives effectively.

## Community & Development

The platform is [free and open source](https://github.com/tidalcycles/strudel), with active community discussions about pedagogy and workshop materials. Multiple educators are developing teaching approaches for both beginners and experts.

## Why It Works for Education

1. **Low barrier to entry**: Browser-based, no installation
2. **Immediate gratification**: Hear results instantly
3. **Creative freedom**: Express musical ideas through code
4. **Dual learning**: Teaches programming AND music simultaneously
5. **Live coding culture**: Students can perform their code publicly

## Additional Resources

- [Beats, Bytes, and Basslines: Introduction to Strudel](https://mirakl.tech/beats-bytes-and-basslines-an-introduction-to-live-coding-with-strudel-cc-4d378e86d5b7)
- [Week 10 - Strudel Musical Pattern Language](https://leetusman.com/dmsc_spring2025/music-pattern-language/)
- [Live Coding Music with Strudel](https://thereallo.dev/blog/live-coding-music-with-strudel)
- [Strudel Live Coding: Your First Beat in 3 Easy Steps](https://universeoftracks.com/guide-strudel-live-coding/)
- [Live Coding Techno With Strudel | Hackaday](https://hackaday.com/2025/10/16/live-coding-techno-with-strudel/)

## Sources

- [Getting Started - Strudel](https://strudel.cc/workshop/getting-started/)
- [Mini Notation Tutorial](https://strudel.cc/learn/mini-notation/)
- [Coding syntax - Strudel](https://strudel.cc/learn/code/)
- [Notes - Strudel](https://strudel.cc/learn/notes/)
- [Teaching Strudel to young girls (Research Paper)](https://research.chalmers.se/publication/541425/file/541425_Fulltext.pdf)
- [Strudel Workshop Discussion](https://github.com/tidalcycles/strudel/discussions/81)
- [Music Hackspace Courses](https://musichackspace.org/product/live-coding-compositions-in-strudel/)
- [University of Oslo Workshop](https://www.hf.uio.no/imv/english/research/networks/creative-computing-hub-oslo/pages/c2ho-workshops/strudel-workshop.html)
- [Awesome Strudel Resources](https://github.com/terryds/awesome-strudel)
- [Strudel REPL](https://strudel.cc/)
