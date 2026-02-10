# Interactive Question Management Sheet

A single-page web application for managing coding practice questions in a hierarchical structure. Built as a study companion for DSA sheets.

## Features

- **Hierarchical Organization**: Topics > Sub-topics > Questions, with full CRUD at every level
- **Drag and Drop Reordering**: Reorder topics, sub-topics, and questions independently using keyboard or pointer, with vertical axis locking, lightweight drag overlays, and smooth translate transforms
- **Inline Editing**: Double-click any title to rename it in place
- **Difficulty Badges**: Color-coded labels (Easy, Medium, Hard, Unmarked) on each question
- **Persistent Storage**: All changes survive page refresh via localStorage

### Bonus Features

- **Global Search**: Debounced search across all topics, sub-topics, and questions with hierarchical filtering (topic match shows all children, question match shows only that row), text highlighting via `<mark>`, match count display, and a no-results empty state
- **Dark Mode**: Light/dark theme toggle with system-aware default, persisted to localStorage, and a flash-free initial load via an inline script
- **Duplicate Detection**: URL-based duplicate detection using a precomputed index for O(1) lookups on every question row, with detailed location info (Topic > Sub-topic > Title) shown in add/edit forms
- **List Virtualization**: Sub-topics with 30+ questions use @tanstack/react-virtual to render only visible rows plus a buffer, keeping DOM size constant regardless of data size
- **Pagination**: Configurable topics-per-page (10 or 20) with page navigation controls, hidden during search
- **Progress Tracking**: Dashboard stats (total topics, total questions, solved percentage with progress bar), plus per-sub-topic solved/total counts and progress bars
- **Optimistic Updates**: UI responds instantly; if the API fails, changes roll back automatically with an error toast
- **Reset to Defaults**: One-click reset restores the original sample data

## Tech Stack

| Layer             | Technology                          |
| ----------------- | ----------------------------------- |
| Framework         | React 19                            |
| Language          | JavaScript         |
| State Management  | Zustand                             |
| Styling           | Tailwind CSS 3                      |
| Drag and Drop     | @dnd-kit (core + sortable + modifiers) |
| Virtualization    | @tanstack/react-virtual             |
| Icons             | Lucide React                        |
| Toasts            | Sonner                              |
| Build Tool        | Vite 7                              |
| Linting           | ESLint 9                            |

## Getting Started

### Prerequisites

- Node.js
- npm 

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173` 

## Project Structure

```
frontend/
  src/
    api/
      mock-api.js              # CRUD + reorder + localStorage persistence
    components/
      sheet/
        AddItemInline.jsx      # Toggle input for adding topics/sub-topics
        AddQuestionForm.jsx    # Multi-field form for new questions with duplicate warning
        DeleteConfirm.jsx      # Two-step delete confirmation
        EditQuestionForm.jsx   # Edit form with difficulty, links, duplicate info
        HighlightText.jsx      # Wraps search matches in <mark> tags
        InlineEdit.jsx         # Double-click-to-edit text field with search highlighting
        QuestionRow.jsx        # Sortable question row with checkbox, badges, duplicate badge
        SearchBar.jsx          # Debounced search input with clear button and match count
        SheetView.jsx          # Main container with header, stats, pagination, topic DnD
        SubTopicCard.jsx       # Collapsible sub-topic with question DnD and virtualization
        ThemeToggle.jsx        # Light/dark mode toggle button
        TopicSection.jsx       # Collapsible, sortable topic with sub-topic DnD
    data/
      sheet.json               # Seed data (21 questions, 3 topics, 7 sub-topics)
    lib/
      duplicates.js            # Rich duplicate location finder (for add/edit forms)
      id.js                    # UUID-based ID generator with type prefixes
      search.js                # Hierarchical search filter with visibility Sets
    store/
      useSheetStore.js         # Centralized Zustand store with urlIndex
    App.jsx                    # Root component (Toaster + SheetView)
    main.jsx                   # React entry point
    index.css                  # Tailwind directives and light/dark CSS variable themes
  index.html                   # Includes theme flash prevention script
  package.json
  vite.config.js               # Vite config with @ path alias
  tailwind.config.js           # Custom color system using CSS variables, darkMode: 'class'
  postcss.config.js
  eslint.config.js
```

## Data Model

The store uses a **normalized flat structure** for efficient lookups and updates:

```
topicOrder: [id, id, ...]            // Array controls display order

topics:     { [id]: { id, name, subTopicIds: [...] } }
subTopics:  { [id]: { id, name, questionIds: [...] } }
questions:  { [id]: { id, title, difficulty, isSolved, problemUrl, resource, isDuplicate } }

urlIndex:   { [problemUrl]: [questionId, ...] }   // Precomputed for O(1) duplicate lookups
```

Parent-child relationships are encoded through ID arrays. Ordering is determined by array position, not a separate `order` field.

The `urlIndex` is built once on load and incrementally maintained by every mutation that adds, removes, or updates a question's `problemUrl`. This avoids the O(T * S * Q) tree traversal that would otherwise run on every question row render.

## API Layer

The mock API in `src/api/mock-api.js` simulates a REST backend:

- All methods are async with artificial delays
- On first load, parses `sheet.json` into normalized form
- On subsequent loads, reads from localStorage
- Every mutation writes back to localStorage
- Supports a `resetData()` method to restore defaults

To swap in a real backend, replace the exports of this single file with actual HTTP calls.

## State Management

The Zustand store uses three mutation strategies:

| Strategy               | Used For                              | Behavior                                                    |
| ---------------------- | ------------------------------------- | ----------------------------------------------------------- |
| Optimistic + rollback  | Updates, deletes, reorders, toggles   | Snapshot state, mutate, call API; revert on failure          |
| Await then update      | Creates (add topic/sub-topic/question)| Wait for API response, then merge new entity into state      |
| Fire and forget        | Not used                              | All mutations include error handling                         |

Components subscribe via selectors to minimize re-renders:

```js
const topics = useSheetStore((s) => s.topics);
```

## Performance Optimizations

| Optimization | Problem | Solution |
| --- | --- | --- |
| URL Index | Duplicate detection traversed the entire data tree per question row: O(T * S * Q) | Precomputed `urlIndex` map gives O(1) lookups; maintained incrementally on every mutation |
| List Virtualization | Sub-topics with 200 questions mount 2,000+ DOM nodes | @tanstack/react-virtual renders only visible rows (~15) plus an overscan buffer (8), keeping DOM size constant |
| Zustand Selectors | Subscribing to the full store causes re-renders on any change | Each component selects only the slices it needs, so unrelated mutations are ignored |
| Optimistic Updates | Waiting for API responses before updating the UI feels sluggish | State is mutated immediately; a snapshot is taken beforehand and restored if the API call fails |
| Debounced Search | Filtering on every keystroke causes layout thrashing | Search input is debounced (300ms); results are computed via `useMemo` only when the query stabilizes |
| DragOverlay | Default @dnd-kit dragging moves the original element, causing layout shifts | A lightweight overlay clone is rendered during drag, and `CSS.Translate` avoids scale artifacts |
