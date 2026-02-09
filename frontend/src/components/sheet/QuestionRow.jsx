import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check, ExternalLink } from 'lucide-react';
import { useSheetStore } from '@/store/useSheetStore';
import { InlineEdit } from './InlineEdit';
import { DeleteConfirm } from './DeleteConfirm';

const DIFFICULTY_STYLES = {
  Easy: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-red-100 text-red-700',
};

export const QuestionRow = ({ question, subTopicId, index }) => {
  const toggleSolved = useSheetStore((s) => s.toggleSolved);
  const updateQuestion = useSheetStore((s) => s.updateQuestion);
  const deleteQuestion = useSheetStore((s) => s.deleteQuestion);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id,
    data: { type: 'question', subTopicId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 rounded-md group hover:bg-muted/50 transition-all ${
        isDragging ? 'opacity-40 shadow-md z-10' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="drag-handle opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity shrink-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        aria-label="Drag to reorder question"
      >
        <GripVertical size={12} />
      </button>

      <span className="text-xs text-muted-foreground font-mono w-6 shrink-0 text-center">
        {index + 1}
      </span>

      <button
        onClick={() => toggleSolved(question.id)}
        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          question.isSolved
            ? 'bg-accent border-accent'
            : 'border-muted-foreground/30 hover:border-accent'
        }`}
        aria-label={question.isSolved ? 'Mark as unsolved' : 'Mark as solved'}
      >
        {question.isSolved && <Check size={12} className="text-accent-foreground" />}
      </button>

      <div className="flex-1 min-w-0">
        <InlineEdit
          value={question.title}
          onSave={(val) => updateQuestion(question.id, { title: val })}
          className={`text-sm ${
            question.isSolved
              ? 'line-through text-muted-foreground'
              : 'text-foreground'
          }`}
        />
      </div>

      <span
        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 uppercase tracking-wide ${
          DIFFICULTY_STYLES[question.difficulty] || 'bg-muted text-muted-foreground'
        }`}
      >
        {question.difficulty}
      </span>

      {question.problemUrl && (
        <a
          href={question.problemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Open problem link"
        >
          <ExternalLink size={13} />
        </a>
      )}

      {question.resource && (
        <a
          href={question.resource}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary/70 hover:text-primary shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded font-medium"
          aria-label="Open resource link"
        >
          Video
        </a>
      )}

      <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <DeleteConfirm
          onConfirm={() => deleteQuestion(subTopicId, question.id)}
          itemName="question"
          size={13}
        />
      </div>
    </div>
  );
};
