# JamHub Infrastructure: GitHub-Based Data Architecture

## Executive Summary

JamHub uses **GitHub as the primary data store** for all content. Every piece of content (recipes, exercises, lessons, sessions, collections) is stored in GitHub repositories. The frontend (GitHub Pages) reads and renders this content, while all write operations go through GitHub's API.

**Core Principle**: GitHub is the single source of truth. Everything else is a cache or derivative.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub (Source of Truth)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Repos (github.com/username/recipe-name)              │
│  ├── recipe.js                 (Strudel code)              │
│  ├── recipe.json               (Metadata)                  │
│  ├── README.md                 (Description)               │
│  ├── preview.mp3               (Audio, via Releases/LFS)   │
│  └── .jamhub/                  (JamHub-specific data)      │
│      ├── stats.json            (Cached stats)              │
│      └── sessions/             (Jam session recordings)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              GitHub Pages (jamhub.cc)                       │
│              Frontend Static Site                           │
├─────────────────────────────────────────────────────────────┤
│  • React/Vue/Svelte SPA                                     │
│  • Reads from GitHub API                                    │
│  • Renders content                                          │
│  • No backend server                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           Optional: Read-Heavy Optimizations                │
├─────────────────────────────────────────────────────────────┤
│  Search Index (Algolia/Meilisearch)                         │
│  ├── Webhook: GitHub → Index on push                       │
│  └── Fast search across all content                        │
│                                                             │
│  CDN Cache (Cloudflare)                                     │
│  ├── Cache GitHub API responses                            │
│  └── Serve audio files faster                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model: Everything is a GitHub Repository

### Repository Structure

Every node is stored as a GitHub repository with a standardized structure:

```
github.com/username/node-name/
├── node.json               # Full node definition (type, metadata, content, children)
├── README.md               # Human-readable description
├── .jamhub/                # JamHub-specific data (optional)
│   └── stats.json          # Cached statistics (views, likes, forks)
└── media/                  # Audio/visual assets
    └── preview.webm        # Audio (Opus codec)
```

### Node Type Examples

Each node type has specific content structure stored in `node.json`:

#### **Sample (Leaf Node)**
```
github.com/alice/kick-pattern/
├── node.json               # type: "sample", content.code has Strudel pattern
├── README.md
└── media/
    └── preview.webm        # 30s audio preview (64kbps Opus)
```

#### **Quiz (Leaf Node)**
```
github.com/bob/rhythm-quiz-1/
├── node.json               # type: "quiz", content has validation rules
├── README.md
└── media/
    └── walkthrough.webm    # Instructor walkthrough (64kbps Opus)
```

#### **Activity (Leaf Node)**
```
github.com/carol/build-bassline/
├── node.json               # type: "activity", content has starterCode & solution
├── README.md
└── media/
    └── preview.webm        # Activity demo (64kbps Opus)
```

#### **Lesson (Inner Node - Contains References)**
```
github.com/carol/rests-and-silence/
├── node.json               # type: "lesson", children[] with reference edges
├── README.md
└── media/
    └── intro.webm          # Lesson introduction (96kbps Opus)
```

#### **Jam (Leaf Node)**
```
github.com/forestcoder/ambient-jam-jan-2025/
├── node.json               # type: "jam", content has participants
├── README.md
└── media/
    └── session.webm        # Full 45-min recording (48kbps Opus)
```

#### **Collection (Inner Node - Contains References)**
```
github.com/dave/best-ambient-2025/
├── node.json               # type: "collection", children[] with reference edges
├── README.md
└── media/
    └── mix.webm            # Curator's audio mix (96kbps Opus)
```

#### **Course (Inner Node - Contains References)**
```
github.com/alice/strudel-beginners/
├── node.json               # type: "course", children[] with references to lessons
├── README.md
└── media/
    └── intro.webm          # Course introduction (96kbps Opus)
```

---

## CRUD Operations

### Authentication: GitHub OAuth

**All users authenticate via GitHub OAuth**

```javascript
// Frontend: Initiate OAuth flow
function loginWithGitHub() {
  const clientId = 'jamhub-client-id';
  const redirectUri = 'https://jamhub.cc/auth/callback';
  const scope = 'repo,user:email';

  window.location.href =
    `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
}

