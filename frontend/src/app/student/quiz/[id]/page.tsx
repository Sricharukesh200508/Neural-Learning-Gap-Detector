'use client';

import { use } from 'react';
import QuizEngine from '../_components/QuizEngine';

export default function QuizSessionPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise — required in Next.js 15+
  const { id } = use(params);
  return (
    <div className="bg-black min-h-screen">
      <QuizEngine quizId={id} />
    </div>
  );
}
