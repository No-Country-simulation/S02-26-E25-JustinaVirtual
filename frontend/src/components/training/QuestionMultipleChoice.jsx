// src/components/training/QuestionMultipleChoice.jsx
import { useState } from 'react';

export default function QuestionMultipleChoice({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [startTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);

  const handleSelect = (index) => {
    if (selected !== null) return; // already answered

    const timeSpentMs = Date.now() - startTime;
    const isCorrect = index === question.correctIndex;

    onAnswer({
      questionId: question.id,
      selectedIndex: index,
      isCorrect,
      timeSpentMs,
      answeredAt: new Date(),
    });

    setSelected(index);
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">{question.text}</h3>

      <div className="space-y-3">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={selected !== null}
            className={`
              w-full p-4 text-left rounded border transition
              ${selected === null 
                ? 'hover:bg-gray-700 border-gray-600' 
                : idx === question.correctIndex 
                  ? 'bg-green-900 border-green-600' 
                  : selected === idx 
                    ? 'bg-red-900 border-red-600' 
                    : 'bg-gray-900 border-gray-700 opacity-60'}
            `}
          >
            {opt}
          </button>
        ))}
      </div>

      {selected !== null && !showHint && selected !== question.correctIndex && (
        <button
          onClick={() => setShowHint(true)}
          className="mt-4 text-blue-400 hover:text-blue-300"
        >
          Ver dica
        </button>
      )}

      {showHint && (
        <div className="mt-4 p-4 bg-blue-950 border border-blue-800 rounded">
          <strong>Dica:</strong> {question.hint}
        </div>
      )}
    </div>
  );
}