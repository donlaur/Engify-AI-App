import React, { useState, useEffect } from 'react';

type Model = 'gemini-2.5-flash' | 'gemini-2.5-pro';
type ActiveTab = 'legacy-code-archaeologist' | 'post-mortem-facilitator' | 'incident-co-commander' | 'incident-strategist' | 'tech-debt-strategist' | 'user-story-generator' | 'knowledge-navigator' | 'okr-architect' | 'project-kickoff' | 'prompt-lab' | 'core-values-architect';


const EngifyWorkbench: React.FC<{ initialPrompt?: string }> = ({ initialPrompt }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('legacy-code-archaeologist');

    useEffect(() => {
        if (initialPrompt) {
            setActiveTab('prompt-lab');
        }
    }, [initialPrompt]);
    
    // Stubs for components that are not fully implemented yet
    const UserStoryGenerator: React.FC = () => <FeatureStub title="User Story Generator" description="A multi-step workflow to transform a vague feature idea into a set of well-defined user stories and acceptance criteria." />;
    const OkrArchitect: React.FC = () => <FeatureStub title="Goal & OKR Architect" description="A guided, AI-powered experience that acts as an executive coach, helping you transform vague objectives into sharp, measurable Key Results." />;
    const CoreValuesArchitect: React.FC = () => <FeatureStub title="Core Values Architect" description="Guides a leader through the process of defining and articulating the values that will become the foundation of their team's culture."/>;
    const IncidentResponseStrategist: React.FC = () => <FeatureStub title="Incident Response Strategist" description="Helps you prepare for incidents by generating plans, roles, and proactive monitoring strategies to prevent outages in the first place."/>;

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
                    <TabButton name="Legacy Code Archaeologist" isActive={activeTab === 'legacy-code-archaeologist'} onClick={() => setActiveTab('legacy-code-archaeologist')} />
                    <TabButton name="Post-Mortem Facilitator" isActive={activeTab === 'post-mortem-facilitator'} onClick={() => setActiveTab('post-mortem-facilitator')} />
                    <TabButton name="Incident Co-Commander" isActive={activeTab === 'incident-co-commander'} onClick={() => setActiveTab('incident-co-commander')} />
                    <TabButton name="Incident Strategist" isActive={activeTab === 'incident-strategist'} onClick={() => setActiveTab('incident-strategist')} />
                    <TabButton name="Technical Debt Strategist" isActive={activeTab === 'tech-debt-strategist'} onClick={() => setActiveTab('tech-debt-strategist')} />
                    <TabButton name="User Story Generator" isActive={activeTab === 'user-story-generator'} onClick={() => setActiveTab('user-story-generator')} />
                    <TabButton name="Knowledge Navigator" isActive={activeTab === 'knowledge-navigator'} onClick={() => setActiveTab('knowledge-navigator')} />
                    <TabButton name="Goal & OKR Architect" isActive={activeTab === 'okr-architect'} onClick={() => setActiveTab('okr-architect')} />
                    <TabButton name="Core Values Architect" isActive={activeTab === 'core-values-architect'} onClick={() => setActiveTab('core-values-architect')} />
                    <TabButton name="Project Kickoff" isActive={activeTab === 'project-kickoff'} onClick={() => setActiveTab('project-kickoff')} />
                    <TabButton name="Prompt Lab" isActive={activeTab === 'prompt-lab'} onClick={() => setActiveTab('prompt-lab')} />
                </nav>
            </div>
            
            <div className="mt-6 flex-1 overflow-y-auto pr-2 min-h-0">
                {activeTab === 'legacy-code-archaeologist' && <LegacyCodeArchaeologist />}
                {activeTab === 'post-mortem-facilitator' && <PostmortemFacilitator />}
                {activeTab === 'incident-co-commander' && <IncidentCoCommander />}
                {activeTab === 'incident-strategist' && <IncidentResponseStrategist />}
                {activeTab === 'tech-debt-strategist' && <TechnicalDebtStrategist />}
                {activeTab === 'user-story-generator' && <UserStoryGenerator />}
                {activeTab === 'knowledge-navigator' && <KnowledgeNavigator />}
                {activeTab === 'okr-architect' && <OkrArchitect />}
                {activeTab === 'core-values-architect' && <CoreValuesArchitect />}
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

const FeatureStub: React.FC<{title: string, description: string}> = ({ title, description }) => (
    <div className="p-6 text-center bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">{description}</p>
        <span className="mt-4 px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-full">Coming Soon</span>
    </div>
);

const LegacyCodeArchaeologist: React.FC = () => {
    const [step, setStep] = useState(1);
    const [context, setContext] = useState("Our legacy billing system is a Java monolith. Symptoms include slow build times (30+ mins), frequent bugs in the payment module, and it is very difficult to onboard new developers. It processes all B2B payments and is a single point of failure.");
    const [findings, setFindings] = useState("");
    const [discoveryPlan, setDiscoveryPlan] = useState("");
    const [strategyDoc, setStrategyDoc] = useState("");
    const [riskMemo, setRiskMemo] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleStartDiscovery = async () => {
        setIsLoading(true);
        setDiscoveryPlan('');
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
            
            const response = await fetch('/api/legacy-code-archaeologist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'generate_discovery_plan', context: context })
            });

            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate discovery plan.');
            }
            const data = await response.json();
            setDiscoveryPlan(data.discovery_plan);
            setStep(2);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateArtifacts = async () => {
        setIsLoading(true);
        setStrategyDoc('');
        setRiskMemo('');
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
            
            const response = await fetch('/api/legacy-code-archaeologist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'generate_artifacts', context: context, findings: findings })
            });

            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate artifacts.');
            }
            const data = await response.json();
            setStrategyDoc(data.modernization_strategy);
            setRiskMemo(data.risk_assessment_memo);
            setStep(3);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <h2 className="font-semibold text-lg mb-1">Step 1: Provide Context</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Describe the legacy system's purpose, known issues, and business context. No code needed.</p>
                <textarea 
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={6}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 font-sans text-sm"
                    disabled={step > 1}
                />
                 <button onClick={handleStartDiscovery} disabled={isLoading || step > 1} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                    {isLoading ? 'Analyzing...' : 'Generate Discovery Plan'}
                </button>
            </div>
            
            {step >= 2 && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-1">Step 2: Execute Discovery & Synthesize Findings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Execute the prompt sequence below in your own secure AI environment. Then, paste your synthesized findings here.</p>
                     
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-60 overflow-y-auto mb-4">
                        <h3 className="font-semibold mb-2 text-sm">AI Prompt Sequence</h3>
                        <pre className="text-sm whitespace-pre-wrap font-mono">{discoveryPlan}</pre>
                    </div>

                    <label htmlFor="findings" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Synthesized Findings</label>
                    <textarea 
                        id="findings"
                        value={findings}
                        onChange={(e) => setFindings(e.target.value)}
                        rows={4}
                        placeholder="e.g., The system is a large monolith with tightly coupled UI and business logic. It relies on a deprecated version of Struts with known security vulnerabilities."
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 font-sans text-sm"
                        disabled={step > 2}
                    />
                    <button onClick={handleGenerateArtifacts} disabled={isLoading || step > 2} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                        {isLoading ? 'Generating Artifacts...' : 'Generate Strategic Artifacts'}
                    </button>
                </div>
            )}

            {step >= 3 && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-1">Step 3: Your Generated Strategy Documents</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        <div>
                            <h3 className="font-semibold mb-2">Modernization Strategy Document</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-sans">{strategyDoc}</pre>
                            </div>
                        </div>
                        <div>
                             <h3 className="font-semibold mb-2">Risk Assessment Memo for Leadership</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-sans">{riskMemo}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PostmortemFacilitator: React.FC = () => {
    // ... (rest of the component remains unchanged)
    const [incidentSummary, setIncidentSummary] = useState('On Tuesday afternoon, the primary user authentication service experienced a 45-minute outage, resulting in a 100% login failure rate for all customers.');
    const [timeline, setTimeline] = useState(`14:02 UTC - Deployment of new rate-limiting logic begins.
14:05 UTC - First PagerDuty alerts fire for elevated 5xx errors.
14:08 UTC - On-call engineer acknowledges the alert and begins investigation.
14:15 UTC - Incident is escalated to the core services team.
14:25 UTC - Root cause is suspected to be the new deployment. Rollback is initiated.
14:35 UTC - Rollback is complete. System begins to recover.
14:50 UTC - All services are confirmed to be stable. Incident is resolved.`);
    const [customerImpact, setCustomerImpact] = useState('All users were unable to log in, access their accounts, or use any features requiring authentication. This led to a surge in customer support tickets and significant frustration expressed on social media.');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found. Please set it in the Settings page.");
            
            const response = await fetch('/api/generate-postmortem', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ 
                    incident_summary: incidentSummary,
                    timeline: timeline,
                    customer_impact: customerImpact 
                })
            });

            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate post-mortem from the server.');
            }
            const data = await response.json();
            setResult(data.result);
        } catch (err: any) {
            console.error(err);
            setResult(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div>
                    <label htmlFor="incident-summary" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Incident Summary</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Provide a brief, high-level summary of what happened.</p>
                    <textarea 
                        id="incident-summary" 
                        rows={3} 
                        value={incidentSummary} 
                        onChange={e => setIncidentSummary(e.target.value)} 
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"
                    />
                </div>
                <div>
                    <label htmlFor="timeline" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Timeline of Events</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Paste a timestamped list of key events that occurred during the incident.</p>
                    <textarea 
                        id="timeline" 
                        rows={8} 
                        value={timeline} 
                        onChange={e => setTimeline(e.target.value)} 
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 font-mono text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="customer-impact" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Impact</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Describe how this incident affected your users.</p>
                    <textarea 
                        id="customer-impact" 
                        rows={4} 
                        value={customerImpact} 
                        onChange={e => setCustomerImpact(e.target.value)} 
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"
                    />
                </div>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isLoading ? 'Facilitating...' : 'Generate Post-Mortem Draft'}
                </button>
            </form>
             <div className="mt-6 lg:mt-0 bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                <h2 className="text-xl font-semibold mb-3">Generated Post-Mortem Document</h2>
                <div className="flex-1 mt-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 overflow-y-auto relative border border-slate-200 dark:border-slate-700">
                    {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center"><p>Thinking...</p></div>}
                    {result ? <pre className="text-sm whitespace-pre-wrap font-sans">{result}</pre> : <p className="text-sm text-slate-500">The blameless post-mortem draft, including root cause analysis and action items, will be generated here.</p>}
                </div>
            </div>
        </div>
    );
};

