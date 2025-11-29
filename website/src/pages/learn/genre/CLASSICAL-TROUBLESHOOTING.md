# Classical Music Pattern Troubleshooting Guide

This guide covers common issues when working with classical music patterns in Strudel, particularly related to `stack()`, `cat()`, and `slowcat()`.

## Issue 1: `stack()` Compresses Patterns with Different Note Counts

When using `stack()` to play multiple voices simultaneously, **all patterns are compressed to fit the same duration**. If your patterns have different numbers of notes, they will play at different speeds.

### The Problem

```javascript
stack(
  note("a b c d e f g h i j k l"),  // 12 notes
  note("a b c d e f g h")            // 8 notes
)
```

Both patterns are compressed into one cycle:
- The 12-note pattern plays faster (compressed)
- The 8-note pattern plays at normal speed
- They don't align musically!

### The Solution

Make sure all patterns in a `stack()` have the same number of notes:

```javascript
stack(
  note("a b c d e f g h"),  // 8 notes
  note("e f g a b c d e")   // 8 notes
)
```

Now both voices play at the same speed and align properly.

### Common Pattern: Fugue Expositions

For fugue expositions with sequential entries, use `cat()` instead of `stack()` with rests:

**WRONG: Different lengths compress**

```javascript
stack(
  note("subject 8 notes"),
  note("~ ~ ~ ~ ~ ~ ~ ~ answer 8 notes"),  // 16 notes total - compresses!
  note("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ subject 8 notes")  // 24 notes - compresses even more!
)
```

**RIGHT: Use `cat()` for sequential entries**

```javascript
cat(
  note("subject 8 notes"),  // Cycle 1
  stack(
    note("subject 8 notes"),  // Cycle 2: both 8 notes
    note("answer 8 notes")
  ),
  stack(
    note("subject 8 notes"),  // Cycle 3: all 8 notes
    note("answer 8 notes"),
    note("subject 8 notes")
  )
)
```

---

## Issue 2: `slowcat` with Inner Patterns

When using `slowcat` with sections that contain inner `<>` slowcat patterns (like chord progressions), you need to ensure each section completes its inner pattern before moving to the next section. This requires the `.fast().slow()` pattern.

### The Problem

```javascript
slowcat(
  stack(
    note("..."),
    chord("<D A Bm F#m G D G A>").voicing()  // 8-chord progression
  ),
  stack(
    note("..."),
    chord("<D A Bm F#m G D G A>").voicing()  // 8-chord progression
  )
)
```

Without `.fast()`, each section would only play a fraction of its chord progression before moving to the next section.

### The Solution

```javascript
slowcat(
  stack(
    note("..."),
    chord("<D A Bm F#m G D G A>").voicing()
  ).fast(8),  // 8 matches the number of chords
  stack(
    note("..."),
    chord("<D A Bm F#m G D G A>").voicing()
  ).fast(8)   // 8 matches the number of chords
).slow(8)     // Reverse the .fast(8) to restore normal speed
```

### The Rule

1. Count the elements in your inner `<>` pattern (e.g., `<D A Bm F#m G D G A>` = 8 elements)
2. Add `.fast(n)` to each section, where `n` = number of elements
3. Add `.slow(n)` to the outer `slowcat`, where `n` = same number
4. All sections in the same `slowcat` should use the same number (standardize chord progressions if needed)
5. Sections without inner `<>` patterns should NOT use `.fast()`

### Common Mistakes

- Using `.fast(4)` when the chord progression has 8 chords
- Forgetting to match `.fast()` and `.slow()` values
- Using different numbers across sections (standardize first!)
- Adding `.fast().slow()` to patterns with no inner `<>` slowcats

---

## Quick Checklist

### When using `stack()`:
- [ ] Do all patterns have the same number of notes?
- [ ] If not, consider using `cat()` for sequential entries instead
- [ ] Are you using rest patterns (`~`)? This usually indicates you need `cat()` instead

### When using `slowcat()`:
- [ ] Do your sections contain inner `<>` patterns?
- [ ] Have you counted the elements in each `<>` pattern?
- [ ] Does each section use `.fast(n)` where `n` equals the element count?
- [ ] Does the outer `slowcat()` use `.slow(n)` with the same value?
- [ ] Are all chord progressions standardized to the same element count?

### When using `cat()` for fugue expositions:
- [ ] First cycle: Subject alone
- [ ] Second cycle: `stack()` with subject + answer (same note count)
- [ ] Third cycle: `stack()` with all voices (same note count)
- [ ] Avoid rest patterns—use separate cycles instead

---

## Summary

**Key Principle**: In Strudel, patterns are compressed or expanded to fit cycles. To avoid unintended compression:

1. **`stack()`**: All patterns must have the same number of notes
2. **`slowcat()`**: Use `.fast(n).slow(n)` when sections contain inner `<>` patterns
3. **`cat()`**: Use for sequential voice entries instead of `stack()` with rests

These patterns ensure your classical music compositions play with proper timing and alignment!
