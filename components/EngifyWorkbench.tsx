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

export default EngifyWorkbench;--- START OF FILE api/generate-kickoff.py ---

import os
import google.generativeai as genai
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)

            project_goal = data.get('project_goal')
            stakeholders = data.get('stakeholders')
            
            if not project_goal or not stakeholders:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Missing project_goal or stakeholders'}).encode())
                return

            api_key = os.environ.get('API_KEY')
            if not api_key:
                raise ValueError("API_KEY environment variable not set")
            genai.configure(api_key=api_key)

            model = genai.GenerativeModel('gemini-2.5-flash')
            
            KICKOFF_PLAN_PROMPT_TEMPLATE = """Act as an expert Principal Engineer and a seasoned Project Manager combined. Your task is to create a comprehensive, well-structured project kickoff plan based on the minimal information provided. The output should be clear, concise, and actionable, formatted in Markdown.

The plan must include the following sections:

### 1. Project Overview
*   **Background:** Briefly explain why this project is important now. Infer the business context.
*   **Problem Statement:** Clearly articulate the specific problem being solved for the user or business.

### 2. Goals and Scope
*   **In-Scope Goals:** A bulleted list of what this project will achieve.
*   **Out-of-Scope (Non-Goals):** A bulleted list of related items that are explicitly NOT part of this project. This is critical for setting expectations.

### 3. Key Stakeholders
*   A list of the stakeholders provided, with their likely roles and responsibilities inferred (e.g., "Product Manager - responsible for requirements," "Head of Security - responsible for compliance review").

### 4. Initial Risk Assessment
*   Identify at least 3 potential risks (e.g., technical, timeline, resource, adoption) and suggest a brief mitigation strategy for each.

### 5. Open Questions
*   List critical questions that the team needs to answer before development can begin.

---
**INPUT:**

*   **Project Goal:** {project_goal}
*   **Key Stakeholders:** {stakeholders}
---

**OUTPUT (Markdown Format):**"""

            prompt = KICKOFF_PLAN_PROMPT_TEMPLATE.format(project_goal=project_goal, stakeholders=stakeholders)
            
            response = model.generate_content(prompt)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'result': response.text}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())--- START OF FILE api/execute-prompt.py ---

import os
import google.generativeai as genai
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)

            prompt = data.get('prompt')
            model_name = data.get('model', 'gemini-2.5-flash')
            
            if not prompt:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Missing prompt'}).encode())
                return
            
            api_key = os.environ.get('API_KEY')
            if not api_key:
                raise ValueError("API_KEY environment variable not set")

            genai.configure(api_key=api_key)

            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'result': response.text}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
--- START OF FILE api/generate-okrs.py ---

import os
import google.generativeai as genai
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            user_goal = data.get('user_goal')
            team_context = data.get('team_context')
            timeframe = data.get('timeframe')

            if not all([user_goal, team_context, timeframe]):
                 self.send_response(400)
                 self.send_header('Content-type', 'application/json')
                 self.end_headers()
                 self.wfile.write(json.dumps({'error': 'Missing one or more required fields'}).encode())
                 return
            
            api_key = os.environ.get('API_KEY')
            if not api_key:
                raise ValueError("API_KEY environment variable not set")
            genai.configure(api_key=api_key)

            model = genai.GenerativeModel('gemini-2.5-flash')
            
            OKR_PROMPT_TEMPLATE = """Act as an executive coach and strategic planning expert, specializing in the OKR (Objectives and Key Results) framework. Your task is to guide a user from a high-level goal to a set of well-defined, ambitious, and measurable OKRs. The output must be formatted in clear Markdown.

**Your Process:**
1.  **Deconstruct the Goal:** Analyze the user's high-level goal and context.
2.  **Define a Powerful Objective:** Reframe the user's goal into a single, inspirational, and qualitative Objective. An Objective is the "what" we want to achieve. It should be memorable and motivational.
3.  **Generate Measurable Key Results:** Create 3-4 specific, measurable Key Results that track progress towards the Objective. Key Results are the "how" we know we are successful. They must be quantitative and outcome-focused, not a list of tasks.
4.  **Validate with SMART:** For each Key Result, briefly explain how it meets the SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound).
5.  **Suggest Initiatives:** For each Key Result, suggest 1-2 potential initiatives or projects the team could undertake to achieve it. This connects the strategy to the work.

---
**USER INPUT:**

*   **High-Level Goal:** {user_goal}
*   **Team / Context:** {team_context}
*   **Timeframe:** {timeframe}

---
**OUTPUT (Markdown Format):**

Here is a proposed set of OKRs based on your goal:

### **Objective:** [Your reframed, inspirational Objective]

**Key Results:**

1.  **KR1: [Your first measurable Key Result]**
    *   *SMART Check:* [Briefly explain how this KR is Specific, Measurable, etc.]
    *   *Potential Initiatives:* [Suggest 1-2 example projects]

2.  **KR2: [Your second measurable Key Result]**
    *   *SMART Check:* [Briefly explain how this KR is Specific, Measurable, etc.]
    *   *Potential Initiatives:* [Suggest 1-2 example projects]

3.  **KR3: [Your third measurable Key Result]**
    *   *SMART Check:* [Briefly explain how this KR is Specific, Measurable, etc.]
    *   *Potential Initiatives:* [Suggest 1-2 example projects]"""

            prompt = OKR_PROMPT_TEMPLATE.format(user_goal=user_goal, team_context=team_context, timeframe=timeframe)

            response = model.generate_content(prompt)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'result': response.text}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
