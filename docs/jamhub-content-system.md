# JamHub Content System

## Overview

A zero-dependency content management approach using JSON files as the source of truth. Authors create content by editing JSON files (or via a simple admin UI). Renderers are completely decoupled—they infer layout from content structure.

**Design Principles:**
- **Data is just data** — No layout hints, no presentation concerns
- **Files in Git** — Version control, PRs for review, branches for drafts
- **Zero vendor lock-in** — Plain JSON, no proprietary formats
- **Renderer decides layout** — Same content renders differently per platform

---

## Directory Structure

```
content/
├── samples/
│   ├── kick-pattern.json
│   ├── bell-pattern.json
│   └── euclidean-hats.json
├── quizzes/
│   ├── bossa-nova.json
│   └── recreate-rhythm.json
├── lessons/
│   ├── euclidean-101.json
│   └── mini-notation-basics.json
└── courses/
    └── beginner-guide.json
```

Each collection maps to the node types defined in `jamhub-tree-architecture.md`.

---

## Schema Definitions

### Sample (Leaf Node)

```json
{
  "id": "kick-pattern",
  "type": "sample",
  "title": "Basic Kick Pattern",
  "description": "A simple four-on-the-floor kick",
  "code": "sound(\"bd\").fast(4)",
  "bpm": 120,
  "tags": ["drums", "beginner", "techno"]
}
```

### Quiz (Leaf Node)

```json
{
  "id": "bossa-nova",
  "type": "quiz",
  "title": "Build a Bossa Nova",
  "prompt": "Create a bossa nova kick pattern using euclidean rhythms",
  "starterCode": "sound(\"bd\")",
  "targetPattern": "sound(\"bd\").euclid(3, 16)",
  "hints": [
    "Bossa nova typically uses 3 beats spread across 16 steps",
    "Try the euclid function"
  ],
  "validation": "fuzzy"
}
```

### Lesson (Container Node)

```json
{
  "id": "euclidean-101",
  "type": "lesson",
  "title": "Euclidean Rhythms 101",
  "description": "Learn the basics of euclidean rhythm notation",
  "difficulty": "beginner",
  "objectives": [
    "Understand euclidean notation (n, k, offset)",
    "Create distributed beat patterns",
    "Combine euclidean rhythms with other techniques"
  ],
  "content": [
    {
      "type": "text",
      "body": "Euclidean rhythms distribute beats as evenly as possible across a pattern. They're found in music traditions worldwide, from West African bell patterns to Cuban clave."
    },
    {
      "type": "sample",
      "code": "sound(\"bd\").euclid(3, 8)",
      "explanation": "Distributes 3 kicks across 8 steps: [x . . x . . x .]"
    },
    {
      "type": "ref",
      "collection": "samples",
      "id": "bell-pattern"
    },
    {
      "type": "heading",
      "text": "Adding Rotation"
    },
    {
      "type": "text",
      "body": "The third parameter rotates the pattern:"
    },
    {
      "type": "sample",
      "code": "sound(\"bd\").euclid(3, 8, 2)",
      "explanation": "Same pattern, rotated 2 steps: [. . x . . x . x]"
    },
    {
      "type": "ref",
      "collection": "quizzes",
      "id": "bossa-nova"
    }
  ]
}
```

### Course (Container Node)

```json
{
  "id": "beginner-guide",
  "type": "course",
  "title": "Beginner's Guide to Strudel",
  "description": "A complete introduction to live coding with Strudel",
  "difficulty": "beginner",
  "prerequisites": [],
  "content": [
    {
      "type": "ref",
      "collection": "lessons",
      "id": "mini-notation-basics"
    },
    {
      "type": "ref",
      "collection": "lessons",
      "id": "euclidean-101"
    }
  ]
}
```

---

## Block Types

Content is composed of **blocks**. Each block has a `type` field.

### Embedded Blocks (Inline Content)

| Type | Fields | Description |
|------|--------|-------------|
| `text` | `body` | Prose/explanation |
| `heading` | `text` | Section heading |
| `sample` | `code`, `explanation?` | Inline Strudel pattern |
| `callout` | `body`, `variant?` | Highlighted note (info, warning, tip) |

### Reference Blocks (Links to Other Nodes)

| Type | Fields | Description |
|------|--------|-------------|
| `ref` | `collection`, `id` | Reference to another content node |

References are resolved at render time. The referenced content is fetched and rendered according to its type.

---

## Content Library API

### `lib/content.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';

const CONTENT_DIR = './content';

// Types
export type NodeType = 'sample' | 'quiz' | 'lesson' | 'course';

export interface Sample {
  id: string;
  type: 'sample';
  title: string;
  description?: string;
  code: string;
  bpm?: number;
  tags?: string[];
}

export interface Quiz {
  id: string;
  type: 'quiz';
  title: string;
  prompt: string;
  starterCode?: string;
  targetPattern: string;
  hints?: string[];
  validation: 'exact' | 'fuzzy';
}

export interface Lesson {
  id: string;
  type: 'lesson';
  title: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  objectives?: string[];
  content: Block[];
}

export interface Course {
  id: string;
  type: 'course';
  title: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  content: Block[];
}

export type ContentNode = Sample | Quiz | Lesson | Course;

export type Block =
  | { type: 'text'; body: string }
  | { type: 'heading'; text: string }
  | { type: 'sample'; code: string; explanation?: string }
  | { type: 'callout'; body: string; variant?: 'info' | 'warning' | 'tip' }
  | { type: 'ref'; collection: string; id: string };

