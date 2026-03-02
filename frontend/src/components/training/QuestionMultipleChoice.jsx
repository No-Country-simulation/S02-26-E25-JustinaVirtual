//---------------- version 2 ------------------
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
    <div className="
      p-6 rounded-xl max-w-2xl mx-auto
      bg-white dark:bg-gray-800
      shadow-sm dark:shadow-gray-900/50
      border border-gray-200 dark:border-gray-700
      transition-shadow duration-200
    ">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        {question.text}
      </h3>

      <div className="space-y-3">
        {question.options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrectAnswer = idx === question.correctIndex;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={`
               border border-gray-300 dark:border-gray-600
                w-full p-4 text-left rounded-lg font-medium transition-all duration-150
                appearance-none outline-none ring-0
                focus:shadow-md focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-offset-2
                shadow-sm hover:shadow-md 
                disabled:cursor-not-allowed disabled:opacity-60 
                /* Default / Not selected */
                ${!isSelected
                  ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  : ''}

                /* Selected - Correct */
                ${isSelected && isCorrectAnswer
                  ? 'bg-green-100 dark:bg-green-700/70 text-green-700 dark:text-green-200 border border-green-300 dark:border-green-600 shadow-md'
                  : ''}

                /* Selected - Wrong */
                ${isSelected && !isCorrectAnswer
                  ? 'bg-red-100 dark:bg-red-700/70 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-600 shadow-md'
                  : ''}

                /* Focus ring colors */
                focus:ring-green-500/40 dark:focus:ring-green-400/40
                ${isSelected && !isCorrectAnswer ? 'focus:ring-red-500/40 dark:focus:ring-red-400/40' : ''}
              `}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && !showHint && selected !== question.correctIndex && (
        <button
          onClick={() => setShowHint(true)}
          className="
            mt-6 px-5 py-2.5 rounded-lg text-sm font-medium
            text-blue-600 dark:text-blue-400
            hover:text-blue-800 dark:hover:text-blue-300
            hover:bg-blue-50 dark:hover:bg-blue-950/50
            transition-colors
          "
        >
          Ver dica
        </button>
      )}

      {showHint && (
        <div className="
          mt-6 p-5 rounded-lg
          bg-blue-50 dark:bg-blue-900/70
          border border-blue-200 dark:border-blue-800/50
          text-blue-800 dark:text-blue-200
          shadow-sm
        ">
          <strong className="font-semibold">Dica:</strong> {question.hint}
        </div>
      )}
    </div>
  );
}