interface IncidentLogEntry {
    author: 'user' | 'ai';
    text: string;
    timestamp: string;
}

const IncidentCoCommander: React.FC = () => {
    // ... (rest of the component remains unchanged)
    const [log, setLog] = useState<IncidentLogEntry[]>([
        { author: 'ai', text: "I'm your Incident Co-Commander. Describe the initial alert or symptom to begin the response process.", timestamp: new Date().toLocaleTimeString() }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const userEntry: IncidentLogEntry = {
            author: 'user',
            text: userInput,
            timestamp: new Date().toLocaleTimeString()
        };
        const updatedLog = [...log, userEntry];
        setLog(updatedLog);
        setUserInput('');
        setIsLoading(true);

        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) {
                throw new Error("API key not found. Please set it in the Settings page.");
            }

            const response = await fetch('/api/incident-commander', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ incident_log: updatedLog })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get a response from the AI co-commander.');
            }
            const data = await response.json();
            
            const aiEntry: IncidentLogEntry = {
                author: 'ai',
                text: data.result,
                timestamp: new Date().toLocaleTimeString()
            };
            setLog(prevLog => [...prevLog, aiEntry]);

        } catch (err: any) {
            console.error(err);
            const errorEntry: IncidentLogEntry = {
                author: 'ai',
                text: `Error: ${err.message}`,
                timestamp: new Date().toLocaleTimeString()
            };
            setLog(prevLog => [...prevLog, errorEntry]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="font-semibold text-lg">Incident Command Log</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {log.map((entry, index) => (
                    <div key={index} className={`flex items-start gap-3 ${entry.author === 'user' ? 'justify-end' : ''}`}>
                        {entry.author === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-sm flex-shrink-0">AI</div>}
                        <div className={`p-3 rounded-lg max-w-full sm:max-w-xl ${entry.author === 'ai' ? 'bg-slate-100 dark:bg-slate-700/50' : 'bg-indigo-500 text-white'}`}>
                            <p className="text-sm">{entry.text}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">{entry.timestamp}</p>
                        </div>
                         {entry.author === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-sm flex-shrink-0">You</div>}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-sm flex-shrink-0">AI</div>
                        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                            <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                 )}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Log an event or ask for a suggestion..."
                        className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        disabled={isLoading}
                    />
                </form>
            </div>
        </div>
    );
};

const TechnicalDebtStrategist: React.FC = () => {
    // ... (rest of the component remains unchanged)
    const [step, setStep] = useState(1);
    const [symptoms, setSymptoms] = useState('Our CI/CD pipeline for the main monolith is taking over 45 minutes to run, which slows down developer velocity. New features in the billing module are taking twice as long as estimated because the code is tightly coupled and lacks tests. We had two minor production incidents last quarter related to this module.');
    const [businessContext, setBusinessContext] = useState('The billing module is business-critical. It handles all revenue and subscription logic. Any downtime directly impacts revenue. Slowing down feature development in this area means we are falling behind competitors.');
    const [promptSequence, setPromptSequence] = useState('');
    const [stakeholderBriefing, setStakeholderBriefing] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
            const response = await fetch('/api/analyze-tech-debt', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ symptoms, business_context: businessContext })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get a response from the server.");
            }
            const data = await response.json();
            setPromptSequence(data.prompt_sequence);
            setStakeholderBriefing(data.stakeholder_briefing);
            setStep(2);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <h2 className="font-semibold text-lg mb-1">Step 1: Describe the Symptoms & Business Context</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Instead of code, provide the observable problems (from Jira, team feedback) and explain why it matters to the business.</p>
                
                <label htmlFor="symptoms" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Symptoms of Technical Debt</label>
                <textarea 
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={6}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition font-sans text-sm"
                    disabled={step > 1}
                />
                
                <label htmlFor="businessContext" className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Context</label>
                <textarea 
                    id="businessContext"
                    value={businessContext}
                    onChange={(e) => setBusinessContext(e.target.value)}
                    rows={4}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition font-sans text-sm"
                    disabled={step > 1}
                />

                 <button onClick={handleSubmit} disabled={isLoading || step > 1} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                    {isLoading ? 'Analyzing...' : 'Generate Remediation Plan'}
                </button>
            </div>
            
            {step >= 2 && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-1">Step 2: Your Generated Strategy Documents</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Use the Prompt Sequence in your company's secure AI, and the Stakeholder Briefing to get buy-in.</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">AI Prompt Sequence (for your internal AI)</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-mono">{promptSequence}</pre>
                            </div>
                        </div>
                        <div>
                             <h3 className="font-semibold mb-2">Stakeholder Briefing Memo</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-sans">{stakeholderBriefing}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const KnowledgeNavigator: React.FC = () => {
    // ... (rest of the component remains unchanged)
    const [sourceText, setSourceText] = useState('');
    const [question, setQuestion] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');

        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");

            const response = await fetch('/api/rag', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ source_text: sourceText, question })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get response from RAG service.");
            }
            const data = await response.json();
            setResult(data.answer);

        } catch (err: any) {
            console.error(err);
            setResult(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div>
                    <label htmlFor="source-text" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Source Knowledge</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Paste any text you want to ask questions about (e.g., meeting notes, design doc, article).</p>
                    <textarea 
                        id="source-text" 
                        rows={10} 
                        value={sourceText} 
                        onChange={e => setSourceText(e.target.value)} 
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"
                        placeholder="Paste your text here..."
                    />
                </div>
                 <div>
                    <label htmlFor="question" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Question</label>
                    <input 
                        id="question" 
                        type="text"
                        value={question} 
                        onChange={e => setQuestion(e.target.value)} 
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"
                        placeholder="e.g., What were the key action items?"
                    />
                </div>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isLoading ? 'Searching...' : 'Ask Question'}
                </button>
            </form>
             <div className="mt-6 lg:mt-0 bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                <h2 className="text-xl font-semibold mb-3">AI-Generated Answer</h2>
                <div className="flex-1 mt-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 overflow-y-auto relative border border-slate-200 dark:border-slate-700">
                    {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center"><p>Thinking...</p></div>}
                    {result ? <pre className="text-sm whitespace-pre-wrap font-sans">{result}</pre> : <p className="text-sm text-slate-500">The answer based on your provided text will appear here.</p>}
                </div>
            </div>
        </div>
    );
};

