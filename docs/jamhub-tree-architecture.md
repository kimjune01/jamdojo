# JamHub Tree Architecture: Composable Content Nodes

## Overview

JamHub content is organized as a **tree structure** where each node is independently renderable and composable. Nodes can contain other nodes either by **embedding** (child owns the content) or **referencing** (links to external content).

This architecture enables flexible learning paths, content reuse, and arbitrary composition patterns.

---

## Node Types

### Leaf Nodes (Atomic Content)

These are terminal nodes that cannot contain children:

| Type | Description | GitHub Storage | Duration | Example |
|------|-------------|----------------|----------|---------|
| **sample** | A single Strudel pattern/recipe | Repo: `username/sample-name` | 30s - 4min | Kick drum pattern |
| **quiz** | Interactive coding quiz/challenge | Repo: `username/quiz-name` | 2min - 10min | "Recreate this rhythm" |
| **activity** | Guided coding exercise | Repo: `username/activity-name` | 2min - 10min | "Build a bassline" |
| **jam** | Recorded jam session | Repo: `username/jam-name` | 45min - 2.3hr | Live performance |
| **article** | Written explanation/tutorial | Repo: `username/article-name` | N/A (text) | "Understanding Euclidean rhythms" |

### Inner Nodes (Containers)

These nodes contain other nodes (via embedding or references):

| Type | Description | GitHub Storage | Can Contain | Example |
|------|-------------|----------------|-------------|---------|
| **lesson** | Structured learning unit | Repo: `username/lesson-name` | samples, quizzes, activities, articles | "Intro to Mini-Notation" |
| **course** | Collection of lessons | Repo: `username/course-name` | lessons, samples, articles | "Beginner's Guide to Strudel" |
| **collection** | Curated playlist | Repo: `username/collection-name` | Any node type | "Best Ambient 2025" |
| **module** | Thematic grouping | Repo: `username/module-name` | Any node type | "Polyrhythm Techniques" |

---

## Edge Types

### 1. Reference Edge (Link)

A **reference** is a pointer to another GitHub repository. The referenced content is owned by someone else and rendered independently.

```javascript
{
  "edgeType": "reference",
  "target": "jamhub://alice/kick-pattern",  // Reference to alice's sample
  "metadata": {
    "description": "Use this kick pattern",
    "required": true,
    "order": 1
  }
}
```

**Characteristics**:
- Target content is owned by original creator
- Changes to target automatically propagate
- Can reference any public content
- Enables content reuse and attribution

**GitHub Implementation**: Store as JSON reference in parent repo

### 2. Embedded Edge (Child)

An **embedded child** is content directly owned and stored within the parent node.

```javascript
{
  "edgeType": "embedded",
  "content": {
    "type": "sample",
    "code": "sound(\"bd sd\").fast(2)",
    "metadata": { /* ... */ }
  },
  "metadata": {
    "description": "Inline example",
    "order": 1
  }
}
```

**Characteristics**:
- Content is part of parent
- No separate GitHub repo
- Cannot be referenced by others
- Good for small, context-specific examples

**GitHub Implementation**: Store inline in parent's JSON file

---

## Node Schema

Every node (regardless of type) follows this schema:

```typescript
interface JamHubNode {
  // Identity
  id: string;                    // Unique identifier (GitHub repo path for top-level)
  type: NodeType;                // "sample" | "quiz" | "lesson" | "course" | etc.

  // Metadata
  metadata: {
    title: string;
    description: string;
    author: string;
    created: string;             // ISO 8601 timestamp
    updated: string;
    tags: string[];
    difficulty?: 1 | 2 | 3 | 4 | 5;
    license?: string;
  };

  // Content (type-specific)
  content: NodeContent;          // Varies by node type

  // Children (for inner nodes only)
  children?: NodeEdge[];         // Array of references or embedded nodes

  // Audio/Media
  media?: {
    audio?: {
      url: string;               // WebM/Opus audio
      duration: number;
      size: number;
    };
    cover?: string;              // Cover image URL
  };
}

type NodeEdge = ReferenceEdge | EmbeddedEdge;

interface ReferenceEdge {
  edgeType: "reference";
  target: string;                // jamhub://username/content-name
  metadata?: {
    description?: string;
    required?: boolean;
    order?: number;
  };
}

interface EmbeddedEdge {
  edgeType: "embedded";
  content: JamHubNode;           // Full node inline
  metadata?: {
    description?: string;
    order?: number;
  };
}
```