// After callback, store token
localStorage.setItem('github_token', accessToken);
```

**Required Scopes**:
- `repo` - Create/modify repositories
- `user:email` - Get user email
- `read:user` - Get user profile

### CREATE Operations

**General Pattern**: Creating any node follows the same GitHub workflow:
1. Create repository (`username/node-name`)
2. Add topics for discovery (`jamhub`, node type, tags)
3. Create `node.json` with full node schema
4. Create `README.md`
5. Upload audio to GitHub Releases
6. Push to GitHub

#### **1. Create Sample (Strudel Pattern)**

**User Flow**:
1. User writes code in Strudel REPL on jamhub.cc
2. Clicks "Publish to JamHub"
3. Frontend shows form (title, description, tags, audio upload)
4. User submits

**Backend Flow** (via GitHub API from frontend):

```javascript
// Step 1: Create repository
async function createRecipe(recipeData, githubToken) {
  const octokit = new Octokit({ auth: githubToken });

  // Create repository
  const repo = await octokit.repos.create({
    name: recipeData.slug,  // e.g., "kick-pattern"
    description: recipeData.description,
    auto_init: true,
    private: false
  });

  // Step 2: Add topic tags for discovery
  await octokit.repos.replaceAllTopics({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    names: ['jamhub', 'recipe', ...recipeData.tags]
  });

  // Step 3: Create recipe.js
  await octokit.repos.createOrUpdateFileContents({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    path: 'recipe.js',
    message: 'Initial recipe',
    content: btoa(recipeData.code)  // Base64 encode
  });

  // Step 4: Create recipe.json (metadata)
  const metadata = {
    type: 'recipe',
    title: recipeData.title,
    description: recipeData.description,
    author: repo.data.owner.login,
    version: '1.0.0',
    tags: recipeData.tags,
    difficulty: recipeData.difficulty,
    created: new Date().toISOString(),
    audio: {
      user_uploaded: null,  // Will add via Release
      generated: null
    }
  };

  await octokit.repos.createOrUpdateFileContents({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    path: 'recipe.json',
    message: 'Add metadata',
    content: btoa(JSON.stringify(metadata, null, 2))
  });

  // Step 5: Create README.md
  const readme = `# ${recipeData.title}

${recipeData.description}

## Usage

\`\`\`javascript
${recipeData.code}
\`\`\`

## Metadata
- **Difficulty**: ${recipeData.difficulty}
- **Tags**: ${recipeData.tags.join(', ')}

---

*Created with [JamHub](https://jamhub.cc)*
`;

  await octokit.repos.createOrUpdateFileContents({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    path: 'README.md',
    message: 'Add README',
    content: btoa(readme)
  });

  // Step 6: Create .jamhub directory structure
  await octokit.repos.createOrUpdateFileContents({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    path: '.jamhub/type.txt',
    message: 'Initialize JamHub metadata',
    content: btoa('recipe')
  });

  await octokit.repos.createOrUpdateFileContents({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    path: '.jamhub/stats.json',
    message: 'Initialize stats',
    content: btoa(JSON.stringify({
      plays: 0,
      likes: 0,
      forks: 0,
      last_updated: new Date().toISOString()
    }, null, 2))
  });

  // Step 7: Upload audio (if provided) to GitHub Release
  if (recipeData.audioFile) {
    // Create a release
    const release = await octokit.repos.createRelease({
      owner: repo.data.owner.login,
      repo: repo.data.name,
      tag_name: 'v1.0.0',
      name: 'Initial Release',
      body: 'First version'
    });

    // Upload audio as release asset
    const audioData = await recipeData.audioFile.arrayBuffer();
    await octokit.repos.uploadReleaseAsset({
      owner: repo.data.owner.login,
      repo: repo.data.name,
      release_id: release.data.id,
      name: 'preview.webm',
      data: audioData,
      headers: {
        'content-type': 'audio/webm'
      }
    });

    // Update recipe.json with audio URL
    const recipeJson = await getFileContent(octokit, repo.data.owner.login, repo.data.name, 'recipe.json');
    recipeJson.audio.user_uploaded = {
      url: release.data.assets[0].browser_download_url,
      duration_seconds: recipeData.audioDuration,
      size_bytes: recipeData.audioFile.size
    };

    await updateFileContent(octokit, repo.data.owner.login, repo.data.name, 'recipe.json', recipeJson, 'Add audio preview');
  }

  // Step 8: Trigger GitHub Action to generate auto audio
  // (If no user audio, workflow will generate from code)
  await octokit.actions.createWorkflowDispatch({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    workflow_id: 'generate-preview.yml',
    ref: 'main'
  });

  return repo.data;
}
```

**GitHub Actions Workflow** (in recipe repo):

```yaml
# .github/workflows/generate-preview.yml
name: Generate Audio Preview

on:
  push:
    paths:
      - 'recipe.js'
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Strudel CLI
        run: npm install -g @strudel/cli

      - name: Generate audio preview
        run: |
          strudel render recipe.js -o preview-auto.webm -d 30 --codec opus

      - name: Create or update release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: v${{ github.sha }}
          files: preview-auto.webm
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Update recipe.json with audio URL
        run: |
          # Update recipe.json with new audio URL
          node scripts/update-audio-url.js
