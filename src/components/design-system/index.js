/**
 * design-system/index.js — barrel export for the Design System Foundation
 * (docs/architecture/DESIGN_SYSTEM.md). Import primitives from
 * '@/components/design-system' rather than deep-importing each file.
 */
export { default as PageLayout } from './PageLayout';
export { default as PageHeader } from './PageHeader';
export { default as PageSection } from './PageSection';
export { default as SectionToolbar } from './SectionToolbar';
export { default as StatCard } from './StatCard';
export { default as MetricCard } from './MetricCard';
export { default as StatusBadge } from './StatusBadge';
export { default as InfoCard } from './InfoCard';
export { default as ActionCard } from './ActionCard';
export { default as EmptyState } from './EmptyState';
export { default as DataPanel } from './DataPanel';
export { default as SplitPanel } from './SplitPanel';
export { default as StickySidebar } from './StickySidebar';
export { default as PropertyGrid } from './PropertyGrid';
export { default as ResponsiveTable } from './ResponsiveTable';
export { default as Timeline } from './Timeline';
export { default as ProgressRing } from './ProgressRing';
export { default as StepBadge } from './StepBadge';
export { default as CTAButton } from './CTAButton';

export * from './tokens';
