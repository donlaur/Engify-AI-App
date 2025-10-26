import React, { useState } from 'react';
import { onboardingJourney, OnboardingStep } from '../data/onboarding_steps';

const OnboardingJourney: React.FC = () => {
    const [steps, setSteps] = useState<OnboardingStep[]>(onboardingJourney);

    const toggleStep = (id: number) => {
        setSteps(steps.map(step =>
            step.id === id ? { ...step, isCompleted: !step.isCompleted } : step
        ));
    };

    const completedSteps = steps.filter(step => step.isCompleted).length;
    const progressPercentage = (completedSteps / steps.length) * 100;

    return (
        <div className="flex flex-col h-full">
            <header className="pb-4 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your AI Onboarding Journey</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                    A 5-day plan to take you from AI curious to AI fluent.
                </p>
            </header>

            <div className="mt-6">
                <h2 className="text-lg font-semibold">Your Progress</h2>
                <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{completedSteps} of {steps.length} steps completed</p>
            </div>

            <div className="mt-8 space-y-4 flex-1 overflow-y-auto pr-2">
                {steps.map((step) => (
                    <div key={step.id} className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start space-x-4">
                        <input
                            type="checkbox"
                            checked={step.isCompleted}
                            onChange={() => toggleStep(step.id)}
                            className="h-6 w-6 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 mt-1 cursor-pointer"
                        />
                        <div className="flex-1">
                            <h3 className={`font-semibold ${step.isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                                {step.title}
                            </h3>
                            <p className={`text-sm mt-1 ${step.isCompleted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                {step.description}
                            </p>
                             <button className="mt-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                {step.actionText} &rarr;
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OnboardingJourney;
