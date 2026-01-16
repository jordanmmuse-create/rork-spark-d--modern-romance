import { TimelineItem } from '@/types';

export const SAMPLE_TIMELINE_ITEMS: TimelineItem[] = [
  {
    id: 'timeline-1',
    type: 'milestone',
    date: '2025-11-10',
    title: 'One-Year Anniversary',
    summary: 'You added your 1-year anniversary dinner as a milestone.',
    badge: 'Milestone 🎉',
    icon: '🎉',
    source: 'Milestones',
  },
  {
    id: 'timeline-2',
    type: 'spark-saved',
    date: '2025-10-03',
    title: 'The Stress Share',
    summary: 'You saved this Spark to help each other share external stressors.',
    badge: 'Saved Spark 🔥',
    icon: '🔥',
    source: 'Sparks Library',
  },
  {
    id: 'timeline-3',
    type: 'memory',
    date: '2025-09-22',
    title: 'Rooftop Sushi Night',
    summary: 'You wrote: "Sushi after your exam — a small moment that meant a lot."',
    badge: 'Memory 💌',
    icon: '💌',
    source: 'Shared Memories',
  },
  {
    id: 'timeline-4',
    type: 'journal',
    date: '2025-08-15',
    title: 'Weekly Reflection',
    summary: 'Today I felt grateful for the way they listened without trying to fix everything...',
    badge: 'Journal ✍️',
    icon: '✍️',
    source: 'My Journal',
  },
];

export interface VaultCategory {
  id: string;
  label: string;
  icon: string;
  subtext: string;
  count: number;
  color: string;
}

export const VAULT_CATEGORIES: VaultCategory[] = [
  {
    id: 'saved-sparks',
    label: 'Saved Sparks',
    icon: 'bookmark',
    subtext: 'Prompts, games & ideas to keep',
    count: -1,
    color: '#3B82F6',
  },
  {
    id: 'shared-memories',
    label: 'Shared Memories',
    icon: 'images',
    subtext: 'Photos, notes & inside jokes you\'ve captured',
    count: 24,
    color: '#F97316',
  },
  {
    id: 'my-journal',
    label: 'My Journal',
    icon: 'book-open',
    subtext: 'Revisit the moments that moved you',
    count: 18,
    color: '#10B981',
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: 'star',
    subtext: 'Sparks, plans, & go-to ideas that speak to you',
    count: 8,
    color: '#EF4444',
  },
  {
    id: 'milestones',
    label: 'Milestones',
    icon: 'flag',
    subtext: 'Celebrate your biggest relationship victories',
    count: 5,
    color: '#FBBF24',
  },
];