--- START OF FILE api/rag.py ---

import os
import google.generativeai as genai
from http.server import BaseHTTPRequestHandler
import json
import numpy as np

# Simple in-memory storage for embeddings for this session
embedding_cache = {}

def get_embedding(text, model):
    if text in embedding_cache:
        return embedding_cache[text]
    try:
        result = genai.embed_content(model=model, content=text)
        embedding_cache[text] = result['embedding']
        return result['embedding']
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return None

def find_best_chunks(query_embedding, chunks, chunk_embeddings):
    """Finds the top N most similar chunks to the query."""
    # Using dot product for similarity, assuming embeddings are normalized
    scores = np.dot(chunk_embeddings, query_embedding)
    
    # Get the indices of the top 3 scores
    top_indices = np.argsort(scores)[-3:][::-1]
    
    return [chunks[i] for i in top_indices]

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            source_text = data.get('source_text')
            query = data.get('query')

            if not source_text or not query:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Missing source_text or query'}).encode())
                return

            api_key = os.environ.get('API_KEY')
            if not api_key:
                raise ValueError("API_KEY environment variable not set")
            genai.configure(api_key=api_key)

            embedding_model = 'models/text-embedding-004'
            generation_model = genai.GenerativeModel('gemini-2.5-flash')

            # 1. Chunk the source text
            chunks = [source_text[i:i+500] for i in range(0, len(source_text), 400)] # Simple overlap chunking
            
            # 2. Get embeddings for chunks
            chunk_embeddings = [get_embedding(chunk, embedding_model) for chunk in chunks]
            # Filter out any None results from embedding errors
            valid_embeddings = [emb for emb in chunk_embeddings if emb is not None]
            if not valid_embeddings:
                raise ValueError("Could not generate embeddings for the source text.")


            # 3. Get embedding for the query
            query_embedding = get_embedding(query, embedding_model)
            if query_embedding is None:
                 raise ValueError("Could not generate embedding for the query.")

            # 4. Find relevant chunks
            relevant_chunks = find_best_chunks(query_embedding, chunks, np.array(valid_embeddings))
            context = "\n".join(relevant_chunks)

            # 5. Generate answer
            prompt = f"""You are a helpful assistant. Answer the user's question based ONLY on the provided context. If the answer is not in the context, say 'I could not find an answer in the provided text.'

CONTEXT:
---
{context}
---

QUESTION: {query}

ANSWER:
"""
            response = generation_model.generate_content(prompt)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'answer': response.text}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())--- START OF FILE api/generate-postmortem.py ---

