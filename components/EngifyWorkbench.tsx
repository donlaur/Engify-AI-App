import React, { useState, useEffect } from 'react';
import { KICKOFF_PLAN_PROMPT_TEMPLATE } from '../services/agentService';


type Model = 'gemini-2.5-flash' | 'gemini-2.5-pro';
type ActiveTab = 'tech-debt-strategist' | 'post-mortem-facilitator' | 'user-story-generator' | 'knowledge-navigator' | 'okr-architect' | 'project-kickoff' | 'prompt-lab';


const EngifyWorkbench: React.FC<{ initialPrompt?: string }> = ({ initialPrompt }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('tech-debt-strategist');

    useEffect(() => {
        if (initialPrompt) {
            setActiveTab('prompt-lab');
        }
    }, [initialPrompt]);
    
    return (
        <div className="flex flex-col h-full">
            <header className="pb-4 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Workbench</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Run practical, AI-powered workflows to accelerate your team.
                </p>
            </header>

            <div className="mt-4 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    <TabButton name="Technical Debt Strategist" isActive={activeTab === 'tech-debt-strategist'} onClick={() => setActiveTab('tech-debt-strategist')} />
                    <TabButton name="Post-Mortem Facilitator" isActive={activeTab === 'post-mortem-facilitator'} onClick={() => setActiveTab('post-mortem-facilitator')} />
                    <TabButton name="User Story Generator" isActive={activeTab === 'user-story-generator'} onClick={() => setActiveTab('user-story-generator')} />
                    <TabButton name="Knowledge Navigator" isActive={activeTab === 'knowledge-navigator'} onClick={() => setActiveTab('knowledge-navigator')} />
                    <TabButton name="Goal & OKR Architect" isActive={activeTab === 'okr-architect'} onClick={() => setActiveTab('okr-architect')} />
                    <TabButton name="Project Kickoff" isActive={activeTab === 'project-kickoff'} onClick={() => setActiveTab('project-kickoff')} />
                    <TabButton name="Prompt Lab" isActive={activeTab === 'prompt-lab'} onClick={() => setActiveTab('prompt-lab')} />
                </nav>
            </div>
            
            <div className="mt-6 flex-1 overflow-y-auto pr-2 min-h-0">
                {activeTab === 'tech-debt-strategist' && <TechnicalDebtStrategist />}
                {activeTab === 'post-mortem-facilitator' && <PostmortemFacilitator />}
                {activeTab === 'user-story-generator' && <UserStoryGenerator />}
                {activeTab === 'knowledge-navigator' && <KnowledgeNavigator />}
                {activeTab === 'okr-architect' && <OkrArchitect />}
                {activeTab === 'project-kickoff' && <ProjectKickoff />}
                {activeTab === 'prompt-lab' && <PromptLab initialPrompt={initialPrompt} />}
            </div>
        </div>
    );
};

