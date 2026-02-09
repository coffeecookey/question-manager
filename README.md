# Codolio - Interactive Question Management Sheet

A single-page web application for managing coding practice questions in a hierarchical structure. Built as a study companion for DSA sheets like Striver's A2Z DSA Sheet.

## Features

- **Hierarchical Organization**: Topics > Sub-topics > Questions, with full CRUD at every level
- **Drag and Drop Reordering**: Reorder topics, sub-topics, and questions independently using keyboard or pointer
- **Progress Tracking**: Solved/unsolved counts, progress bars, and circular percentage indicators at every level
- **Inline Editing**: Double-click any title to rename it in place
- **Difficulty Badges**: Color-coded labels (Easy, Medium, Hard) on each question
- **Persistent Storage**: All changes survive page refresh via localStorage
- **Optimistic Updates**: UI responds instantly; if the API fails, changes roll back automatically with an error toast
- **Reset to Defaults**: One-click reset restores the original sample data
- **Accessible**: Keyboard navigation for drag-and-drop, focus-visible indicators, and ARIA labels throughout

## Tech Stack

| Layer             | Technology                          |
| ----------------- | ----------------------------------- |
| Framework         | React 19                            |
| Language          | JavaScript (no TypeScript)          |
| State Management  | Zustand                             |
| Styling           | Tailwind CSS 3                      |
| Drag and Drop     | @dnd-kit (core + sortable)          |
| Icons             | Lucide React                        |
| Toasts            | Sonner                              |
| Build Tool        | Vite 7                              |
| Linting           | ESLint 9                            |

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173` with hot module replacement.

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
  src/
    api/
      mock-api.js             
    components/
      sheet/
        AddItemInline.jsx      # Toggle input for adding new items
        DeleteConfirm.jsx      # Two-step delete confirmation
        InlineEdit.jsx         # Double-click-to-edit text field
        QuestionRow.jsx        # Sortable question row with checkbox and badges
        SheetView.jsx          # Main container with header stats and topic DnD
        SubTopicCard.jsx       # Collapsible, sortable sub-topic with question DnD
        TopicSection.jsx       # Collapsible, sortable topic with sub-topic DnD
    data/
      sheet.json               # Seed data (21 questions, 3 topics, 7 sub-topics)
    lib/
      id.js                    # UUID-based ID generator with type prefixes
    store/
      useSheetStore.js         # Centralized Zustand store
    App.jsx                    # Root component (Toaster + SheetView)
    main.jsx                   # React entry point
    index.css                  # Tailwind directives and CSS custom properties theme
  index.html
  package.json
  vite.config.js               # Vite config with @ path alias
  tailwind.config.js           # Custom color system using CSS variables
  postcss.config.js
  eslint.config.js
```

## Data Model

The store uses a **normalized flat structure** for efficient lookups and updates:

```
topicOrder: [id, id, ...]            // Array controls display order

topics:     { [id]: { id, name, subTopicIds: [...] } }
subTopics:  { [id]: { id, name, questionIds: [...] } }
questions:  { [id]: { id, title, difficulty, isSolved, problemUrl, resource, ... } }
```

Parent-child relationships are encoded through ID arrays. Ordering is determined by array position, not a separate `order` field.

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