import os
import google.generativeai as genai
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            summary = data.get('summary')
            timeline = data.get('timeline')
            impact = data.get('impact')

            if not all([summary, timeline, impact]):
                 self.send_response(400)
                 self.send_header('Content-type', 'application/json')
                 self.end_headers()
                 self.wfile.write(json.dumps({'error': 'Missing one or more required fields'}).encode())
                 return
            
            api_key = os.environ.get('API_KEY')
            if not api_key:
                raise ValueError("API_KEY environment variable not set")
            genai.configure(api_key=api_key)

            model = genai.GenerativeModel('gemini-2.5-flash')
            
            POSTMORTEM_PROMPT_TEMPLATE = """Act as an expert SRE (Site Reliability Engineer) and a blameless post-mortem facilitator. Your task is to take the provided incident details and generate a comprehensive, structured post-mortem document in Markdown format. The tone should be objective, blameless, and focused on learning and system improvement.

**Your Process:**
1.  **Synthesize the Summary:** Create a clear, executive-level summary of the incident.
2.  **Analyze the Timeline:** Review the timeline to identify key detection, response, and resolution moments.
3.  **Conduct Root Cause Analysis (RCA):** Based on the details, perform a "5 Whys" style analysis to identify not just the immediate cause, but the underlying systemic issues. Do not blame individuals. Focus on process or system failures.
4.  **Define Actionable Follow-ups:** Propose 3-4 specific, measurable, and actionable follow-up items. Each action item should be aimed at preventing this class of issue from recurring. Assign a suggested owner category (e.g., "Owning Team," "SRE Team").

---
**INCIDENT DETAILS:**

*   **Summary:** {summary}
*   **Timeline:** 
{timeline}
*   **Customer Impact:** {impact}

---
**OUTPUT (Markdown Format):**

# Post-Mortem: [Infer a suitable title from the summary]

## 1. Executive Summary
A brief, one-paragraph overview of the incident, its impact, and the resolution.

## 2. Incident Timeline (Key Events)
A summary of the most critical timestamps from the provided timeline.

## 3. Root Cause Analysis (RCA)
A blameless analysis of the contributing factors. Use the "5 Whys" method to go deep.
*   **Why 1:** 
*   **Why 2:** 
*   **Why 3:** 
*   **Why 4:** 
*   **Why 5:** 
*   **Conclusion:** A summary of the systemic root cause.

## 4. Action Items (Follow-ups)
A list of concrete actions to improve resilience.
*   **Action Item 1:** [Description of action] (Owner: [Suggested Owner])
*   **Action Item 2:** [Description of action] (Owner: [Suggested Owner])
*   **Action Item 3:** [Description of action] (Owner: [Suggested Owner])
"""

            prompt = POSTMORTEM_PROMPT_TEMPLATE.format(summary=summary, timeline=timeline, impact=impact)

            response = model.generate_content(prompt)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'result': response.text}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())--- START OF FILE api/analyze-tech-debt.py ---

import os
import google.generativeai as genai
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)

            action = data.get('action')
            api_key = os.environ.get('API_KEY')
            if not api_key:
                raise ValueError("API_KEY environment variable not set")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')

            if action == 'analyze':
                code = data.get('code')
                if not code:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Missing code for analysis'}).encode())
                    return
                
                prompt = f"""Act as a Staff Engineer specializing in code quality and architecture. Analyze the following code or module description for potential technical debt.

Your analysis should:
1.  Identify 3-5 specific "code smells" or architectural issues (e.g., high complexity, tight coupling, lack of tests, magic numbers).
2.  For each issue, briefly explain why it's a problem.
3.  Categorize the debt (e.g., Code Debt, Testing Debt, Architectural Debt).

---
CODE / DESCRIPTION:
{code}
---

ANALYSIS:
"""
                response = model.generate_content(prompt)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'result': response.text}).encode())

            elif action == 'strategize':
                analysis = data.get('analysis')
                context = data.get('context')
                if not analysis or not context:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Missing analysis or context'}).encode())
                    return

                prompt = f"""Act as a Director of Engineering presenting to the CTO. You have a technical debt analysis and the business context for the system. Your task is to create a strategic remediation plan.

The plan should:
1.  **Frame the Problem:** Start with a concise summary that connects the technical debt to business risk (e.g., "This debt increases the risk of production outages and slows down feature development...").
2.  **Prioritize Based on Impact:** Use the business context to prioritize the list of technical debt items.
3.  **Propose Actionable Epics:** Group the high-priority items into 1-2 clear, actionable remediation "epics" or projects.
4.  **Articulate the ROI:** For each epic, explain the return on investment in business terms (e.g., "By refactoring the checkout service, we can reduce bug-fix time by 20% and de-risk our highest revenue-generating feature.").

---
TECHNICAL DEBT ANALYSIS:
{analysis}

BUSINESS CONTEXT:
{context}
---

STRATEGIC REMEDIATION PLAN (Markdown Format):
"""
                response = model.generate_content(prompt)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'result': response.text}).encode())
            
            else:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Invalid action specified'}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
--- START OF FILE api/process-article.py ---