const ProjectKickoff: React.FC = () => {
    // ... (rest of the component remains unchanged)
    const [projectGoal, setProjectGoal] = useState('');
    const [stakeholders, setStakeholders] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');

        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");

            const response = await fetch('/api/generate-kickoff', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ projectGoal, stakeholders })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate kickoff document.");
            }

            const data = await response.json();
            setResult(data.result);
        } catch (err: any) {
            console.error(err);
            setResult(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div>
                    <label htmlFor="project-goal" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Goal</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Describe the primary objective of the project in one or two sentences.</p>
                    <textarea 
                        id="project-goal" 
                        rows={4} 
                        value={projectGoal} 
                        onChange={e => setProjectGoal(e.target.value)} 
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"
                        placeholder="e.g., Build a new dashboard for enterprise customers to track their usage."
                    />
                </div>
                <div>
                    <label htmlFor="stakeholders" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key Stakeholders</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">List the key people or teams involved, separated by commas.</p>
                    <input 
                        id="stakeholders" 
                        type="text"
                        value={stakeholders} 
                        onChange={e => setStakeholders(e.target.value)} 
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"
                        placeholder="e.g., Jane Doe (Product), John Smith (Engineering)"
                    />
                </div>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isLoading ? 'Generating Document...' : 'Draft Kickoff Document'}
                </button>
            </form>
             <div className="mt-6 lg:mt-0 bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                <h2 className="text-xl font-semibold mb-3">Generated Project Kickoff Draft</h2>
                <div className="flex-1 mt-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 overflow-y-auto relative border border-slate-200 dark:border-slate-700">
                    {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center"><p>Thinking...</p></div>}
                    {result ? <pre className="text-sm whitespace-pre-wrap font-sans">{result}</pre> : <p className="text-sm text-slate-500">The draft document will appear here.</p>}
                </div>
            </div>
        </div>
    );
};

