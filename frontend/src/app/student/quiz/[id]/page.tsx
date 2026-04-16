'use client';

import QuizEngine from '../_components/QuizEngine';

export default function QuizSessionPage({ params }: { params: { id: string } }) {
  // In a real production app, we would fetch the quiz data here via TanStack Query
  // and pass it down to the engine.
  return (
    <div className="bg-black min-h-screen">
      <QuizEngine params={params} />
    </div>
  );
}
