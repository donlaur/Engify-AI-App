import { Metadata } from 'next';
import { ScrumMeetingAgent } from '@/components/agents/ScrumMeetingAgent';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Engineering Leadership Prep Tool | Engify.ai',
  description:
    'Get multi-perspective analysis on engineering problems from Director of Engineering, Engineering Manager, Tech Lead, and Architect. Prepare for engineering leadership meetings and ARB reviews.',
};

export default function MultiAgentPage() {
  return (
    <MainLayout>
      <div className="container py-8">
        <ScrumMeetingAgent />
      </div>
    </MainLayout>
  );
}
