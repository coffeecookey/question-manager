import { useState, useRef, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';

export const DeleteConfirm = ({ onConfirm, itemName = 'item', size = 14 }) => {
  const [confirming, setConfirming] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const startConfirm = (e) => {
    e.stopPropagation();
    setConfirming(true);
    timeoutRef.current = setTimeout(() => setConfirming(false), 3000);
  };

  const handleConfirm = (e) => {
    e.stopPropagation();
    clearTimeout(timeoutRef.current);
    setConfirming(false);
    onConfirm();
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    clearTimeout(timeoutRef.current);
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 animate-in fade-in">
        <button
          onClick={handleConfirm}
          className="text-destructive text-xs font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
        >
          Delete {itemName}?
        </button>
        <button
          onClick={handleCancel}
          className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startConfirm}
      className="text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded p-0.5"
      aria-label={`Delete ${itemName}`}
    >
      <Trash2 size={size} />
    </button>
  );
};
