# Interactive Question Management Sheet

A single-page web application for managing coding practice questions in a hierarchical structure. Built as a study companion for DSA sheets.

## Features

- **Hierarchical Organization**: Topics > Sub-topics > Questions, with full CRUD at every level
- **Drag and Drop Reordering**: Reorder topics, sub-topics, and questions independently using keyboard or pointer
- **Inline Editing**: Double-click any title to rename it in place
- **Difficulty Badges**: Color-coded labels (Easy, Medium, Hard, Unmarked) on each question
- **Persistent Storage**: All changes survive page refresh via localStorage

### Bonus Features

- **Global Search**: Search across all topics, sub-topics, and questions with text highlighting and match count
- **Dark Mode**: Light/dark theme toggle persisted to localStorage
- **Duplicate Detection**: Warns when adding a question with a URL that already exists elsewhere
- **Pagination**: Configurable topics-per-page (10 or 20) with page navigation
- **Progress Tracking**: Dashboard stats (total topics, total questions, solved percentage) and per-sub-topic progress bars
- **Reset to Defaults**: One-click reset restores the original sample data

## Tech Stack

| Layer             | Technology                          |
| ----------------- | ----------------------------------- |
| Framework         | React 19                            |
| Language          | JavaScript         |
| State Management  | Zustand                             |
| Styling           | Tailwind CSS 3                      |
| Drag and Drop     | @dnd-kit (core + sortable)          |
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
        SearchBar.jsx          # Search input with clear button and match count
        SheetView.jsx          # Main container with header, stats, pagination, topic DnD
        SubTopicCard.jsx       # Collapsible sub-topic with question DnD
        ThemeToggle.jsx        # Light/dark mode toggle button
        TopicSection.jsx       # Collapsible, sortable topic with sub-topic DnD
    data/
      sheet.json               # Seed data (21 questions, 3 topics, 7 sub-topics)
    lib/
      duplicates.js            # Duplicate URL checker for add/edit forms
      id.js                    # ID generator
      search.js                # Search filter across topics, sub-topics, and questions
    store/
      useSheetStore.js         # Centralized Zustand store
    App.jsx                    # Root component (Toaster + SheetView)
    main.jsx                   # React entry point
    index.css                  # Tailwind directives and theme colors
  index.html
  package.json
  vite.config.js               # Vite config with @ path alias
  tailwind.config.js           # Tailwind config with dark mode support
  postcss.config.js
  eslint.config.js
```

## Data Model

The store keeps topics, sub-topics, and questions in flat objects keyed by ID:

```
topicOrder: [id, id, ...]            // Array controls display order

topics:     { [id]: { id, name, subTopicIds: [...] } }
subTopics:  { [id]: { id, name, questionIds: [...] } }
questions:  { [id]: { id, title, difficulty, isSolved, problemUrl, resource } }
```

Parent-child relationships are encoded through ID arrays. Ordering is determined by array position.

## API Layer

The mock API in `src/api/mock-api.js` simulates a REST backend:

- All methods are async with artificial delays
- On first load, parses `sheet.json` into the store format
- On subsequent loads, reads from localStorage
- Every mutation writes back to localStorage
- Supports a `resetData()` method to restore defaults

To swap in a real backend, replace the exports of this single file with actual HTTP calls.
