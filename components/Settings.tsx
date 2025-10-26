import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <header className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Manage your model preferences for the AI Lab.
        </p>
      </header>

      <div className="mt-6 space-y-8 flex-1 overflow-y-auto pr-2">
        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">AI Governance</h2>
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            In an enterprise setting, you can configure which models are available and set usage limits.
          </p>
           <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-300">Corporate governance controls for model access, prompt libraries, and usage tracking will be available on the Enterprise Plan.</p>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;