```

#### **2. Create Exercise**

```javascript
async function createExercise(exerciseData, githubToken) {
  const octokit = new Octokit({ auth: githubToken });

  // Create repository
  const repo = await octokit.repos.create({
    name: exerciseData.slug,
    description: exerciseData.description,
    auto_init: true
  });

  // Add topics
  await octokit.repos.replaceAllTopics({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    names: ['jamhub', 'exercise', ...exerciseData.tags]
  });

  // Create exercise.json
  const exercise = {
    type: 'exercise',
    exercise_type: exerciseData.exerciseType,  // 'multiple_choice', 'fill_blank', etc.
    title: exerciseData.title,
    question: exerciseData.question,
    correct_answer: {
      recipe_ref: exerciseData.correctRecipeUrl,  // jamhub://recipe/alice/kick-pattern@v2.3
      label: exerciseData.correctLabel
    },
    wrong_answers: exerciseData.wrongAnswers.map(ans => ({
      recipe_ref: ans.recipeUrl,
      label: ans.label
    })),
    settings: exerciseData.settings,
    tags: exerciseData.tags,
    difficulty: exerciseData.difficulty
  };

  await octokit.repos.createOrUpdateFileContents({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    path: 'exercise.json',
    message: 'Create exercise',
    content: btoa(JSON.stringify(exercise, null, 2))
  });

  // Create README.md
  const readme = generateExerciseReadme(exerciseData);
  await octokit.repos.createOrUpdateFileContents({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    path: 'README.md',
    message: 'Add README',
    content: btoa(readme)
  });

  // Store references in .jamhub/
  const references = {
    recipe_refs: [
      exerciseData.correctRecipeUrl,
      ...exerciseData.wrongAnswers.map(a => a.recipeUrl)
    ]
  };

  await octokit.repos.createOrUpdateFileContents({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    path: '.jamhub/references.json',
    message: 'Add references',
    content: btoa(JSON.stringify(references, null, 2))
  });

  // Upload instructor audio if provided
  if (exerciseData.audioFile) {
    await uploadAudioAsRelease(octokit, repo.data, exerciseData.audioFile, 'walkthrough.webm');
  }

  return repo.data;
}
```

#### **3. Create Lesson**

```javascript
async function createLesson(lessonData, githubToken) {
  const octokit = new Octokit({ auth: githubToken });

  const repo = await octokit.repos.create({
    name: lessonData.slug,
    description: lessonData.description,
    auto_init: true
  });

  await octokit.repos.replaceAllTopics({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    names: ['jamhub', 'lesson', ...lessonData.tags]
  });

  // Create lesson.json
  const lesson = {
    type: 'lesson',
    title: lessonData.title,
    description: lessonData.description,
    content: lessonData.content.map(item => {
      if (item.type === 'exercise_ref') {
        return {
          type: 'exercise_ref',
          exercise_ref: item.exerciseUrl  // jamhub://exercise/bob/rhythm-quiz
        };
      } else if (item.type === 'recipe_ref') {
        return {
          type: 'recipe_ref',
          recipe_ref: item.recipeUrl,
          context: item.context
        };
      } else {
        return item;  // Text content
      }
    }),
    learning_objectives: lessonData.objectives,
    prerequisites: lessonData.prerequisites,
    estimated_time_minutes: lessonData.estimatedTime,
    tags: lessonData.tags,
    difficulty: lessonData.difficulty
  };

  await octokit.repos.createOrUpdateFileContents({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    path: 'lesson.json',
    message: 'Create lesson',
    content: btoa(JSON.stringify(lesson, null, 2))
  });

  // Store all references
  const references = {
    exercise_refs: lessonData.content
      .filter(i => i.type === 'exercise_ref')
      .map(i => i.exerciseUrl),
    recipe_refs: lessonData.content
      .filter(i => i.type === 'recipe_ref')
      .map(i => i.recipeUrl)
  };

  await octokit.repos.createOrUpdateFileContents({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    path: '.jamhub/references.json',
    message: 'Add references',
    content: btoa(JSON.stringify(references, null, 2))
  });

  // Upload lesson intro audio
  if (lessonData.audioFile) {
    await uploadAudioAsRelease(octokit, repo.data, lessonData.audioFile, 'intro.webm');
  }

  return repo.data;
}
```

#### **4. Create Session (During Jam)**

Sessions are special - they're created in real-time during jam rooms.

```javascript
async function createSession(sessionData, githubToken) {
  const octokit = new Octokit({ auth: githubToken });

  // Sessions go into a shared organization or user account
  const sessionOrg = 'jamhub-sessions';  // Or user's account
  const sessionName = `${sessionData.date}-${sessionData.slug}`;

  const repo = await octokit.repos.create({
    org: sessionOrg,  // Or omit for user account
    name: sessionName,
    description: sessionData.description,
    auto_init: true
  });

  // Create session.json
  const session = {
    type: 'session',
    title: sessionData.title,
    description: sessionData.description,
    initial_recipe_ref: sessionData.initialRecipeUrl,
    final_recipe_ref: null,  // Will be set after session ends
    participants: sessionData.participants,
    start_time: sessionData.startTime,
    duration_ms: sessionData.durationMs,
    featured_moments: sessionData.featuredMoments,
    tags: sessionData.tags,
    is_public: sessionData.isPublic
  };

  await octokit.repos.createOrUpdateFileContents({
    owner: sessionOrg,
    repo: sessionName,
    path: 'session.json',
    message: 'Create session',
    content: btoa(JSON.stringify(session, null, 2))
  });

  // Store final code
  await octokit.repos.createOrUpdateFileContents({
    owner: sessionOrg,
    repo: sessionName,
    path: 'final.js',
    message: 'Final code from session',
    content: btoa(sessionData.finalCode)
  });

  // Compress and store event log
  const eventsCompressed = await compressEvents(sessionData.events);
  await octokit.repos.createOrUpdateFileContents({
    owner: sessionOrg,
    repo: sessionName,
    path: '.jamhub/events.json.gz',
    message: 'Add session events',
    content: eventsCompressed  // Base64 of gzipped JSON
  });

  // Upload session recording and commentary
  if (sessionData.recording) {
    await uploadAudioAsRelease(octokit, repo.data, sessionData.recording, 'recording.webm');
  }
  if (sessionData.commentary) {
    await uploadAudioAsRelease(octokit, repo.data, sessionData.commentary, 'commentary.webm');
  }

  return repo.data;
}
```

#### **5. Create Collection**

```javascript
async function createCollection(collectionData, githubToken) {
  const octokit = new Octokit({ auth: githubToken });

  const repo = await octokit.repos.create({
    name: collectionData.slug,
    description: collectionData.description,
    auto_init: true
  });

  await octokit.repos.replaceAllTopics({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    names: ['jamhub', 'collection', ...collectionData.tags]
  });

  // Create collection.json
  const collection = {
    type: 'collection',
    title: collectionData.title,
    description: collectionData.description,
    curator: collectionData.curator,
    items: collectionData.items.map(item => ({
      ref: item.ref,  // jamhub:// URL to any content type
      curator_note: item.note
    })),
    tags: collectionData.tags,
    is_public: collectionData.isPublic,
    created: new Date().toISOString()
  };

  await octokit.repos.createOrUpdateFileContents({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    path: 'collection.json',
    message: 'Create collection',
    content: btoa(JSON.stringify(collection, null, 2))
  });

  // Store all references
  const references = {
    refs: collectionData.items.map(i => i.ref)
  };

  await octokit.repos.createOrUpdateFileContents({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    path: '.jamhub/references.json',
    message: 'Add references',
    content: btoa(JSON.stringify(references, null, 2))
  });

  // Upload curator's mix if provided
  if (collectionData.audioFile) {
    await uploadAudioAsRelease(octokit, repo.data, collectionData.audioFile, 'mix.webm');
  }

  return repo.data;
}
```

### READ Operations

#### **1. Read Single Recipe**

```javascript
async function getRecipe(username, repoName, version = 'main') {
  const octokit = new Octokit({ auth: githubToken });

  // Fetch recipe.json
  const recipeJsonResponse = await octokit.repos.getContent({
    owner: username,
    repo: repoName,
    path: 'recipe.json',
    ref: version  // 'main' or tag like 'v2.3.0'
  });

  const recipeJson = JSON.parse(atob(recipeJsonResponse.data.content));

  // Fetch recipe.js
  const recipeJsResponse = await octokit.repos.getContent({
    owner: username,
    repo: repoName,
    path: 'recipe.js',
    ref: version
  });

  const recipeCode = atob(recipeJsResponse.data.content);

  // Fetch README.md
  const readmeResponse = await octokit.repos.getContent({
    owner: username,
    repo: repoName,
    path: 'README.md',
    ref: version
  });

  const readme = atob(readmeResponse.data.content);

  // Fetch stats
  const statsResponse = await octokit.repos.getContent({
    owner: username,
    repo: repoName,
    path: '.jamhub/stats.json',
    ref: 'main'  // Always from main branch
  });

  const stats = JSON.parse(atob(statsResponse.data.content));

  // Get GitHub repo metadata
  const repoInfo = await octokit.repos.get({
    owner: username,
    repo: repoName
  });

  return {
    id: `recipe/${username}/${repoName}`,
    version: version,
    title: recipeJson.title,
    description: recipeJson.description,
    code: recipeCode,
    readme: readme,
    author: username,
    tags: recipeJson.tags,
    difficulty: recipeJson.difficulty,
    audio: recipeJson.audio,
    metadata: recipeJson.metadata,
    stats: {
      ...stats,
      stars: repoInfo.data.stargazers_count,
      forks: repoInfo.data.forks_count,
      watchers: repoInfo.data.watchers_count
    },
    created: repoInfo.data.created_at,
    updated: repoInfo.data.updated_at,
    github_url: repoInfo.data.html_url,
    clone_url: repoInfo.data.clone_url
  };
}
```

#### **2. List/Search Recipes**

**Option A: GitHub Search API** (Simple, no index)

```javascript
async function searchRecipes(query, filters = {}) {
  const octokit = new Octokit({ auth: githubToken });

  // Build search query
  let searchQuery = `topic:jamhub topic:recipe ${query}`;

  if (filters.tags) {
    filters.tags.forEach(tag => {
      searchQuery += ` topic:${tag}`;
    });
  }

  if (filters.difficulty) {
    searchQuery += ` ${filters.difficulty} in:description`;
  }

  if (filters.user) {
    searchQuery += ` user:${filters.user}`;
  }

  // Search GitHub
  const results = await octokit.search.repos({
    q: searchQuery,
    sort: 'stars',
    order: 'desc',
    per_page: 30
  });

  // Fetch recipe.json for each result (in parallel)
  const recipes = await Promise.all(
    results.data.items.map(async repo => {
      try {
        const recipeJson = await getFileContent(
          octokit,
          repo.owner.login,
          repo.name,
          'recipe.json'
        );

        return {
          id: `recipe/${repo.owner.login}/${repo.name}`,
          title: recipeJson.title,
          description: recipeJson.description,
          author: repo.owner.login,
          tags: recipeJson.tags,
          difficulty: recipeJson.difficulty,
          audio: recipeJson.audio,
          stats: {
            stars: repo.stargazers_count,
            forks: repo.forks_count
          },
          created: repo.created_at,
          updated: repo.updated_at,
          github_url: repo.html_url
        };
      } catch (error) {
        console.error(`Failed to load recipe ${repo.full_name}:`, error);
        return null;
      }
    })
  );

  return recipes.filter(r => r !== null);
}
```

**Option B: With Search Index** (Faster, recommended)

```javascript
// Frontend calls search index (Algolia/Meilisearch)
async function searchRecipesWithIndex(query, filters = {}) {
  const index = algoliasearch('app-id', 'api-key').initIndex('recipes');

  const results = await index.search(query, {
    filters: buildFilters(filters),
    hitsPerPage: 30
  });

  return results.hits;
}