---

## Content Types (Node-Specific)

### Sample Content
```typescript
interface SampleContent {
  code: string;                  // Strudel pattern code
  bpm?: number;
  key?: string;
  instruments?: string[];
}
```

### Quiz Content
```typescript
interface QuizContent {
  prompt: string;                // "Recreate this rhythm using euclidean notation"
  targetPattern: string;         // The correct answer
  hints?: string[];
  validation: "exact" | "fuzzy"; // How to check answers
}
```

### Activity Content
```typescript
interface ActivityContent {
  instructions: string;          // Step-by-step guide
  starterCode?: string;          // Pre-filled code to begin
  solution?: string;             // Example solution
}
```

### Lesson Content
```typescript
interface LessonContent {
  introduction: string;          // Markdown text
  objectives: string[];          // Learning goals
  children: NodeEdge[];          // References to samples, quizzes, etc.
}
```

### Course Content
```typescript
interface CourseContent {
  syllabus: string;              // Markdown overview
  prerequisites?: string[];      // jamhub://... references
  children: NodeEdge[];          // Ordered lessons
}
```

---

## Example Compositions

### Example 1: Simple Lesson (References Only)

```json
{
  "id": "jamhub://alice/euclidean-rhythms-101",
  "type": "lesson",
  "metadata": {
    "title": "Euclidean Rhythms 101",
    "author": "alice",
    "description": "Learn the basics of euclidean rhythm notation"
  },
  "content": {
    "introduction": "Euclidean rhythms distribute beats evenly...",
    "objectives": [
      "Understand euclidean notation (n,m,o)",
      "Create your own distributed beats"
    ]
  },
  "children": [
    {
      "edgeType": "reference",
      "target": "jamhub://bob/basic-euclidean-sample",
      "metadata": {
        "description": "Listen to this example first",
        "order": 1
      }
    },
    {
      "edgeType": "reference",
      "target": "jamhub://carol/euclidean-quiz",
      "metadata": {
        "description": "Test your understanding",
        "order": 2
      }
    }
  ]
}
```

**GitHub Storage**:
```
github.com/alice/euclidean-rhythms-101/
├── lesson.json          # Full node definition
├── README.md            # Human-readable version
└── media/
    └── preview.webm     # Lesson intro audio
```

### Example 2: Course with Mixed References and Embedded Content

```json
{
  "id": "jamhub://dave/strudel-beginners",
  "type": "course",
  "metadata": {
    "title": "Strudel for Beginners",
    "author": "dave",
    "difficulty": 1
  },
  "content": {
    "syllabus": "A complete introduction to live coding with Strudel...",
    "prerequisites": []
  },
  "children": [
    {
      "edgeType": "reference",
      "target": "jamhub://alice/euclidean-rhythms-101",
      "metadata": {
        "description": "Week 1: Rhythm fundamentals",
        "order": 1
      }
    },
    {
      "edgeType": "embedded",
      "content": {
        "type": "activity",
        "metadata": {
          "title": "Quick Exercise",
          "description": "Try this pattern"
        },
        "content": {
          "instructions": "Modify the code to add a snare drum",
          "starterCode": "sound(\"bd bd bd bd\")"
        }
      },
      "metadata": {
        "description": "Week 1 practice",
        "order": 2
      }
    },
    {
      "edgeType": "reference",
      "target": "jamhub://eve/melody-basics",
      "metadata": {
        "description": "Week 2: Melody and harmony",
        "order": 3
      }
    }
  ]
}
```