// Read operations
export async function getNode<T extends ContentNode>(
  collection: string,
  id: string
): Promise<T> {
  const filePath = path.join(CONTENT_DIR, collection, `${id}.json`);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function listNodes(collection: string): Promise<string[]> {
  const dir = path.join(CONTENT_DIR, collection);
  const files = await fs.readdir(dir);
  return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
}

export async function getAllNodes<T extends ContentNode>(
  collection: string
): Promise<T[]> {
  const ids = await listNodes(collection);
  return Promise.all(ids.map(id => getNode<T>(collection, id)));
}

// Reference resolution
export async function resolveRefs(node: Lesson | Course): Promise<Lesson | Course> {
  const resolvedContent = await Promise.all(
    node.content.map(async (block) => {
      if (block.type === 'ref') {
        const referenced = await getNode(block.collection, block.id);
        return { ...referenced, _ref: { collection: block.collection, id: block.id } };
      }
      return block;
    })
  );
  return { ...node, content: resolvedContent };
}

// Write operations (for admin UI)
export async function saveNode(
  collection: string,
  id: string,
  data: ContentNode
): Promise<void> {
  const filePath = path.join(CONTENT_DIR, collection, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function deleteNode(collection: string, id: string): Promise<void> {
  const filePath = path.join(CONTENT_DIR, collection, `${id}.json`);
  await fs.unlink(filePath);
}
```

---

## Rendering

### Layout Inference

Renderers analyze content structure to determine layout. Authors never specify layout.

```typescript
// lib/layout.ts

interface InferredLayout {
  type: 'page' | 'master-detail' | 'carousel';
}

export function inferLayout(content: Block[]): InferredLayout {
  const types = content.map(b => b.type);

  // Count content types
  const sampleCount = types.filter(t => t === 'sample' || t === 'ref').length;
  const textCount = types.filter(t => t === 'text' || t === 'heading').length;
  const total = content.length;

  // Heuristics
  if (sampleCount >= 4 && sampleCount / total > 0.6) {
    return { type: 'master-detail' };
  }

  if (total <= 5 && sampleCount >= 3) {
    return { type: 'carousel' };
  }

  return { type: 'page' };
}
```

### Platform Adaptation

Same content, different presentation per platform:

| Inferred Layout | Desktop | Mobile |
|-----------------|---------|--------|
| `page` | Scrollable article | Scrollable article |
| `master-detail` | Split pane | Drill-down navigation |
| `carousel` | Horizontal scroll | Swipe cards |

---

## Workflow

### Creating Content

1. **Author** creates/edits JSON file in `content/` directory
2. **Git** tracks changes (commit, PR, review)
3. **Build/Deploy** picks up changes

### Content Review (Optional)

```
feature/new-lesson  →  PR  →  Review  →  Merge to main  →  Deploy
```

### Local Development

```bash
# Edit content
code content/lessons/euclidean-101.json

# Preview locally
npm run dev

# Commit when ready
git add content/
git commit -m "Add euclidean rhythms lesson"
```

---

## Future Considerations

### Adding a Visual Editor

If JSON editing becomes painful, add a simple admin UI:

```
┌─────────────────────────────────────────────────────────┐
│  /admin/lessons/euclidean-101                           │
├─────────────────────────────────────────────────────────┤
│  Title: [Euclidean Rhythms 101                    ]     │
│                                                         │
│  Content:                                               │
│  ┌─ Text ─────────────────────────────────────────┐    │
│  │ Euclidean rhythms distribute beats...          │    │
│  └────────────────────────────────────────────────┘    │
│  ┌─ Sample ───────────────────────────────────────┐    │
│  │ sound("bd").euclid(3, 8)                       │    │
│  └────────────────────────────────────────────────┘    │
│  ┌─ Reference ────────────────────────────────────┐    │
│  │ samples / bell-pattern                         │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  [+ Add Block]                          [Save]          │
└─────────────────────────────────────────────────────────┘
```

The admin UI writes to the same JSON files—it's just a convenience layer.

### Migration to External CMS

If needed later, data can be imported into Payload, Strapi, or any CMS:

```typescript
// scripts/import-to-payload.ts
const lessons = await getAllNodes<Lesson>('lessons');
for (const lesson of lessons) {
  await payload.create({ collection: 'lessons', data: lesson });
}
```

---

## Data Validation Plan

### Approach: Zod Schemas

Use Zod as single source of truth for both TypeScript types and runtime validation.

```
lib/
├── schema.ts        # Zod schemas for all node types and blocks
├── content.ts       # Read/write with validation
└── validate.ts      # CLI validation utilities
```

### Validation Layers

| Layer | When | Purpose |
|-------|------|---------|
| **TypeScript** | Compile time | Type safety in code |
| **Runtime** | Read/write | Validate JSON matches schema |
| **Pre-commit** | Before commit | Catch errors locally |
| **CI** | On PR | Gate merges on valid content |

### What Gets Validated

- **Structure** — Required fields, correct types
- **Constraints** — ID format (`lowercase-with-dashes`), string lengths, enum values
- **References** — All `ref` blocks point to existing content
- **JSON syntax** — Valid JSON before parsing

### Error Messages

```
✗ lessons/euclidean-101.json:
    content.2.id: ID must be lowercase alphanumeric with dashes
    objectives: Required field missing
```

### Implementation Order

1. Define Zod schemas for all node types
2. Wrap content API with `safeParse()` validation
3. Create CLI script for batch validation
4. Add pre-commit hook (Husky)
5. Add GitHub Actions workflow for PRs

---

## Relationship to Other Docs

- **jamhub-tree-architecture.md** — Defines node types and edge semantics
- **jamhub-content-system.md** (this doc) — Implementation details for file-based CMS
- **jamhub-vision.md** — Product vision and goals