const TabButton: React.FC<{name: string, isActive: boolean, onClick: () => void}> = ({ name, isActive, onClick}) => (
    <button
        onClick={onClick}
        className={`${
            isActive
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
    >
        {name}
    </button>
);

const TechnicalDebtStrategist: React.FC = () => {
    const [step, setStep] = useState(1);
    const [codePasted, setCodePasted] = useState('Paste a block of code, a file, or describe a module here...');
    const [debtAnalysis, setDebtAnalysis] = useState('');
    const [businessContext, setBusinessContext] = useState('This is our core checkout service. It is business-critical and handles all revenue transactions.');
    const [strategicPlan, setStrategicPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        const response = await fetch('/api/analyze-tech-debt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'analyze', code: codePasted })
        });
        const data = await response.json();
        setDebtAnalysis(data.result);
        setStep(2);
        setIsLoading(false);
    };
    
    const handleStrategize = async () => {
        setIsLoading(true);
        const response = await fetch('/api/analyze-tech-debt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'strategize', analysis: debtAnalysis, context: businessContext })
        });
        const data = await response.json();
        setStrategicPlan(data.result);
        setStep(3);
        setIsLoading(false);
    };
    
    return (
        <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <h2 className="font-semibold text-lg mb-1">Step 1: Analyze Codebase for Technical Debt</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Provide a code sample or describe a system module for the AI to analyze.</p>
                <textarea 
                    value={codePasted}
                    onChange={(e) => setCodePasted(e.target.value)}
                    rows={10}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono text-sm"
                    disabled={step > 1}
                />
                 <button onClick={handleAnalyze} disabled={isLoading || step > 1} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                    {isLoading ? 'Analyzing...' : 'Analyze Debt'}
                </button>
            </div>
            
             {step >= 2 && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-1">Step 2: Provide Business Context</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">The AI has analyzed the code. Now, explain the business impact of this module to prioritize the findings.</p>
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg mb-4 max-h-48 overflow-y-auto">
                        <h3 className="font-semibold mb-2">AI Analysis:</h3>
                        <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans">{debtAnalysis}</pre>
                    </div>
                    <textarea 
                        value={businessContext}
                        onChange={(e) => setBusinessContext(e.target.value)}
                        rows={3}
                        placeholder="e.g., 'This is a legacy admin panel with low traffic' or 'This is our primary user authentication service.'"
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        disabled={step > 2}
                    />
                    <button onClick={handleStrategize} disabled={isLoading || step > 2} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                        {isLoading ? 'Generating Plan...' : 'Generate Strategic Plan'}
                    </button>
                </div>
            )}
            
            {step >= 3 && (
                 <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-1">Step 3: Review Strategic Remediation Plan</h2>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">This plan frames the technical debt in terms of business risk and impact, ready for discussion with stakeholders.</p>
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-sans">{strategicPlan}</pre>
                    </div>
                    <button onClick={() => { setStep(1); setDebtAnalysis(''); setStrategicPlan(''); }} className="mt-4 text-sm font-semibold text-indigo-600 hover:underline">Start Over</button>
                </div>
            )}
        </div>
    );
};


const PostmortemFacilitator: React.FC = () => {
    const [summary, setSummary] = useState('The user authentication service experienced a 45-minute outage, resulting in a 100% login failure rate for all users.');
    const [timeline, setTimeline] = useState('14:00 - Deployment of new version of auth-service begins.\n14:05 - First PagerDuty alerts fire for high login failure rates.\n14:10 - On-call engineer begins investigation.\n14:25 - Incident is escalated to the core services team.\n14:35 - Root cause identified as a misconfigured environment variable in the new deployment.\n14:40 - Rollback to the previous version is initiated.\n14:45 - Services restored, login success rate returns to normal.');
    const [impact, setImpact] = useState('All users were unable to log in for 45 minutes. ~5,000 failed login attempts were recorded. Customer support received over 200 tickets related to the outage.');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');
        try {
            const response = await fetch('/api/generate-postmortem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary, timeline, impact })
            });
            if (!response.ok) {
                throw new Error('Failed to generate post-mortem from the server.');
            }
            const data = await response.json();
            setResult(data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 h-full">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div>
                    <label htmlFor="summary" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Incident Summary</label>
                    <textarea id="summary" rows={3} value={summary} onChange={e => setSummary(e.target.value)} className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"/>
                </div>
                <div>
                    <label htmlFor="timeline" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key Timeline Events</label>
                    <textarea id="timeline" rows={7} value={timeline} onChange={e => setTimeline(e.target.value)} className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"/>
                </div>
                <div>
                    <label htmlFor="impact" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Impact</label>
                    <textarea id="impact" rows={4} value={impact} onChange={e => setImpact(e.target.value)} className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"/>
                </div>
                 <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isLoading ? 'Facilitating...' : 'Generate Post-Mortem'}
                </button>
            </form>
             <div className="mt-6 lg:mt-0 bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                <h2 className="text-xl font-semibold mb-3">Generated Post-Mortem (RCA)</h2>
                <div className="flex-1 mt-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 overflow-y-auto relative border border-slate-200 dark:border-slate-700">
                    {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center"><p>Thinking...</p></div>}
                    {result ? <pre className="text-sm whitespace-pre-wrap font-sans">{result}</pre> : <p className="text-sm text-slate-500">The post-mortem document will be generated here.</p>}
                </div>
            </div>
        </div>
    );
};


const UserStoryGenerator: React.FC = () => {
    const [step, setStep] = useState(1);
    const [featureBrief, setFeatureBrief] = useState('Users should be able to export their data as a CSV file from their profile page.');
    const [clarifyingQuestions, setClarifyingQuestions] = useState('');
    const [userAnswers, setUserAnswers] = useState('');
    const [generatedStories, setGeneratedStories] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleStep1 = async () => {
        setIsLoading(true);
        const response = await fetch('/api/user-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clarify', brief: featureBrief })
        });
        const data = await response.json();
        setClarifyingQuestions(data.result);
        setStep(2);
        setIsLoading(false);
    };
    
    const handleStep2 = async () => {
        setIsLoading(true);
        const response = await fetch('/api/user-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'generate', brief: featureBrief, answers: userAnswers })
        });
        const data = await response.json();
        setGeneratedStories(data.result);
        setStep(3);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <h2 className="font-semibold text-lg mb-1">Step 1: Provide Feature Brief</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Describe the feature you want to build at a high level.</p>
                <textarea 
                    value={featureBrief}
                    onChange={(e) => setFeatureBrief(e.target.value)}
                    rows={4}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    disabled={step > 1}
                />
                 <button onClick={handleStep1} disabled={isLoading || step > 1} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                    {isLoading ? 'Analyzing...' : 'Generate Clarifying Questions'}
                </button>
            </div>
            
             {step >= 2 && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-1">Step 2: Answer Clarifying Questions</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">The AI has identified some ambiguities. Provide answers to help it build better user stories.</p>
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg mb-4 max-h-48 overflow-y-auto">
                        <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans">{clarifyingQuestions}</pre>
                    </div>
                    <textarea 
                        value={userAnswers}
                        onChange={(e) => setUserAnswers(e.target.value)}
                        rows={4}
                        placeholder="Answer the questions here..."
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        disabled={step > 2}
                    />
                    <button onClick={handleStep2} disabled={isLoading || step > 2} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                        {isLoading ? 'Generating...' : 'Generate User Stories'}
                    </button>
                </div>
            )}
            
            {step >= 3 && (
                 <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-1">Step 3: Review Generated User Stories</h2>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Here are the user stories generated based on your input.</p>
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-sans">{generatedStories}</pre>
                    </div>
                    <button onClick={() => { setStep(1); setClarifyingQuestions(''); setUserAnswers(''); setGeneratedStories(''); }} className="mt-4 text-sm font-semibold text-indigo-600 hover:underline">Start Over</button>
                </div>
            )}
        </div>
    );
};

const KnowledgeNavigator: React.FC = () => {
    const [sourceText, setSourceText] = useState('Paste a design document, meeting notes, or any text here...');
    const [question, setQuestion] = useState('What are the key decisions from this document?');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setAnswer('');
        try {
            const response = await fetch('/api/rag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source_text: sourceText, query: question })
            });
             if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to get answer from the server.');
            }
            const data = await response.json();
            setAnswer(data.answer);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to get answer. Check the console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 h-full">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div>
                    <label htmlFor="source-text" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Source Knowledge</label>
                    <textarea
                        id="source-text"
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        rows={15}
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                </div>
                 <div>
                    <label htmlFor="question" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Question</label>
                    <input
                        id="question"
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                </div>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                    {isLoading ? 'Searching...' : 'Get Answer'}
                </button>
            </form>
            <div className="mt-6 lg:mt-0 bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                <h2 className="text-xl font-semibold mb-3">Generated Answer</h2>
                <div className="flex-1 mt-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 overflow-y-auto relative border border-slate-200 dark:border-slate-700">
                    {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center"><p>Thinking...</p></div>}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {answer ? <pre className="text-sm whitespace-pre-wrap font-sans">{answer}</pre> : <p className="text-sm text-slate-500">The answer will appear here.</p>}
                </div>
            </div>
        </div>
    );
};

const OkrArchitect: React.FC = () => {
    const [userGoal, setUserGoal] = useState('Improve product quality this quarter');
    const [teamContext, setTeamContext] = useState('A 5-person feature team responsible for the main web application.');
    const [timeframe, setTimeframe] = useState('Q3');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');
        const response = await fetch('/api/generate-okrs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_goal: userGoal, team_context: teamContext, timeframe })
        });
        const data = await response.json();
        setResult(data.result);
        setIsLoading(false);
    };

    return (
         <div className="lg:grid lg:grid-cols-2 lg:gap-8 h-full">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div>
                    <label htmlFor="user-goal" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">High-Level Goal</label>
                    <input id="user-goal" type="text" value={userGoal} onChange={e => setUserGoal(e.target.value)} className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"/>
                </div>
                <div>
                    <label htmlFor="team-context" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Team / Context</label>
                    <textarea id="team-context" rows={3} value={teamContext} onChange={e => setTeamContext(e.target.value)} className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"/>
                </div>
                <div>
                    <label htmlFor="timeframe" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Timeframe</label>
                    <input id="timeframe" type="text" value={timeframe} onChange={e => setTimeframe(e.target.value)} className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"/>
                </div>
                 <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isLoading ? 'Architecting...' : 'Generate OKRs'}
                </button>
            </form>
             <div className="mt-6 lg:mt-0 bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                <h2 className="text-xl font-semibold mb-3">Generated OKRs</h2>
                <div className="flex-1 mt-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 overflow-y-auto relative border border-slate-200 dark:border-slate-700">
                    {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center"><p>Thinking...</p></div>}
                    {result ? <pre className="text-sm whitespace-pre-wrap font-sans">{result}</pre> : <p className="text-sm text-slate-500">The OKRs will appear here.</p>}
                </div>
            </div>
        </div>
    );
};

const ProjectKickoff: React.FC = () => {
    const [projectGoal, setProjectGoal] = useState('Launch a new user onboarding flow');
    const [stakeholders, setStakeholders] = useState('Jane (PM), David (Design), Engineering Team');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');
        const response = await fetch('/api/generate-kickoff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_goal: projectGoal, stakeholders: stakeholders })
        });
        const data = await response.json();
        setResult(data.result);
        setIsLoading(false);
    };
    
    return (
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 h-full">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div>
                    <label htmlFor="project-goal" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Goal</label>
                    <textarea id="project-goal" rows={3} value={projectGoal} onChange={e => setProjectGoal(e.target.value)} className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"/>
                </div>
                <div>
                    <label htmlFor="stakeholders" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key Stakeholders</label>
                    <input id="stakeholders" type="text" value={stakeholders} onChange={e => setStakeholders(e.target.value)} className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"/>
                </div>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isLoading ? 'Generating Plan...' : 'Generate Kickoff Plan'}
                </button>
            </form>
            <div className="mt-6 lg:mt-0 bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                <h2 className="text-xl font-semibold mb-3">Generated Kickoff Plan</h2>
                <div className="flex-1 mt-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 overflow-y-auto relative border border-slate-200 dark:border-slate-700">
                     {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center"><p>Thinking...</p></div>}
                    {result ? <pre className="text-sm whitespace-pre-wrap font-sans">{result}</pre> : <p className="text-sm text-slate-500">The project plan will appear here.</p>}
                </div>
            </div>
        </div>
    );
};

const PromptLab: React.FC<{ initialPrompt?: string }> = ({ initialPrompt }) => {
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState<Model>('gemini-2.5-flash');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setPrompt(initialPrompt || KICKOFF_PLAN_PROMPT_TEMPLATE.replace('{{projectGoal}}', 'My project goal').replace('{{stakeholders}}', 'Me'));
    }, [initialPrompt]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');
        const response = await fetch('/api/execute-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, model })
        });
        const data = await response.json();
        setResult(data.result);
        setIsLoading(false);
    };

    return (
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 h-full">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div>
                     <label htmlFor="model-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model</label>
                    <select
                        id="model-select"
                        value={model}
                        onChange={(e) => setModel(e.target.value as Model)}
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"
                    >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-2.5-pro" disabled>Gemini 2.5 Pro (coming soon)</option>
                    </select>
                </div>
                <div>
                     <label htmlFor="prompt-text" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Prompt</label>
                    <textarea
                        id="prompt-text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={15}
                         className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 font-mono text-sm"
                    />
                </div>
                 <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isLoading ? 'Executing...' : 'Execute Prompt'}
                </button>
            </form>
             <div className="mt-6 lg:mt-0 bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                <h2 className="text-xl font-semibold mb-3">Model Output</h2>
                <div className="flex-1 mt-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 overflow-y-auto relative border border-slate-200 dark:border-slate-700">
                    {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center"><p>Thinking...</p></div>}
                    {result ? <pre className="text-sm whitespace-pre-wrap font-sans">{result}</pre> : <p className="text-sm text-slate-500">The model output will appear here.</p>}
                </div>
            </div>
        </div>
    );
};

export default EngifyWorkbench;