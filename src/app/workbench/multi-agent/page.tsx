import { Metadata } from 'next';
import { MultiAgentWorkbench } from '@/components/features/MultiAgentWorkbench';

export const metadata: Metadata = {
  title: 'Multi-Agent Team Simulation | Engify.ai',
  description:
    'Simulate team discussions with AI playing different roles - learn how Engineers, Architects, PMs, and Directors think',
};

export default function MultiAgentPage() {
  return <MultiAgentWorkbench />;
}