import os
import google.generativeai as genai
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)

            text_content = data.get('text_content')
            action = data.get('action')
            api_key = os.environ.get('API_KEY')

            if not text_content or not action:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing text_content or action"}).encode())
                return

            if not api_key:
                raise ValueError("API_KEY environment variable not set")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')

            if action == 'analyze':
                prompt = f"""Act as an expert analyst. Analyze the following article and provide:
1. A concise, one-paragraph summary.
2. A bulleted list of the top 3-5 most important, actionable key takeaways.

ARTICLE TEXT:
---
{text_content}
---

Your response should be a JSON object with two keys: "summary" and "takeaways" (which should be an array of strings).
"""
                response = model.generate_content(prompt)
                # The Gemini API might return markdown with ```json ... ```, so we need to clean it.
                cleaned_json_string = response.text.replace('```json', '').replace('```', '').strip()
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(cleaned_json_string.encode())
            else:
                result_prompt = ""
                if action == 'generate_playbook':
                    result_prompt = f"""Act as a prompt engineer. Based on the key ideas in the article below, create a single, practical, and reusable prompt "recipe" that a user could add to a playbook. The prompt should be structured to help a user apply the article's main lesson to their own work.

ARTICLE TEXT:
---
{text_content}
---

PLAYBOOK PROMPT RECIPE:
"""
                elif action == 'create_plan':
                    result_prompt = f"""Act as a project manager. Based on the article below, create a high-level, step-by-step action plan for a team to implement its key recommendations.

ARTICLE TEXT:
---
{text_content}
---

ACTION PLAN:
"""
                elif action == 'draft_share':
                    result_prompt = f"""Act as a team lead. Draft a concise and engaging Slack or email message to share the key takeaway from the article below with your team, explaining why it's important for them to read.

ARTICLE TEXT:
---
{text_content}
---

DRAFT MESSAGE:
"""
                
                if result_prompt:
                    response = model.generate_content(result_prompt)
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"result": response.text}).encode())
                else:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Invalid action"}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
--- START OF FILE api/user-story.py ---

import os
import google.generativeai as genai
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)

            action = data.get('action')
            api_key = os.environ.get('API_KEY')
            if not api_key:
                raise ValueError("API_KEY environment variable not set")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')

            if action == 'clarify':
                brief = data.get('brief')
                if not brief:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Missing feature brief'}).encode())
                    return
                
                prompt = f"""Act as a senior Product Manager. I have provided a high-level feature brief. Your task is to analyze it for ambiguities and generate a list of 3-5 critical clarifying questions that an engineer would need answered before they could start development.

FEATURE BRIEF: "{brief}"

CLARIFYING QUESTIONS:
"""
                response = model.generate_content(prompt)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'result': response.text}).encode())

            elif action == 'generate':
                brief = data.get('brief')
                answers = data.get('answers')
                if not brief or not answers:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Missing brief or answers'}).encode())
                    return

                prompt = f"""Act as an expert Agile Product Owner. I will provide you with a feature brief and answers to your clarifying questions. Your task is to generate a set of well-formed user stories that follow the INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable) and include clear acceptance criteria.

FEATURE BRIEF: "{brief}"

ANSWERS TO CLARIFYING QUESTIONS:
"{answers}"

USER STORIES (in Markdown format):
"""
                response = model.generate_content(prompt)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'result': response.text}).encode())
            
            else:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Invalid action specified'}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
--- START OF FILE data/onboarding_steps.ts ---

export interface OnboardingStep {
    id: number;
    title: string;
    description: string;
    actionText: string;
    target: string; // Could be a tool or a specific playbook
    isCompleted: boolean;
}

export const onboardingJourney: OnboardingStep[] = [
    {
        id: 1,
        title: "Day 1: Understand the 'Why'",
        description: "Start by exploring the Learning Hub. Read an article about why AI strategy is critical for engineering leaders today.",
        actionText: "Go to Learning Hub",
        target: "learning-hub",
        isCompleted: false,
    },
    {
        id: 2,
        title: "Day 2: Your First AI Playbook",
        description: "The Playbook Library is full of ready-to-use AI recipes. Let's start with a simple but powerful one: summarizing a technical update for a non-technical audience.",
        actionText: "Find the Playbook",
        target: "playbooks",
        isCompleted: false,
    },
    {
        id: 3,
        title: "Day 3: Run Your First Workflow",
        description: "The Workbench is where you can run more complex, multi-step AI workflows. Let's use the 'Goal & OKR Architect' to turn a high-level goal into a measurable plan.",
        actionText: "Open the Workbench",
        target: "workbench",
        isCompleted: false,
    },
    {
        id: 4,
        title: "Day 4: Ask Your Own Data",
        description: "The Knowledge Navigator uses RAG to answer questions from any text. Try pasting the content of a recent meeting's notes and asking 'What were the key action items?'",
        actionText: "Use the Navigator",
        target: "workbench.knowledge-navigator", // More specific target
        isCompleted: false,
    },
    {
        id: 5,
        title: "Day 5: Become an AI Leader",
        description: "You've learned the basics. Now, explore the rest of the Playbooks and Workbench tools to see how you can use Engify.ai to lead your team.",
        actionText: "Explore on Your Own",
        target: "playbooks",
        isCompleted: false,
    },
];
--- START OF FILE components/OnboardingJourney.tsx ---

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