### Example 3: Collection (Curated Playlist)

```json
{
  "id": "jamhub://frank/best-ambient-2025",
  "type": "collection",
  "metadata": {
    "title": "Best Ambient Patterns of 2025",
    "author": "frank",
    "tags": ["ambient", "experimental", "2025"]
  },
  "content": {
    "description": "My favorite atmospheric patterns from the community"
  },
  "children": [
    {
      "edgeType": "reference",
      "target": "jamhub://grace/forest-sounds",
      "metadata": { "order": 1 }
    },
    {
      "edgeType": "reference",
      "target": "jamhub://henry/drone-layers",
      "metadata": { "order": 2 }
    },
    {
      "edgeType": "reference",
      "target": "jamhub://iris/glacial-pads",
      "metadata": { "order": 3 }
    }
  ],
  "media": {
    "audio": {
      "url": "https://github.com/frank/best-ambient-2025/releases/download/v1.0/mix.webm",
      "duration": 420,
      "size": 5242880,
      "description": "7-minute curated mix featuring excerpts from all samples"
    }
  }
}
```

---

## Rendering Strategy

### Independent Renderability

Every node can be rendered on its own without requiring parent context:

```jsx
// Generic node renderer
function renderNode(node: JamHubNode) {
  switch (node.type) {
    case 'sample':
      return <SamplePlayer node={node} />;
    case 'quiz':
      return <QuizPlayer node={node} />;
    case 'lesson':
      return <LessonPlayer node={node} />;
    case 'course':
      return <CoursePlayer node={node} />;
    case 'collection':
      return <CollectionPlayer node={node} />;
    default:
      return <GenericNodePlayer node={node} />;
  }
}
```

### Recursive Rendering for Containers

```jsx
function LessonPlayer({ node }: { node: JamHubNode }) {
  return (
    <div className="lesson">
      <h1>{node.metadata.title}</h1>
      <p>{node.content.introduction}</p>

      <div className="objectives">
        <h2>Learning Objectives</h2>
        <ul>
          {node.content.objectives.map(obj => <li>{obj}</li>)}
        </ul>
      </div>

      <div className="children">
        {node.children?.map(edge => (
          <ChildNode key={edge.target || edge.content.id} edge={edge} />
        ))}
      </div>
    </div>
  );
}

function ChildNode({ edge }: { edge: NodeEdge }) {
  if (edge.edgeType === 'reference') {
    // Load referenced content from GitHub
    const node = await loadNode(edge.target);
    return (
      <div className="referenced-node">
        <p className="description">{edge.metadata?.description}</p>
        {renderNode(node)}
      </div>
    );
  } else {
    // Render embedded content directly
    return (
      <div className="embedded-node">
        <p className="description">{edge.metadata?.description}</p>
        {renderNode(edge.content)}
      </div>
    );
  }
}
```

---

## GitHub Storage Patterns

### Top-Level Nodes (Have Own Repos)

```
github.com/username/node-name/
├── node.json            # Full node definition
├── README.md            # Human-readable
├── media/
│   ├── preview.webm     # Audio/video
│   └── cover.png        # Cover image
└── .jamhub/
    ├── type.txt         # "lesson" | "course" | "sample" | etc.
    └── stats.json       # Cached stats (views, likes, forks)
```

### Embedded Nodes (No Separate Repo)

Embedded content lives entirely within the parent's `node.json` file.

### Reference Resolution

References use the `jamhub://` protocol:

```
jamhub://username/content-name
    ↓
https://github.com/username/content-name
    ↓
https://raw.githubusercontent.com/username/content-name/main/node.json
```

Frontend resolves these at render time and caches aggressively.

---

## Advantages of This Architecture

### 1. **Flexibility**
- No rigid "layers" - compose arbitrarily
- Can reference content at any level
- Supports multiple learning paths through same content

### 2. **Reusability**
- Same sample can be used in multiple lessons
- Authors build on each other's work via references
- Attribution is automatic (references preserve ownership)

