import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <header className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Manage your API keys and model preferences for the AI Lab.
        </p>
      </header>

      <div className="mt-6 space-y-8 flex-1 overflow-y-auto pr-2">
        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">API Keys</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Provide your own API keys to use different models. This is an enterprise feature.
          </p>
          <div className="mt-4 space-y-4 max-w-lg">
            <ApiKeyInput label="Google AI" id="google-api-key" placeholder="Enter your Google AI API Key" />
            <ApiKeyInput label="OpenAI" id="openai-api-key" placeholder="Enter your OpenAI API Key" />
            <ApiKeyInput label="Anthropic" id="anthropic-api-key" placeholder="Enter your Anthropic API Key" />
          </div>
        </section>

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

interface ApiKeyInputProps {
    label: string;
    id: string;
    placeholder: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ label, id, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
        </label>
        <div className="mt-1 relative">
            <input
                type="password"
                id={id}
                disabled
                className="w-full p-2 rounded-md bg-slate-200 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 outline-none transition cursor-not-allowed"
                placeholder={placeholder}
            />
            <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-700/50 flex items-center justify-center rounded-md cursor-not-allowed">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-300 dark:bg-slate-600 px-2 py-1 rounded-full">
                    Enterprise Feature
                </span>
            </div>
        </div>
    </div>
);


export default Settings;