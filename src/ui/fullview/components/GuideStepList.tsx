import { useRef, useEffect, useState } from 'react';
import type { Step, Screenshot } from '@/core/guides/types';
import { reorderSteps } from '@/core/guides/service';
import { useFullviewStore } from '@/stores/fullview';
import StepCard from '@/ui/sidepanel/StepCard';

interface GuideStepListProps {
  guideId: string;
  steps: Step[];
  screenshots: Map<string, Screenshot>;
  onDescriptionChange: (stepId: string, description: string) => void;
  onDelete: (stepId: string) => void;
  onBlur: (stepId: string) => void;
  onReorder: (newSteps: Step[]) => void;
}

export default function GuideStepList({
  guideId, steps, screenshots,
  onDescriptionChange, onDelete, onBlur, onReorder,
}: GuideStepListProps) {
  const scrollToStepId = useFullviewStore((s) => s.scrollToStepId);
  const setActiveStepId = useFullviewStore((s) => s.setActiveStepId);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const stepRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (scrollToStepId) {
      stepRefs.current.get(scrollToStepId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [scrollToStepId]);

  useEffect(() => {
    if (steps.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveStepId(entry.target.getAttribute('data-step-id'));
          }
        }
      },
      { threshold: 0.5 },
    );
    stepRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [steps, setActiveStepId]);

  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const newSteps = [...steps];
      const [moved] = newSteps.splice(dragIndex, 1);
      newSteps.splice(dragOverIndex, 0, moved);
      reorderSteps(guideId, newSteps.map((s) => s.id));
      onReorder(newSteps);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  if (steps.length === 0) {
    return <p className="text-sm text-center py-12 text-warm">No steps in this guide.</p>;
  }

  return (
    <div className="space-y-6">
      {steps.map((step, idx) => (
        <div
          key={step.id}
          ref={(el) => { if (el) stepRefs.current.set(step.id, el); else stepRefs.current.delete(step.id); }}
          data-step-id={step.id}
        >
          {dragOverIndex === idx && dragIndex !== null && dragIndex !== idx && (
            <div className="h-1 bg-accent rounded-full mx-4 mb-2" />
          )}
          <StepCard
            step={step}
            screenshot={screenshots.get(step.id)}
            onDescriptionChange={onDescriptionChange}
            onDelete={onDelete}
            onBlur={onBlur}
            dragHandleProps={{
              onDragStart: (e: React.DragEvent) => { setDragIndex(idx); e.dataTransfer.effectAllowed = 'move'; },
              onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragOverIndex(idx); },
              onDragEnd: handleDragEnd,
            }}
          />
        </div>
      ))}
    </div>
  );
}
