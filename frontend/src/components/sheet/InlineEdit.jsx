import { useState, useRef, useEffect } from 'react';
import { HighlightText } from './HighlightText';

export const InlineEdit = ({ value, onSave, className = '', as: Tag = 'span', searchQuery = '' }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = () => {
    const trimmed = text.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setText(value);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      setText(value);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className={`bg-transparent border-b-2 border-primary outline-none w-full ${className}`}
        maxLength={200}
      />
    );
  }

  return (
    <Tag
      onDoubleClick={() => setEditing(true)}
      className={`cursor-pointer truncate select-none hover:text-primary transition-colors ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'F2') setEditing(true);
      }}
    >
      <HighlightText text={value} query={searchQuery} />
    </Tag>
  );
};