// Index is populated by webhook
// When recipe is created/updated, webhook sends to index
```

#### **3. Read Exercise/Lesson/Session/Collection**

Same pattern as recipe - fetch JSON files from repo:

```javascript
async function getContent(type, username, repoName) {
  const octokit = new Octokit({ auth: githubToken });

  // Fetch main JSON file
  const contentFile = `${type}.json`;  // 'exercise.json', 'lesson.json', etc.
  const response = await octokit.repos.getContent({
    owner: username,
    repo: repoName,
    path: contentFile
  });

  const content = JSON.parse(atob(response.data.content));

  // Fetch references
  const refsResponse = await octokit.repos.getContent({
    owner: username,
    repo: repoName,
    path: '.jamhub/references.json'
  });

  const references = JSON.parse(atob(refsResponse.data.content));

  // Resolve references (fetch referenced content)
  const resolved = await resolveReferences(references);

  return {
    ...content,
    references: resolved,
    github_url: `https://github.com/${username}/${repoName}`
  };
}

async function resolveReferences(references) {
  // Parse jamhub:// URLs and fetch content
  const resolved = {};

  for (const [key, refs] of Object.entries(references)) {
    resolved[key] = await Promise.all(
      refs.map(async ref => {
        const parsed = parseJamhubUrl(ref);  // jamhub://recipe/alice/kick@v2.3
        return await getContent(parsed.type, parsed.username, parsed.repo);
      })
    );
  }

  return resolved;
}
```

### UPDATE Operations

#### **1. Update Recipe**

```javascript
async function updateRecipe(username, repoName, updates, githubToken) {
  const octokit = new Octokit({ auth: githubToken });

  // Verify user owns this repo
  const repo = await octokit.repos.get({ owner: username, repo: repoName });
  if (repo.data.owner.login !== getCurrentUser(githubToken)) {
    throw new Error('Not authorized');
  }

  // Update recipe.js if code changed
  if (updates.code) {
    await octokit.repos.createOrUpdateFileContents({
      owner: username,
      repo: repoName,
      path: 'recipe.js',
      message: updates.commitMessage || 'Update recipe code',
      content: btoa(updates.code),
      sha: await getFileSha(octokit, username, repoName, 'recipe.js')
    });
  }

  // Update recipe.json if metadata changed
  if (updates.metadata) {
    const currentJson = await getFileContent(octokit, username, repoName, 'recipe.json');
    const updatedJson = {
      ...currentJson,
      ...updates.metadata,
      version: incrementVersion(currentJson.version)
    };

    await octokit.repos.createOrUpdateFileContents({
      owner: username,
      repo: repoName,
      path: 'recipe.json',
      message: 'Update metadata',
      content: btoa(JSON.stringify(updatedJson, null, 2)),
      sha: await getFileSha(octokit, username, repoName, 'recipe.json')
    });
  }

  // Update README.md if description changed
  if (updates.description) {
    const newReadme = generateRecipeReadme({
      title: updates.metadata?.title || currentJson.title,
      description: updates.description,
      code: updates.code,
      tags: updates.metadata?.tags || currentJson.tags
    });

    await octokit.repos.createOrUpdateFileContents({
      owner: username,
      repo: repoName,
      path: 'README.md',
      message: 'Update README',
      content: btoa(newReadme),
      sha: await getFileSha(octokit, username, repoName, 'README.md')
    });
  }

  // Upload new audio if provided
  if (updates.audioFile) {
    const newVersion = updatedJson.version;
    const release = await octokit.repos.createRelease({
      owner: username,
      repo: repoName,
      tag_name: `v${newVersion}`,
      name: `Version ${newVersion}`,
      body: updates.commitMessage || 'Updated recipe'
    });

    const audioData = await updates.audioFile.arrayBuffer();
    await octokit.repos.uploadReleaseAsset({
      owner: username,
      repo: repoName,
      release_id: release.data.id,
      name: 'preview.webm',
      data: audioData,
      headers: {
        'content-type': 'audio/webm'
      }
    });
  }

  // Trigger audio regeneration workflow
  await octokit.actions.createWorkflowDispatch({
    owner: username,
    repo: repoName,
    workflow_id: 'generate-preview.yml',
    ref: 'main'
  });

  return { success: true, version: updatedJson.version };
}
```

#### **2. Update Stats (Plays, Likes)**

Stats are cached in `.jamhub/stats.json` but also tracked via GitHub stars/forks:

```javascript
async function incrementPlayCount(username, repoName, githubToken) {
  const octokit = new Octokit({ auth: githubToken });

  // Get current stats
  const statsResponse = await octokit.repos.getContent({
    owner: username,
    repo: repoName,
    path: '.jamhub/stats.json'
  });

  const stats = JSON.parse(atob(statsResponse.data.content));
  stats.plays += 1;
  stats.last_updated = new Date().toISOString();

  // Update stats file
  await octokit.repos.createOrUpdateFileContents({
    owner: username,
    repo: repoName,
    path: '.jamhub/stats.json',
    message: 'Update play count',
    content: btoa(JSON.stringify(stats, null, 2)),
    sha: statsResponse.data.sha
  });

  return stats;
}

