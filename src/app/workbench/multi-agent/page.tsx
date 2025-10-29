import { Metadata } from 'next';
import { MultiAgentWorkbench } from '@/components/features/MultiAgentWorkbench';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Multi-Agent Team Simulation | Engify.ai',
  description:
    'Simulate team discussions with AI playing different roles - learn how Engineers, Architects, PMs, and Directors think',
};

export default function MultiAgentPage() {
  return (
    <>
      <Header />
      <MultiAgentWorkbench />
      <Footer />
    </>
  );
}