const PromptLab: React.FC<{ initialPrompt?: string }> = ({ initialPrompt }) => {
    // ... (rest of the component remains unchanged)
    const [model, setModel] = useState<Model>('gemini-2.5-flash');
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialPrompt) {
            setPrompt(initialPrompt);
        }
    }, [initialPrompt]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');

        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");

            const response = await fetch('/api/execute-prompt', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ prompt, model })
            });
            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.error || "Failed to execute prompt.");
            }
            const data = await response.json();
            setResult(data.result);
        } catch (err: any) {
             console.error(err);
             setResult(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div>
                    <label htmlFor="model-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Model</label>
                    <select 
                        id="model-select"
                        value={model}
                        onChange={e => setModel(e.target.value as Model)}
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"
                    >
                        <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                        <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="prompt-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prompt</label>
                    <textarea 
                        id="prompt-input" 
                        rows={15} 
                        value={prompt} 
                        onChange={e => setPrompt(e.target.value)} 
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 font-mono text-sm"
                        placeholder="Enter your prompt here..."
                    />
                </div>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isLoading ? 'Executing...' : 'Run Prompt'}
                </button>
            </form>
            <div className="mt-6 lg:mt-0 bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                <h2 className="text-xl font-semibold mb-3">Model Output</h2>
                <div className="flex-1 mt-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 overflow-y-auto relative border border-slate-200 dark:border-slate-700">
                    {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center"><p>Thinking...</p></div>}
                    {result ? <pre className="text-sm whitespace-pre-wrap font-sans">{result}</pre> : <p className="text-sm text-slate-500">The model's response will appear here.</p>}
                </div>
            </div>
        </div>
    );
};

export default EngifyWorkbench;