async function likeRecipe(username, repoName, githubToken) {
  const octokit = new Octokit({ auth: githubToken });

  // "Like" = "Star" on GitHub
  await octokit.activity.starRepoForAuthenticatedUser({
    owner: username,
    repo: repoName
  });

  // Also increment like count in stats.json
  const stats = await incrementStat(username, repoName, 'likes', githubToken);
  return stats;
}

async function unlikeRecipe(username, repoName, githubToken) {
  const octokit = new Octokit({ auth: githubToken });

  await octokit.activity.unstarRepoForAuthenticatedUser({
    owner: username,
    repo: repoName
  });

  const stats = await decrementStat(username, repoName, 'likes', githubToken);
  return stats;
}
```

#### **3. Fork Recipe**

Forking is native to GitHub:

```javascript
async function forkRecipe(username, repoName, githubToken) {
  const octokit = new Octokit({ auth: githubToken });

  // GitHub's native fork
  const fork = await octokit.repos.createFork({
    owner: username,
    repo: repoName
  });

  // Update forked recipe.json to indicate parent
  await octokit.repos.createOrUpdateFileContents({
    owner: fork.data.owner.login,
    repo: fork.data.name,
    path: 'recipe.json',
    message: 'Update fork metadata',
    content: btoa(JSON.stringify({
      ...currentJson,
      forked_from: `jamhub://recipe/${username}/${repoName}`,
      version: '1.0.0'  // Reset version for fork
    }, null, 2)),
    sha: await getFileSha(octokit, fork.data.owner.login, fork.data.name, 'recipe.json')
  });

  return fork.data;
}
```

### DELETE Operations

```javascript
async function deleteRecipe(username, repoName, githubToken) {
  const octokit = new Octokit({ auth: githubToken });

  // Verify ownership
  const repo = await octokit.repos.get({ owner: username, repo: repoName });
  if (repo.data.owner.login !== getCurrentUser(githubToken)) {
    throw new Error('Not authorized');
  }

  // Delete repository
  await octokit.repos.delete({
    owner: username,
    repo: repoName
  });

  return { success: true };
}
```

---

## User Data Storage

### User Profile

**Where stored**: User's own GitHub repository `jamhub-profile`

```
github.com/username/jamhub-profile/
├── profile.json            # Public profile data
├── README.md               # Bio/description
├── collections/            # User's collections (references)
│   └── favorites.json
├── playlists/              # User's playlists
│   └── my-ambient.json
└── .jamhub/
    ├── settings.json       # Private settings
    └── progress/           # Learning progress
        ├── lessons.json
        └── exercises.json
```

#### **Create/Update Profile**

```javascript
async function updateUserProfile(updates, githubToken) {
  const octokit = new Octokit({ auth: githubToken });
  const username = getCurrentUser(githubToken);

  // Ensure jamhub-profile repo exists
  let profileRepo;
  try {
    profileRepo = await octokit.repos.get({
      owner: username,
      repo: 'jamhub-profile'
    });
  } catch (error) {
    if (error.status === 404) {
      // Create profile repo
      profileRepo = await octokit.repos.create({
        name: 'jamhub-profile',
        description: 'My JamHub profile',
        auto_init: true,
        private: false
      });
    } else {
      throw error;
    }
  }

  // Update profile.json
  const currentProfile = await getFileContent(octokit, username, 'jamhub-profile', 'profile.json')
    .catch(() => ({}));  // Empty if doesn't exist

  const updatedProfile = {
    ...currentProfile,
    ...updates,
    username: username,
    updated: new Date().toISOString()
  };

  await octokit.repos.createOrUpdateFileContents({
    owner: username,
    repo: 'jamhub-profile',
    path: 'profile.json',
    message: 'Update profile',
    content: btoa(JSON.stringify(updatedProfile, null, 2)),
    sha: await getFileSha(octokit, username, 'jamhub-profile', 'profile.json').catch(() => null)
  });

  return updatedProfile;
}
```

### User Collections/Favorites

**Stored in user's jamhub-profile repo**:

```javascript
async function addToFavorites(recipeUrl, githubToken) {
  const octokit = new Octokit({ auth: githubToken });
  const username = getCurrentUser(githubToken);

  // Get current favorites
  const favorites = await getFileContent(octokit, username, 'jamhub-profile', 'collections/favorites.json')
    .catch(() => ({ items: [] }));

  // Add recipe
  if (!favorites.items.includes(recipeUrl)) {
    favorites.items.push(recipeUrl);
    favorites.updated = new Date().toISOString();

    await octokit.repos.createOrUpdateFileContents({
      owner: username,
      repo: 'jamhub-profile',
      path: 'collections/favorites.json',
      message: 'Add to favorites',
      content: btoa(JSON.stringify(favorites, null, 2)),
      sha: await getFileSha(octokit, username, 'jamhub-profile', 'collections/favorites.json')
        .catch(() => null)
    });
  }

  return favorites;
}
```

### Learning Progress

**Stored privately in user's profile**:

```javascript
async function updateLearningProgress(lessonId, progress, githubToken) {
  const octokit = new Octokit({ auth: githubToken });
  const username = getCurrentUser(githubToken);

  // Get current progress
  const allProgress = await getFileContent(octokit, username, 'jamhub-profile', '.jamhub/progress/lessons.json')
    .catch(() => ({}));

  // Update progress for this lesson
  allProgress[lessonId] = {
    ...allProgress[lessonId],
    ...progress,
    updated: new Date().toISOString()
  };

  await octokit.repos.createOrUpdateFileContents({
    owner: username,
    repo: 'jamhub-profile',
    path: '.jamhub/progress/lessons.json',
    message: 'Update learning progress',
    content: btoa(JSON.stringify(allProgress, null, 2)),
    sha: await getFileSha(octokit, username, 'jamhub-profile', '.jamhub/progress/lessons.json')
      .catch(() => null)
  });

  return allProgress;
}
```

---

## Frontend Implementation (GitHub Pages)

### App Structure

```
jamhub-frontend/ (GitHub Pages repo)
├── index.html
├── src/
│   ├── components/
│   │   ├── RecipeBrowser.jsx
│   │   ├── RecipePlayer.jsx
│   │   ├── ExerciseViewer.jsx
│   │   └── LessonViewer.jsx
│   ├── api/
│   │   ├── github.js          # GitHub API wrapper
│   │   ├── recipes.js         # Recipe CRUD
│   │   ├── exercises.js       # Exercise CRUD
│   │   └── auth.js            # OAuth flow
│   ├── utils/
│   │   ├── jamhub-url.js      # Parse jamhub:// URLs
│   │   └── audio.js           # Audio playback
│   └── App.jsx
├── public/
└── package.json
```

### Example: Recipe Browser Component

```javascript
// src/components/RecipeBrowser.jsx
import { useState, useEffect } from 'react';
import { searchRecipes } from '../api/recipes';

