
import React, { useState } from 'react';
import { learningPathways, LearningPathway, PathwayStep } from '../data/learning_pathways';

interface LearningPathwaysProps {
    setActiveTool: (tool: 'learning-hub' | 'playbooks' | 'workbench' | 'settings' | 'onboarding' | 'pathways') => void;
}

const LearningPathways: React.FC<LearningPathwaysProps> = ({ setActiveTool }) => {
    const [selectedPathway, setSelectedPathway] = useState<LearningPathway | null>(null);

    const handleNavigate = (step: PathwayStep) => {
        if (step.type === 'external_link') {
            window.open(step.targetId, '_blank');
            return;
        }

        // In a real app with routing, this would be more sophisticated.
        // For now, it just switches the active tool.
        if (step.type === 'article') {
            setActiveTool('learning-hub');
        } else if (step.type === 'playbook') {
            setActiveTool('playbooks');
        } else if (step.type === 'workbench') {
            setActiveTool('workbench');
            // We could even pass a prop to the workbench to open the correct tab
        }
    };
    
    if (selectedPathway) {
        return (
            <div className="flex flex-col h-full">
                 <header className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <button onClick={() => setSelectedPathway(null)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mb-2">&larr; Back to Pathways</button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedPathway.title}</h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        {selectedPathway.description}
                    </p>
                </header>
                 <div className="mt-8 space-y-4 flex-1 overflow-y-auto pr-2">
                    {selectedPathway.steps.map((step, index) => (
                        <div key={step.id} className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start space-x-4">
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">
                                    {index + 1}
                                </div>
                               {index < selectedPathway.steps.length - 1 && <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mt-2"></div>}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">
                                    {step.title}
                                </h3>
                                <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
                                    {step.description}
                                </p>
                                <button
                                    onClick={() => handleNavigate(step)}
                                    className="mt-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    {step.actionText} &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <header className="pb-4 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Learning Pathways</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Curated, step-by-step guides to master key AI skills and concepts.
                </p>
            </header>

            <div className="mt-6 space-y-4 flex-1 overflow-y-auto pr-2">
                {learningPathways.map((pathway) => (
                    <div
                        key={pathway.id}
                        className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200 dark:border-slate-700"
                        onClick={() => setSelectedPathway(pathway)}
                    >
                        <h2 className="font-semibold text-xl text-indigo-600 dark:text-indigo-400">{pathway.title}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{pathway.description}</p>
                        <div className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {pathway.steps.length} Steps
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LearningPathways;