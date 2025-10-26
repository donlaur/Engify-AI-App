import React, { useState } from 'react';
import { PlaybookIcon, WorkbenchIcon, SettingsIcon, LearningIcon, OnboardingIcon, PathwaysIcon } from './components/icons/SidebarIcons';
import PlaybookLibrary from './components/PlaybookLibrary';
import EngifyWorkbench from './components/EngifyWorkbench';
import Settings from './components/Settings';
import LearningHub from './components/LearningHub';
import OnboardingJourney from './components/OnboardingJourney';
import LearningPathways from './components/LearningPathways';

export type Tool = 'onboarding' | 'pathways' | 'learning-hub' | 'playbooks' | 'workbench' | 'settings';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('onboarding');
  const [promptForLab, setPromptForLab] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSendToWorkbench = (prompt: string) => {
    setPromptForLab(prompt);
    setActiveTool('workbench');
    setIsSidebarOpen(false); // Close sidebar on navigation
  };
  
  const handleSetActiveTool = (tool: Tool) => {
    setActiveTool(tool);
    setIsSidebarOpen(false); // Close sidebar on navigation
  };


  const renderTool = () => {
    switch (activeTool) {
      case 'onboarding':
        return <OnboardingJourney />;
      case 'pathways':
        return <LearningPathways setActiveTool={handleSetActiveTool} />;
      case 'learning-hub':
        return <LearningHub onSendToWorkbench={handleSendToWorkbench} />;
      case 'playbooks':
        return <PlaybookLibrary />;
      case 'workbench':
        return <EngifyWorkbench initialPrompt={promptForLab} />;
      case 'settings':
        return <Settings />;
      default:
        return <OnboardingJourney />;
    }
  };

  return (
    <div className="flex h-screen font-sans bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/30 z-30 transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      <div className={`fixed lg:relative inset-y-0 left-0 w-64 z-40 transition-transform transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <Sidebar activeTool={activeTool} setActiveTool={handleSetActiveTool} />
      </div>
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {renderTool()}
        </div>
      </main>
    </div>
  );
};

interface SidebarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool }) => (
  <aside className="w-64 h-full bg-white dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700/50 flex flex-col">
    <div className="flex flex-col h-20 px-6 border-b border-slate-200 dark:border-slate-700/50 justify-center">
        <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Engify.ai
            </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">From AI Fear to AI Fluency.</p>
    </div>
    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
      <NavItem icon={<OnboardingIcon />} label="Onboarding" isActive={activeTool === 'onboarding'} onClick={() => setActiveTool('onboarding')} />
      <NavItem icon={<PathwaysIcon />} label="Pathways" isActive={activeTool === 'pathways'} onClick={() => setActiveTool('pathways')} />
      <NavItem icon={<LearningIcon />} label="Learning Hub" isActive={activeTool === 'learning-hub'} onClick={() => setActiveTool('learning-hub')} />
      <NavItem icon={<PlaybookIcon />} label="Playbooks" isActive={activeTool === 'playbooks'} onClick={() => setActiveTool('playbooks')} />
      <NavItem icon={<WorkbenchIcon />} label="Workbench" isActive={activeTool === 'workbench'} onClick={() => setActiveTool('workbench')} />
      <div className="flex-grow"></div>
      <NavItem icon={<SettingsIcon />} label="Settings" isActive={activeTool === 'settings'} onClick={() => setActiveTool('settings')} isDisabled={false} />
    </nav>
     <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">
        <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-colors text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">
                G
            </div>
            <div className="text-left">
                <div className="font-semibold">Guest User</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Sign In</div>
            </div>
        </button>
    </div>
  </aside>
);

const MobileHeader: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => (
    <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 sticky top-0 z-10">
        <button onClick={onMenuClick} className="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
        <div className="flex items-center space-x-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Engify.ai
            </h1>
        </div>
    </header>
);


interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isDisabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, isDisabled }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-colors
      ${isActive
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-white'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
      }
      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    {icon}
    <span>{label}</span>
     {isDisabled && <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">Soon</span>}
  </button>
);

export default App;