### 3. **Composability**
```
Collection → Lesson → Activity → Sample
         ↘ Lesson → Quiz → Sample
         ↘ Sample (standalone)
```

### 4. **Independent Evolution**
- Referenced content can be updated by owner
- Changes propagate automatically
- Breaking changes are visible (dead references)

### 5. **Simple Mental Model**
- Everything is a node
- Nodes can reference or embed other nodes
- Each node is renderable independently
- Maps naturally to GitHub repos

---

## Implementation Considerations

### 1. **Cycle Detection**

Prevent infinite loops when rendering:

```javascript
function renderNode(node, visited = new Set()) {
  if (visited.has(node.id)) {
    return <ErrorMessage>Circular reference detected</ErrorMessage>;
  }

  visited.add(node.id);

  // Render node and children
  // Pass visited set to child renders
}
```

### 2. **Lazy Loading**

Load referenced content on-demand:

```javascript
function ChildNode({ edge }) {
  const [node, setNode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (edge.edgeType === 'reference') {
      loadNode(edge.target).then(setNode).finally(() => setLoading(false));
    } else {
      setNode(edge.content);
      setLoading(false);
    }
  }, [edge]);

  if (loading) return <Spinner />;
  return renderNode(node);
}
```

### 3. **Caching Strategy**

```javascript
const nodeCache = new Map();

async function loadNode(jamhubUrl) {
  if (nodeCache.has(jamhubUrl)) {
    return nodeCache.get(jamhubUrl);
  }

  const githubUrl = resolveJamhubUrl(jamhubUrl);
  const response = await fetch(githubUrl);
  const node = await response.json();

  nodeCache.set(jamhubUrl, node);
  return node;
}
```

### 4. **Version Pinning** (Future)

Allow references to specific versions:

```javascript
{
  "edgeType": "reference",
  "target": "jamhub://alice/kick-pattern@v2.1.0",  // Pin to version
  "metadata": { /* ... */ }
}
```

Maps to Git tags:
```
https://github.com/alice/kick-pattern/tree/v2.1.0
```

---

## Migration from Layer Architecture

Current "Layer 0-4" architecture maps naturally:

| Old (Layers) | New (Tree) | Change |
|-------------|------------|--------|
| Recipe | `sample` | Rename |
| Exercise | `activity` or `quiz` | Split into two types |
| Lesson | `lesson` | Keep, but now composable |
| Session | `jam` | Rename, leaf node |
| Collection | `collection` | Keep, now generic container |

Add new types:
- `course` - Multi-lesson learning path
- `module` - Thematic grouping
- `article` - Text-only content

---

## Example API

### Fetch a node

```javascript
GET /api/nodes/alice/euclidean-rhythms-101

Response:
{
  "id": "jamhub://alice/euclidean-rhythms-101",
  "type": "lesson",
  "metadata": { /* ... */ },
  "content": { /* ... */ },
  "children": [ /* references and embedded nodes */ ]
}
```

### Traverse the tree

```javascript
GET /api/nodes/alice/euclidean-rhythms-101/children

Response:
{
  "children": [
    {
      "edgeType": "reference",
      "target": "jamhub://bob/basic-euclidean-sample",
      "resolved": {
        "id": "jamhub://bob/basic-euclidean-sample",
        "type": "sample",
        "metadata": { /* ... */ }
      }
    }
  ]
}
```

### Get node tree (fully resolved)

```javascript
GET /api/nodes/alice/euclidean-rhythms-101?expand=true

Response: Full tree with all references resolved recursively
```

---

## Summary

**Core Concept**: JamHub content is a composable tree where:
- **Leaf nodes** are atomic content (samples, quizzes, activities)
- **Inner nodes** are containers (lessons, courses, collections)
- **Edges** are either references (links) or embedded children
- **Every node** is independently renderable and stored in GitHub

This architecture provides maximum flexibility while maintaining simplicity and leveraging GitHub's native features.