export function RecipeBrowser() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function loadRecipes() {
      setLoading(true);
      const results = await searchRecipes(query, {
        tags: ['ambient'],
        sort: 'stars'
      });
      setRecipes(results);
      setLoading(false);
    }

    loadRecipes();
  }, [query]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search recipes..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="recipe-grid">
          {recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeCard({ recipe }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>
      <p>{recipe.description}</p>
      <div className="meta">
        <span>by {recipe.author}</span>
        <span>⭐ {recipe.stats.stars}</span>
        <span>🍴 {recipe.stats.forks}</span>
      </div>
      <audio
        src={recipe.audio.user_uploaded?.url || recipe.audio.generated}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        controls
      />
      <div className="actions">
        <a href={`/recipe/${recipe.author}/${recipe.id}`}>View</a>
        <button onClick={() => forkRecipe(recipe)}>Fork</button>
      </div>
    </div>
  );
}
```

### Example: Recipe Editor

```javascript
// src/components/RecipeEditor.jsx
import { useState } from 'react';
import { createRecipe } from '../api/recipes';
import { StrudelREPL } from '@strudel/repl';

export function RecipeEditor() {
  const [code, setCode] = useState("s('bd sd').fast(2)");
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [publishing, setPublishing] = useState(false);

  async function handlePublish() {
    setPublishing(true);

    try {
      const recipe = await createRecipe({
        code,
        title,
        description,
        tags,
        difficulty: 'beginner',
        audioFile,
        slug: slugify(title)
      }, localStorage.getItem('github_token'));

      alert(`Recipe published! ${recipe.html_url}`);
      window.location.href = `/recipe/${recipe.owner.login}/${recipe.name}`;
    } catch (error) {
      alert(`Failed to publish: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="recipe-editor">
      <h2>Create New Recipe</h2>

      <StrudelREPL
        code={code}
        onChange={setCode}
        onPlay={() => console.log('Playing')}
      />

      <form onSubmit={e => { e.preventDefault(); handlePublish(); }}>
        <input
          type="text"
          placeholder="Recipe title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags.join(', ')}
          onChange={e => setTags(e.target.value.split(',').map(t => t.trim()))}
        />

        <div>
          <label>Audio Preview (optional)</label>
          <input
            type="file"
            accept="audio/mp3,audio/wav"
            onChange={e => setAudioFile(e.target.files[0])}
          />
          <small>Max 5MB. If not provided, audio will be auto-generated.</small>
        </div>

        <button type="submit" disabled={publishing}>
          {publishing ? 'Publishing...' : 'Publish to JamHub'}
        </button>
      </form>
    </div>
  );
}
```

---

## Performance Optimizations

### 1. **Caching Strategy**

```javascript
// Use Cloudflare Workers as caching layer
export default {
  async fetch(request, env) {
    const cache = caches.default;

    // Try cache first
    let response = await cache.match(request);
    if (response) {
      return response;
    }

    // Fetch from GitHub API
    response = await fetch(request);

    // Cache for 5 minutes
    const cacheResponse = new Response(response.body, response);
    cacheResponse.headers.set('Cache-Control', 'public, max-age=300');
    await cache.put(request, cacheResponse.clone());

    return cacheResponse;
  }
}
```

### 2. **Batch Loading**

```javascript
// Load multiple recipes in parallel
async function loadRecipes(recipeUrls) {
  return await Promise.all(
    recipeUrls.map(url => {
      const { username, repo } = parseJamhubUrl(url);
      return getRecipe(username, repo);
    })
  );
}
```

### 3. **Lazy Loading**

```javascript
// Only load recipe code when needed
async function getRecipeMetadata(username, repoName) {
  // Only fetch recipe.json, not code
  const response = await octokit.repos.getContent({
    owner: username,
    repo: repoName,
    path: 'recipe.json'
  });

  return JSON.parse(atob(response.data.content));
}
```

### 4. **CDN for Audio**

```javascript
// Serve audio from Cloudflare R2 (or GitHub Releases)
const audioUrl = `https://cdn.jamhub.cc/${username}/${repoName}/preview.webm`;

// Fallback to GitHub Release if CDN miss
const releaseUrl = `https://github.com/${username}/${repoName}/releases/download/v1.0.0/preview.webm`;
```

---

## Deployment

### Frontend Deployment (GitHub Pages)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_GITHUB_CLIENT_ID: ${{ secrets.GITHUB_CLIENT_ID }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: jamhub.cc
```

### Custom Domain Setup

```
1. Add CNAME file to gh-pages branch with: jamhub.cc
2. Configure DNS:
   - CNAME: jamhub.cc → username.github.io
3. Enable HTTPS in repo settings
```

---

## Rate Limiting & Costs

### GitHub API Limits

**Authenticated requests**: 5,000/hour/user
**Unauthenticated**: 60/hour/IP

**Strategy**:
- Cache aggressively
- Use conditional requests (ETags)
- Batch requests where possible
- Use search index for discovery (not GitHub API)

### Costs (Estimated)

```
Stage 1 (MVP, 0-1K users):
- GitHub: $0 (free tier)
- GitHub Pages: $0
- GitHub Actions: $0 (2,000 min/month free)
Total: $0/month

Stage 2 (1K-10K users):
- GitHub: $0
- Algolia free tier: $0
- Cloudflare Workers: $0 (free tier)
- Audio CDN (R2): $5-10/month
Total: $5-10/month

Stage 3 (10K-100K users):
- GitHub: $0
- Search (Algolia paid): $50/month
- Cloudflare Workers: $20/month
- Audio CDN: $30/month
Total: $100/month
```

---

## Security

### Authentication

```javascript
// OAuth flow
1. User clicks "Login with GitHub"
2. Redirect to GitHub OAuth
3. GitHub redirects back with code
4. Exchange code for access token
5. Store token in localStorage
6. Use token for all API requests
```

### Authorization

```javascript
// Verify user owns repo before write operations
async function verifyOwnership(username, repoName, githubToken) {
  const octokit = new Octokit({ auth: githubToken });
  const repo = await octokit.repos.get({ owner: username, repo: repoName });
  const currentUser = await octokit.users.getAuthenticated();

  return repo.data.owner.login === currentUser.data.login;
}
```

### Content Validation

```javascript
// Validate recipe before publishing
function validateRecipe(recipeData) {
  if (!recipeData.title || recipeData.title.length < 3) {
    throw new Error('Title must be at least 3 characters');
  }

  if (!recipeData.code || recipeData.code.length < 5) {
    throw new Error('Code is required');
  }

  if (recipeData.audioFile) {
    // Verify it's WebM format
    if (recipeData.audioFile.type !== 'audio/webm') {
      throw new Error('Audio must be in WebM format (Opus codec)');
    }

    if (recipeData.audioFile.size > 5 * 1024 * 1024) {
      throw new Error('Audio file must be under 5MB');
    }
  }

  // Validate Strudel syntax
  try {
    evaluateStrudel(recipeData.code);
  } catch (error) {
    throw new Error(`Invalid Strudel code: ${error.message}`);
  }
}
```

---

## Audio Recording & Encoding (Browser-Only)

JamHub uses the **MediaRecorder API** to record audio directly in the browser using **Opus codec in WebM container**. No server-side encoding needed.

### Recording Audio from Microphone (Duration-Limited)

```javascript
async function recordAudio(contentType, onProgress = null) {
  const config = BITRATE_CONFIG[contentType];
  const maxDurationMs = config.maxDuration * 1000;

  // Request microphone access
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 48000
    }
  });

  // Create MediaRecorder with Opus codec
  const recorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: config.bitrate
  });

  const chunks = [];
  let startTime = Date.now();

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  // Start recording
  recorder.start();

  // Progress timer (updates UI every 100ms)
  const progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, maxDurationMs - elapsed);
    const progress = elapsed / maxDurationMs;

    if (onProgress) {
      onProgress({
        elapsed: Math.floor(elapsed / 1000),
        remaining: Math.ceil(remaining / 1000),
        progress: Math.min(1, progress),
        maxDuration: config.maxDuration
      });
    }

    // Auto-stop at max duration
    if (remaining <= 0) {
      clearInterval(progressInterval);
      recorder.stop();
      stream.getTracks().forEach(track => track.stop());
    }
  }, 100);

  // Wait for recording to stop (either manually or auto)
  await new Promise(resolve => {
    recorder.onstop = () => {
      clearInterval(progressInterval);
      resolve();
    };
  });

  // Create WebM blob
  const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });

  // Validate file size
  if (audioBlob.size > config.maxSize) {
    throw new Error(`Recording exceeds ${config.maxSize / 1024 / 1024}MB limit`);
  }

  return {
    blob: audioBlob,
    duration: (Date.now() - startTime) / 1000,
    size: audioBlob.size
  };
}

// Usage with progress callback
const result = await recordAudio('recipe', (progress) => {
  console.log(`Recording: ${progress.elapsed}s / ${progress.maxDuration}s`);
  updateProgressBar(progress.progress);
});

console.log(`Recorded ${result.duration}s, ${result.size} bytes`);
```

### Recording Strudel Pattern Output (Duration-Limited)

```javascript
async function recordStrudelPattern(code, contentType = 'recipe', onProgress = null) {
  const config = BITRATE_CONFIG[contentType];
  const maxDurationMs = config.maxDuration * 1000;

  // Create AudioContext
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();

  // Evaluate Strudel code and connect to destination
  const pattern = evaluate(code);
  pattern.connectTo(destination);
  pattern.start();

  // Create MediaRecorder from destination stream
  const recorder = new MediaRecorder(destination.stream, {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: config.bitrate
  });

  const chunks = [];
  let startTime = Date.now();

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  recorder.start();

  // Progress timer
  const progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, maxDurationMs - elapsed);
    const progress = elapsed / maxDurationMs;

    if (onProgress) {
      onProgress({
        elapsed: Math.floor(elapsed / 1000),
        remaining: Math.ceil(remaining / 1000),
        progress: Math.min(1, progress),
        maxDuration: config.maxDuration
      });
    }

    // Auto-stop at max duration
    if (remaining <= 0) {
      clearInterval(progressInterval);
      recorder.stop();
      pattern.stop();
    }
  }, 100);

  // Wait for recording to stop
  await new Promise(resolve => {
    recorder.onstop = () => {
      clearInterval(progressInterval);
      resolve();
    };
  });

  const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });

  return {
    blob: audioBlob,
    duration: (Date.now() - startTime) / 1000,
    size: audioBlob.size
  };
}

// Auto-generate preview when publishing (uses typical duration)
const result = await recordStrudelPattern(recipeCode, 'recipe');
console.log(`Generated ${result.duration}s preview, ${result.size} bytes`);
```

### Bitrate Recommendations by Content Type

```javascript
const BITRATE_CONFIG = {
  recipe: {
    typicalDuration: 30,        // seconds (recommended)
    maxDuration: 240,           // 4 minutes maximum (enforced at recording)
    bitrate: 64000,             // 64 kbps
    maxSize: 2 * 1024 * 1024,   // 2 MB
    expectedSize: 240000        // ~240 KB typical
  },
  exercise: {
    typicalDuration: 120,       // 2 minutes (recommended)
    maxDuration: 600,           // 10 minutes maximum
    bitrate: 64000,             // 64 kbps
    maxSize: 5 * 1024 * 1024,   // 5 MB
    expectedSize: 960000        // ~960 KB typical
  },
  lesson: {
    typicalDuration: 300,       // 5 minutes (recommended)
    maxDuration: 1260,          // 21 minutes maximum
    bitrate: 96000,             // 96 kbps (higher for voice)
    maxSize: 15 * 1024 * 1024,  // 15 MB
    expectedSize: 3600000       // ~3.6 MB typical
  },
  session: {
    typicalDuration: 2700,      // 45 minutes (recommended)
    maxDuration: 8400,          // 2.3 hours maximum (140 minutes)
    bitrate: 48000,             // 48 kbps (lower for long recordings)
    maxSize: 50 * 1024 * 1024,  // 50 MB (stays under GitHub's 50MB warning)
    expectedSize: 16200000      // ~16.2 MB typical
  },
  collection: {
    typicalDuration: 120,       // 2 minutes (recommended)
    maxDuration: 420,           // 7 minutes maximum
    bitrate: 96000,             // 96 kbps
    maxSize: 5 * 1024 * 1024,   // 5 MB
    expectedSize: 1440000       // ~1.4 MB typical
  }
};

// Rationale: Duration limits are enforced at recording time to prevent wasted effort.
// File size limits act as safety checks only. Opus/WebM compression keeps files small.

function getRecorderConfig(contentType) {
  const config = BITRATE_CONFIG[contentType];
  return {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: config.bitrate
  };
}

// Usage
const recorder = new MediaRecorder(stream, getRecorderConfig('recipe'));
```

### Audio Upload Component with Duration Limit

```javascript
// React component for audio upload with countdown timer
import { useState } from 'react';

export function AudioUploader({ contentType, onUpload }) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const config = BITRATE_CONFIG[contentType];

  async function startRecording() {
    setRecording(true);
    setProgress(0);
    setTimeRemaining(config.maxDuration);

    try {
      const result = await recordAudio(contentType, (progressData) => {
        setProgress(progressData.progress);
        setTimeRemaining(progressData.remaining);
      });

      setAudioBlob(result.blob);
      setDuration(result.duration);
      setRecording(false);

      onUpload(result.blob);
    } catch (error) {
      alert(`Recording failed: ${error.message}`);
      setRecording(false);
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate format
    if (file.type !== 'audio/webm') {
      alert('Please upload WebM audio files only');
      return;
    }

    // Validate size
    if (file.size > config.maxSize) {
      alert(`File too large. Max size: ${config.maxSize / 1024 / 1024}MB`);
      return;
    }

    setAudioBlob(file);
    onUpload(file);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="audio-uploader">
      <h3>Audio Preview</h3>

      <div className="options">
        <button onClick={startRecording} disabled={recording}>
          {recording
            ? `🔴 Recording... ${formatTime(timeRemaining)}`
            : `🎤 Record (max ${formatTime(config.maxDuration)})`}
        </button>

        <label className="file-upload">
          📁 Upload WebM
          <input
            type="file"
            accept="audio/webm"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={recording}
          />
        </label>
      </div>

      {recording && (
        <div className="recording-progress">
          <progress value={progress} max="1" />
          <p className="timer">
            Time remaining: {formatTime(timeRemaining)} / {formatTime(config.maxDuration)}
          </p>
        </div>
      )}

      {audioBlob && !recording && (
        <div className="preview">
          <audio controls src={URL.createObjectURL(audioBlob)} />
          <p>
            Size: {(audioBlob.size / 1024).toFixed(1)} KB
            {duration > 0 && ` | Duration: ${duration.toFixed(1)}s`}
          </p>
        </div>
      )}

      <p className="hint">
        Format: WebM (Opus codec) |
        Max duration: {formatTime(config.maxDuration)} |
        Max size: {config.maxSize / 1024 / 1024}MB
      </p>
    </div>
  );
}
```

### Browser Compatibility Check

```javascript
// Check if browser supports Opus/WebM recording
function checkAudioSupport() {
  if (!navigator.mediaDevices || !window.MediaRecorder) {
    return {
      supported: false,
      reason: 'MediaRecorder API not available'
    };
  }

  const mimeType = 'audio/webm;codecs=opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    return {
      supported: false,
      reason: 'Opus/WebM recording not supported'
    };
  }

  return {
    supported: true,
    mimeType: mimeType
  };
}

// Usage
const support = checkAudioSupport();
if (!support.supported) {
  alert(`Your browser doesn't support audio recording: ${support.reason}`);
}
```

### File Format Details

**WebM Container**:
- Container format: WebM (Matroska-based)
- Audio codec: Opus
- File extension: `.webm`
- MIME type: `audio/webm;codecs=opus`

**Opus Codec Benefits**:
- Superior compression (2x better than MP3)
- Low latency (5-66.5ms)
- Universal browser support (2025)
- Royalty-free and open standard
- Excellent quality at low bitrates

**Expected File Sizes** (actual values):
```
Content Type    Duration    Bitrate    File Size
-----------------------------------------------------
Recipe          30s         64 kbps    ~240 KB
Exercise        2 min       64 kbps    ~960 KB
Lesson          5 min       96 kbps    ~3.6 MB
Session         45 min      48 kbps    ~16.2 MB
Collection      2 min       96 kbps    ~1.4 MB
```

---

## Summary

**JamHub uses GitHub as the single source of truth**:

✅ **Create**: GitHub API creates repos with structured files
✅ **Read**: Frontend fetches from GitHub API (cached)
✅ **Update**: GitHub API updates files in repos
✅ **Delete**: GitHub API deletes repos

✅ **User Data**: Stored in user's own `jamhub-profile` repo
✅ **Authentication**: GitHub OAuth (no separate accounts)
✅ **Storage**: GitHub repos + Releases/LFS for audio
✅ **Frontend**: GitHub Pages (static site)
✅ **Search**: Optional index (Algolia/Meilisearch) synced via webhooks
✅ **Cost**: $0 for MVP, scales gradually

**Benefits**:
- No database needed
- Built-in version control
- Built-in fork mechanism
- Users own their data
- Portable and open
- Scales automatically
- AGPL-compliant

**Trade-offs**:
- GitHub API rate limits (mitigated by caching)
- Slower than traditional database (mitigated by search index)
- Requires GitHub account (acceptable for target audience)
