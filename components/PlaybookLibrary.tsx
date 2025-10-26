import React, { useState } from 'react';
import { playbookCategories, PlaybookRecipe } from '../data/playbooks';

const PlaybookLibrary: React.FC = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<PlaybookRecipe | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add a small visual feedback
    alert('Prompt copied to clipboard!');
  };

  return (
    <div className="flex flex-col h-full">
      <header className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Playbook Library</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          A curated collection of strategic playbooks to integrate AI into your daily tasks.
        </p>
      </header>
      
      <div className="mt-6">
        <div className="relative">
          <input 
            type="search"
            placeholder="Search playbooks..."
            className="w-full p-3 pl-10 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
           <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
             <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
            </div>
        </div>
      </div>

      <div className="mt-6 space-y-8 flex-1 overflow-y-auto pr-2">
        {playbookCategories.map((category) => (
          <section key={category.id}>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">{category.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white dark:bg-slate-800/50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200 dark:border-slate-700"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <h3 className="font-semibold text-indigo-600 dark:text-indigo-400">{recipe.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{recipe.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      {selectedRecipe && (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedRecipe(null)}
        >
            <div 
                className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedRecipe.title}</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2 mb-4">{selectedRecipe.description}</p>
                <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-[50vh] overflow-y-auto">
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                        {selectedRecipe.prompt}
                    </p>
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <button
                        onClick={() => setSelectedRecipe(null)}
                        className="px-4 py-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded-lg font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => handleCopy(selectedRecipe.prompt)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors"
                    >
                        Copy Prompt
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookLibrary;