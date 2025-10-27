import React from 'react';
import { GoogleGenAI } from '@google/genai';
import { KICKOFF_PLAN_PROMPT_TEMPLATE } from '../services/agentService';

type Model = 'gemini-2.5-flash' | 'gemini-2.5-pro';
// FIX: Added 'accessibility-auditor' to ActiveTab type
type ActiveTab = 'retrospective-diagnostician' | 'tech-investment-advisor' | 'lean-research-planner' | 'roadmap-defense-architect' | 'roadmap-alignment' | 'qualitative-insights' | 'codebase-onboarding' | 'cicd-diagnostician' | 'legacy-code-archaeologist' | 'architectural-tradeoff-analyst' | 'feature-prioritization' | 'post-mortem-facilitator' | 'incident-co-commander' | 'incident-strategist' | 'tech-debt-strategist' | 'user-story-generator' | 'knowledge-navigator' | 'okr-architect' | 'project-kickoff' | 'prompt-lab' | 'core-values-architect' | 'accessibility-auditor';


const EngifyWorkbench: React.FC<{ initialPrompt?: string }> = ({ initialPrompt }) => {
    const [activeTab, setActiveTab] = React.useState<ActiveTab>('retrospective-diagnostician');

    React.useEffect(() => {
        if (initialPrompt) {
            setActiveTab('prompt-lab');
        }
    }, [initialPrompt]);
    
    // Stubs for components that are not fully implemented yet
    const UserStoryGenerator: React.FC = () => <FeatureStub title="User Story Generator" description="A multi-step workflow to transform a vague feature idea into a set of well-defined user stories and acceptance criteria." />;
    const OkrArchitect: React.FC = () => <FeatureStub title="Goal & OKR Architect" description="A guided, AI-powered experience that acts as an executive coach, helping you transform vague objectives into sharp, measurable Key Results." />;
    const CoreValuesArchitect: React.FC = () => <FeatureStub title="Core Values Architect" description="Guides a leader through the process of defining and articulating the values that will become the foundation of their team's culture."/>;
    const IncidentResponseStrategist: React.FC = () => <FeatureStub title="Incident Response Strategist" description="Helps you prepare for incidents by generating plans, roles, and proactive monitoring strategies to prevent outages in the first place."/>;
    const PostmortemFacilitator: React.FC = () => <FeatureStub title="Post-Mortem Facilitator" description="Guides a team through a blameless post-mortem process to find root causes and create actionable follow-up items." />;
    const IncidentCoCommander: React.FC = () => <FeatureStub title="Incident Co-Commander" description="Acts as an AI partner during a live incident, providing structured guidance, communication nudges, and a real-time log." />;
    
    // FIX: Added new DigitalAccessibilityAuditor component
    const DigitalAccessibilityAuditor: React.FC = () => {
        const [step, setStep] = React.useState(1);
        const [flowDescription, setFlowDescription] = React.useState("The user logs in using a form with an email field, a password field, and a 'Log In' button. If they enter the wrong password, an error message appears in red text below the password field.");
        const [isLoading, setIsLoading] = React.useState(false);
        const [report, setReport] = React.useState<any>(null);

        const handleAudit = async () => {
            setIsLoading(true);
            setReport(null);
    
            // Mocking API call since backend is not provided
            await new Promise(resolve => setTimeout(resolve, 1000));
    
            const fakeReport = {
                issue_log: [
                    {
                        finding: "Potential Color Contrast Failure",
                        why: "The red error text on a white background may be unreadable for users with color blindness. This can prevent them from understanding how to correct the error and log in.",
                        guideline: "1.4.3 Contrast (Minimum)",
                        remediation: "Ensure the error text has a contrast ratio of at least 4.5:1 against the background. Consider adding an icon next to the error message for users who cannot perceive color."
                    },
                    {
                        finding: "Missing Form Labels",
                        why: "Without explicit labels linked to the email and password fields, screen reader users may not know what information is required in each field.",
                        guideline: "3.3.2 Labels or Instructions",
                        remediation: "Add a <label> element for each <input> and use the 'for' attribute to associate it with the input's 'id'."
                    }
                ],
                inclusivity_checklist: [
                    "Is the language used in the error message simple and free of technical jargon?",
                    "Does the login button have a clear and visible focus state for keyboard navigators?",
                    "Have you considered the cognitive load of a user who has forgotten their password? Is the 'Forgot Password' link easy to find and use?"
                ]
            };
            setReport(fakeReport);
            setStep(2);
            setIsLoading(false);
        };
        
        return (
            <div className="space-y-6">
                <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 ${step > 1 ? 'opacity-60' : ''}`}>
                    <h2 className="font-semibold text-lg mb-1">Step 1: Describe the User Flow or Interface</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Describe a user interface or a multi-step user flow in natural language. You can also provide a link to a Figma prototype or upload a screenshot (support for links/screenshots coming soon).</p>
                    
                    <textarea 
                        value={flowDescription}
                        onChange={(e) => setFlowDescription(e.target.value)}
                        rows={6}
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 font-sans text-sm"
                        disabled={step > 1}
                    />
    
                     <button onClick={handleAudit} disabled={isLoading || step > 1} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                        {isLoading ? 'Auditing...' : 'Generate Accessibility Report'}
                    </button>
                </div>
                
                {step >= 2 && report && (
                    <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h2 className="font-semibold text-lg mb-4">Step 2: Accessibility Report Card</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Issue Log</h3>
                                <div className="space-y-4">
                                    {report.issue_log.map((issue: any, index: number) => (
                                        <div key={index} className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <h4 className="font-semibold">{issue.finding}</h4>
                                            <p className="text-sm mt-1"><span className="font-medium">Impact:</span> {issue.why}</p>
                                            <p className="text-sm mt-1"><span className="font-medium">Guideline:</span> <span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">{issue.guideline}</span></p>
                                            <p className="text-sm mt-2 pt-2 border-t border-slate-200 dark:border-slate-700"><span className="font-medium">Remediation:</span> {issue.remediation}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
    
                            <div>
                                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Inclusivity Checklist</h3>
                                <ul className="list-disc list-inside space-y-2 text-sm">
                                    {report.inclusivity_checklist.map((item: string, index: number) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

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
                    <TabButton name="Retrospective Diagnostician" isActive={activeTab === 'retrospective-diagnostician'} onClick={() => setActiveTab('retrospective-diagnostician')} />
                    <TabButton name="Tech Investment Advisor" isActive={activeTab === 'tech-investment-advisor'} onClick={() => setActiveTab('tech-investment-advisor')} />
                    <TabButton name="Lean Research Planner" isActive={activeTab === 'lean-research-planner'} onClick={() => setActiveTab('lean-research-planner')} />
                    <TabButton name="Roadmap Defense Architect" isActive={activeTab === 'roadmap-defense-architect'} onClick={() => setActiveTab('roadmap-defense-architect')} />
                    <TabButton name="Roadmap Alignment" isActive={activeTab === 'roadmap-alignment'} onClick={() => setActiveTab('roadmap-alignment')} />
                    <TabButton name="Qualitative Insights" isActive={activeTab === 'qualitative-insights'} onClick={() => setActiveTab('qualitative-insights')} />
                    <TabButton name="Feature Prioritization" isActive={activeTab === 'feature-prioritization'} onClick={() => setActiveTab('feature-prioritization')} />
                    <TabButton name="Codebase Onboarding" isActive={activeTab === 'codebase-onboarding'} onClick={() => setActiveTab('codebase-onboarding')} />
                    <TabButton name="CI/CD Diagnostician" isActive={activeTab === 'cicd-diagnostician'} onClick={() => setActiveTab('cicd-diagnostician')} />
                    <TabButton name="Legacy Code Archaeologist" isActive={activeTab === 'legacy-code-archaeologist'} onClick={() => setActiveTab('legacy-code-archaeologist')} />
                    <TabButton name="Architectural Trade-Off Analyst" isActive={activeTab === 'architectural-tradeoff-analyst'} onClick={() => setActiveTab('architectural-tradeoff-analyst')} />
                    <TabButton name="Post-Mortem Facilitator" isActive={activeTab === 'post-mortem-facilitator'} onClick={() => setActiveTab('post-mortem-facilitator')} />
                    <TabButton name="Incident Co-Commander" isActive={activeTab === 'incident-co-commander'} onClick={() => setActiveTab('incident-co-commander')} />
                    <TabButton name="Incident Strategist" isActive={activeTab === 'incident-strategist'} onClick={() => setActiveTab('incident-strategist')} />
                    <TabButton name="Technical Debt Strategist" isActive={activeTab === 'tech-debt-strategist'} onClick={() => setActiveTab('tech-debt-strategist')} />
                    <TabButton name="User Story Generator" isActive={activeTab === 'user-story-generator'} onClick={() => setActiveTab('user-story-generator')} />
                    <TabButton name="Knowledge Navigator" isActive={activeTab === 'knowledge-navigator'} onClick={() => setActiveTab('knowledge-navigator')} />
                    <TabButton name="Goal & OKR Architect" isActive={activeTab === 'okr-architect'} onClick={() => setActiveTab('okr-architect')} />
                    <TabButton name="Core Values Architect" isActive={activeTab === 'core-values-architect'} onClick={() => setActiveTab('core-values-architect')} />
                    {/* FIX: Added TabButton for the new tool */}
                    <TabButton name="Accessibility Auditor" isActive={activeTab === 'accessibility-auditor'} onClick={() => setActiveTab('accessibility-auditor')} />
                    <TabButton name="Project Kickoff" isActive={activeTab === 'project-kickoff'} onClick={() => setActiveTab('project-kickoff')} />
                    <TabButton name="Prompt Lab" isActive={activeTab === 'prompt-lab'} onClick={() => setActiveTab('prompt-lab')} />
                </nav>
            </div>
            
            <div className="mt-6 flex-1 overflow-y-auto pr-2 min-h-0">
                {activeTab === 'retrospective-diagnostician' && <RetrospectiveDiagnostician />}
                {activeTab === 'tech-investment-advisor' && <TechnologyInvestmentAdvisor />}
                {activeTab === 'lean-research-planner' && <LeanResearchPlanner />}
                {activeTab === 'roadmap-defense-architect' && <RoadmapDefenseArchitect />}
                {activeTab === 'roadmap-alignment' && <RoadmapAlignmentConsultant />}
                {activeTab === 'qualitative-insights' && <QualitativeInsightsSynthesizer />}
                {activeTab === 'feature-prioritization' && <FeaturePrioritizationFacilitator />}
                {activeTab === 'codebase-onboarding' && <CodebaseOnboardingCompanion />}
                {activeTab === 'cicd-diagnostician' && <CiCdDiagnostician />}
                {activeTab === 'legacy-code-archaeologist' && <LegacyCodeArchaeologist />}
                {activeTab === 'architectural-tradeoff-analyst' && <ArchitecturalTradeoffAnalyst />}
                {activeTab === 'post-mortem-facilitator' && <PostmortemFacilitator />}
                {activeTab === 'incident-co-commander' && <IncidentCoCommander />}
                {activeTab === 'incident-strategist' && <IncidentResponseStrategist />}
                {activeTab === 'tech-debt-strategist' && <TechnicalDebtStrategist />}
                {activeTab === 'user-story-generator' && <UserStoryGenerator />}
                {activeTab === 'knowledge-navigator' && <KnowledgeNavigator />}
                {activeTab === 'okr-architect' && <OkrArchitect />}
                {activeTab === 'core-values-architect' && <CoreValuesArchitect />}
                {activeTab === 'project-kickoff' && <ProjectKickoff />}
                {/* FIX: Added conditional render for the new tool */}
                {activeTab === 'accessibility-auditor' && <DigitalAccessibilityAuditor />}
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

const RetrospectiveDiagnostician: React.FC = () => {
    const [step, setStep] = React.useState(1);
    const [context, setContext] = React.useState("Sprint Goal: Launch v1 of the new reporting dashboard. What went well: The team collaborated effectively on the frontend components. What didn't go well: We discovered a major performance issue with the backend API on the last day, which caused us to miss the deadline. Team morale is a bit low.");
    const [feedback, setFeedback] = React.useState("- Mad: I'm mad that the API issue was found so late.\n- Sad: I'm sad we missed our launch goal.\n- Glad: I'm glad we worked well together as a frontend team.");
    const [isLoading, setIsLoading] = React.useState(false);
    const [themes, setThemes] = React.useState<string[]>([]);
    const [selectedTheme, setSelectedTheme] = React.useState<string | null>(null);
    const [fiveWhys, setFiveWhys] = React.useState<{ question: string; answer: string }[]>([]);
    const [rootCause, setRootCause] = React.useState<string | null>(null);
    const [actionItems, setActionItems] = React.useState<string | null>(null);

    const handleClusterThemes = async () => {
        setIsLoading(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
            const response = await fetch('/api/retrospective-diagnostician', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'cluster_themes', context, feedback })
            });
            if (!response.ok) throw new Error('Failed to cluster themes.');
            const data = await response.json();
            setThemes(data.themes);
            setStep(2);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    const handleStart5Whys = async (theme: string) => {
        setSelectedTheme(theme);
        setIsLoading(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
            const response = await fetch('/api/retrospective-diagnostician', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'start_5_whys', theme })
            });
            if (!response.ok) throw new Error('Failed to start 5 whys.');
            const data = await response.json();
            setFiveWhys([{ question: data.question, answer: '' }]);
            setStep(3);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    
    const handleNextWhy = async (answer: string) => {
        const updatedWhys = [...fiveWhys];
        updatedWhys[updatedWhys.length - 1].answer = answer;
        setFiveWhys(updatedWhys);
        setIsLoading(true);

        try {
             const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
             const response = await fetch('/api/retrospective-diagnostician', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'continue_5_whys', history: updatedWhys })
            });
            if (!response.ok) throw new Error('Failed to get next question.');
            const data = await response.json();
            if(data.root_cause) {
                setRootCause(data.root_cause);
                setStep(4);
            } else {
                setFiveWhys(prev => [...prev, { question: data.question, answer: '' }]);
            }
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    
    const handleGenerateActions = async () => {
        if(!rootCause) return;
        setIsLoading(true);
        try {
             const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
            const response = await fetch('/api/retrospective-diagnostician', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'generate_actions', root_cause: rootCause })
            });
            if (!response.ok) throw new Error('Failed to generate actions.');
            const data = await response.json();
            setActionItems(data.action_items);
            setStep(5);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };


    return (
        <div className="space-y-6">
            <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 ${step > 1 ? 'opacity-60' : ''}`}>
                <h2 className="font-semibold text-lg mb-1">Step 1: Setup & Context</h2>
                <label className="text-sm font-medium mt-4 block">Sprint Context</label>
                <textarea value={context} onChange={e => setContext(e.target.value)} rows={4} className="w-full p-2 mt-1 rounded-md bg-slate-100 dark:bg-slate-700/50" disabled={step > 1} />
                <label className="text-sm font-medium mt-4 block">Anonymous Team Feedback (Mad/Sad/Glad)</label>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} className="w-full p-2 mt-1 rounded-md bg-slate-100 dark:bg-slate-700/50" disabled={step > 1} />
                <button onClick={handleClusterThemes} disabled={isLoading || step > 1} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                    {isLoading ? 'Clustering...' : 'Cluster Themes'}
                </button>
            </div>
            {step >= 2 && themes.length > 0 && (
                <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 ${step > 2 ? 'opacity-60' : ''}`}>
                    <h2 className="font-semibold text-lg mb-4">Step 2: AI-Assisted Thematic Clustering</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">The AI has clustered your team's feedback. Select a theme to diagnose further.</p>
                    <div className="space-y-2">
                        {themes.map((theme, index) => (
                            <button key={index} onClick={() => handleStart5Whys(theme)} disabled={isLoading || step > 2} className="w-full text-left p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                {theme}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {step >= 3 && selectedTheme && (
                 <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 ${step > 3 ? 'opacity-60' : ''}`}>
                    <h2 className="font-semibold text-lg mb-4">Step 3: AI-Guided Root Cause Analysis (5 Whys)</h2>
                    <div className="space-y-4">
                        {fiveWhys.map((item, index) => (
                           <div key={index}>
                             <p className="font-medium">{item.question}</p>
                             <input type="text"
                                defaultValue={item.answer}
                                onBlur={(e) => { if(index === fiveWhys.length -1) { handleNextWhy(e.target.value) }}}
                                disabled={isLoading || index < fiveWhys.length - 1}
                                className="w-full p-2 mt-1 rounded-md bg-slate-100 dark:bg-slate-700/50"
                             />
                           </div>
                        ))}
                        {isLoading && <p>Thinking...</p>}
                   </div>
                </div>
            )}
            {step >= 4 && rootCause && (
                <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 ${step > 4 ? 'opacity-60' : ''}`}>
                    <h2 className="font-semibold text-lg mb-4">Step 4: Root Cause Identified</h2>
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-md">
                        <p className="font-semibold">{rootCause}</p>
                    </div>
                     <button onClick={handleGenerateActions} disabled={isLoading || step > 4} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                        {isLoading ? 'Generating...' : 'Generate SMART Action Items'}
                    </button>
                </div>
            )}
             {step >= 5 && actionItems && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-4">Step 5: Generated Action Items</h2>
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap font-sans">{actionItems}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};


const TechnologyInvestmentAdvisor: React.FC = () => {
    const [step, setStep] = React.useState(1);
    const [initiative, setInitiative] = React.useState("Migrate our primary application database from self-hosted MySQL to Amazon Aurora.");
    const [drivers, setDrivers] = React.useState("Our current database is a scaling bottleneck and requires significant operational overhead.");
    const [questions, setQuestions] = React.useState<any>(null);
    const [answers, setAnswers] = React.useState<any>({});
    const [proposal, setProposal] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleStart = async () => {
        setIsLoading(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
            const response = await fetch('/api/technology-investment-advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'guide_business_case', initiative, drivers })
            });
            if (!response.ok) throw new Error('Failed to get questions.');
            const data = await response.json();
            setQuestions(data.questions);
            setStep(2);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    const handleAnswerChange = (key: string, value: string) => {
        setAnswers((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
            const response = await fetch('/api/technology-investment-advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'generate_package', initiative, drivers, answers })
            });
            if (!response.ok) throw new Error('Failed to generate proposal.');
            const data = await response.json();
            setProposal(data);
            setStep(3);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 ${step > 1 ? 'opacity-60' : ''}`}>
                <h2 className="font-semibold text-lg mb-1">Step 1: Describe the Technology Investment</h2>
                <label className="text-sm font-medium mt-4 block">Initiative Overview</label>
                <textarea value={initiative} onChange={e => setInitiative(e.target.value)} rows={3} className="w-full p-2 mt-1 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" disabled={step > 1} />
                <label className="text-sm font-medium mt-4 block">Primary Technical Drivers</label>
                <textarea value={drivers} onChange={e => setDrivers(e.target.value)} rows={3} className="w-full p-2 mt-1 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" disabled={step > 1} />
                <button onClick={handleStart} disabled={isLoading || step > 1} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                    {isLoading ? 'Thinking...' : 'Start Business Case'}
                </button>
            </div>
            {step >= 2 && questions && (
                <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 ${step > 2 ? 'opacity-60' : ''}`}>
                    <h2 className="font-semibold text-lg mb-4">Step 2: AI-Guided Business Case Construction</h2>
                    <div className="space-y-4">
                        <AnswerInput label={questions.cost_analysis} onChange={v => handleAnswerChange('cost_analysis', v)} disabled={step > 2} />
                        <AnswerInput label={questions.benefit_quantification} onChange={v => handleAnswerChange('benefit_quantification', v)} disabled={step > 2} />
                        <AnswerInput label={questions.risk_assessment} onChange={v => handleAnswerChange('risk_assessment', v)} disabled={step > 2} />
                        <AnswerInput label={questions.strategic_alignment} onChange={v => handleAnswerChange('strategic_alignment', v)} disabled={step > 2} />
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading || step > 2} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                        {isLoading ? 'Generating...' : 'Generate Investment Proposal'}
                    </button>
                </div>
            )}
            {step >= 3 && proposal && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-4">Step 3: Your Boardroom-Ready Investment Proposal</h2>
                     <div className="space-y-6">
                        <Artifact a_title="1. Executive Summary (for CEO/CFO)" a_content={proposal.executive_summary} />
                        <Artifact a_title="2. Detailed Financial Model (Spreadsheet Format)" a_content={proposal.financial_model} />
                        <Artifact a_title="3. Technical & Risk Briefing (for CTO/VP Eng)" a_content={proposal.technical_briefing} />
                    </div>
                </div>
            )}
        </div>
    );
};

const AnswerInput: React.FC<{label: string, onChange: (value: string) => void, disabled: boolean}> = ({ label, onChange, disabled }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <textarea onChange={e => onChange(e.target.value)} rows={3} className="w-full p-2 mt-1 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" disabled={disabled} />
    </div>
);

const LeanResearchPlanner: React.FC = () => {
    const [step, setStep] = React.useState(1);
    const [researchGoal, setResearchGoal] = React.useState("Understand why users are abandoning the checkout process.");
    const [constraints, setConstraints] = React.useState("We have a 5-day timeline, our budget is $500 for incentives, and we need to talk to users who have made a purchase in the last 3 months.");
    const [isLoading, setIsLoading] = React.useState(false);
    const [researchKit, setResearchKit] = React.useState<any>(null);

    const handleSubmit = async () => {
        setIsLoading(true);
        setResearchKit(null);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found. Please set it in Settings.");

            const response = await fetch('/api/lean-research-planner', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ research_goal: researchGoal, constraints })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get a response from the server.");
            }

            const data = await response.json();
            setResearchKit(data);
            setStep(2);
        } catch (err: any) {
            console.error(err);
            // You might want to display this error to the user
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 ${step > 1 ? 'opacity-60' : ''}`}>
                <h2 className="font-semibold text-lg mb-1">Step 1: Define Your Research Goal & Constraints</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Tell the AI what you want to learn and what your limitations are (time, budget, etc.).</p>
                
                <label htmlFor="researchGoal" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Research Goal</label>
                <textarea 
                    id="researchGoal"
                    value={researchGoal}
                    onChange={(e) => setResearchGoal(e.target.value)}
                    rows={3}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 font-sans text-sm"
                    disabled={step > 1}
                />
                
                <label htmlFor="constraints" className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Constraints (Timeline, Budget, etc.)</label>
                <textarea 
                    id="constraints"
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    rows={4}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 font-sans text-sm"
                    disabled={step > 1}
                />

                 <button onClick={handleSubmit} disabled={isLoading || step > 1} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                    {isLoading ? 'Generating Plan...' : 'Generate Research Kit'}
                </button>
            </div>
            
            {step >= 2 && researchKit && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-4">Step 2: Your "Research-in-a-Box" Kit</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">The AI has generated a complete set of artifacts to kickstart your user research.</p>

                    <div className="space-y-6">
                        <Artifact a_title="1. Research Plan" a_content={researchKit.research_plan} />
                        <Artifact a_title="2. Participant Screener" a_content={researchKit.participant_screener} />
                        <Artifact a_title="3. Email Outreach Template" a_content={researchKit.email_outreach_template} />
                        <Artifact a_title="4. Moderated Interview Script" a_content={researchKit.interview_script} />
                        <Artifact a_title="5. Consent Form" a_content={researchKit.consent_form} />
                        <Artifact a_title="6. Note-Taking & Synthesis Template" a_content={researchKit.synthesis_template} />
                    </div>
                </div>
            )}
        </div>
    );
};

const Artifact: React.FC<{a_title: string, a_content: string}> = ({ a_title, a_content }) => (
    <div>
        <h3 className="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">{a_title}</h3>
        <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700">
            <pre className="text-sm whitespace-pre-wrap font-sans">{a_content}</pre>
        </div>
    </div>
);


const RoadmapDefenseArchitect: React.FC = () => {
    const [step, setStep] = React.useState(1);
    const [initiatives, setInitiatives] = React.useState("1. Build a new mobile app -> Increase user retention by 15%\n2. Redesign the onboarding flow -> Improve new user activation rate\n3. Integrate with Salesforce -> Increase enterprise sales");
    const [stakeholders, setStakeholders] = React.useState("CEO: Overall business growth\nHead of Sales: Closing enterprise deals this quarter\nCTO: Technical stability and scalability");
    const [riceScores, setRiceScores] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [defenseKit, setDefenseKit] = React.useState<any>(null);

    const handleStartPrioritization = async () => {
        setIsLoading(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");

            const response = await fetch('/api/roadmap-defense-architect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'guide_prioritization', initiatives })
            });
            if (!response.ok) throw new Error('Failed to start prioritization.');
            const data = await response.json();
            setRiceScores(data.initiatives_with_questions);
            setStep(2);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    const handleScoreChange = (index: number, key: string, value: string) => {
        const newScores = [...riceScores];
        newScores[index][key] = value;
        setRiceScores(newScores);
    };

    const handleGenerateKit = async () => {
        setIsLoading(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");

            const response = await fetch('/api/roadmap-defense-architect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'generate_kit', initiatives: riceScores, stakeholders })
            });
            if (!response.ok) throw new Error('Failed to generate defense kit.');
            const data = await response.json();
            setDefenseKit(data);
            setStep(3);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    
    return (
        <div className="space-y-6">
            <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 ${step > 1 ? 'opacity-60' : ''}`}>
                <h2 className="font-semibold text-lg mb-1">Step 1: Define Initiatives & Stakeholders</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">List your potential roadmap initiatives and their linked company objectives. Then, map your key stakeholders.</p>
                <label className="block text-sm font-medium mb-1">Roadmap Initiatives & Goals</label>
                <textarea value={initiatives} onChange={e => setInitiatives(e.target.value)} rows={4} className="w-full p-2 mb-4 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" disabled={step > 1} />
                <label className="block text-sm font-medium mb-1">Key Stakeholders & Concerns</label>
                <textarea value={stakeholders} onChange={e => setStakeholders(e.target.value)} rows={4} className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" disabled={step > 1} />
                 <button onClick={handleStartPrioritization} disabled={isLoading || step > 1} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                    {isLoading ? 'Thinking...' : 'Start Prioritization'}
                </button>
            </div>

            {step >= 2 && (
                 <div className={`p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 ${step > 2 ? 'opacity-60' : ''}`}>
                    <h2 className="font-semibold text-lg mb-4">Step 2: AI-Guided RICE Scoring</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">The AI has generated questions to help you score each initiative. Provide your estimates.</p>
                    <div className="space-y-4">
                        {riceScores.map((item, index) => (
                            <div key={index} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                                <p className="font-semibold">{item.initiative}</p>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500">{item.questions.reach}</label>
                                        <input type="text" onChange={(e) => handleScoreChange(index, 'reach', e.target.value)} className="w-full p-1 mt-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600" disabled={step > 2} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500">{item.questions.impact}</label>
                                        <input type="text" onChange={(e) => handleScoreChange(index, 'impact', e.target.value)} className="w-full p-1 mt-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600" disabled={step > 2} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500">{item.questions.confidence}</label>
                                        <input type="text" onChange={(e) => handleScoreChange(index, 'confidence', e.target.value)} className="w-full p-1 mt-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600" disabled={step > 2} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500">{item.questions.effort}</label>
                                        <input type="text" onChange={(e) => handleScoreChange(index, 'effort', e.target.value)} className="w-full p-1 mt-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600" disabled={step > 2} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                     <button onClick={handleGenerateKit} disabled={isLoading || step > 2} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                        {isLoading ? 'Generating...' : 'Generate Roadmap Defense Kit'}
                    </button>
                </div>
            )}

            {step >= 3 && defenseKit && (
                 <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-4">Step 3: Your Roadmap Defense Kit</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">1. Prioritized Roadmap Visualization</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg"><pre className="text-sm whitespace-pre-wrap font-sans">{defenseKit.roadmap_visualization}</pre></div>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2">2. Prioritization Rationale Document</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-80 overflow-y-auto"><pre className="text-sm whitespace-pre-wrap font-sans">{defenseKit.rationale_document}</pre></div>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2">3. Customizable Stakeholder Presentation</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-80 overflow-y-auto"><pre className="text-sm whitespace-pre-wrap font-sans">{defenseKit.stakeholder_presentation}</pre></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const RoadmapAlignmentConsultant: React.FC = () => {
    const [step, setStep] = React.useState(1);
    const [vision, setVision] = React.useState("To become the leading B2B platform for enterprise data analytics.");
    const [objectives, setObjectives] = React.useState("Q4 OKRs:\n1. Increase new enterprise user sign-ups by 20%.\n2. Reduce customer churn from 5% to 3%.");
    const [roadmap, setRoadmap] = React.useState("Current Roadmap Items:\n- Redesign user dashboard\n- Integrate with Salesforce\n- Build a new mobile app\n- Add two-factor authentication");
    const [promptSequence, setPromptSequence] = React.useState('');
    const [alignmentBriefing, setAlignmentBriefing] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");

            const response = await fetch('/api/roadmap-alignment', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ product_vision: vision, strategic_objectives: objectives, roadmap_outline: roadmap })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get a response from the server.");
            }
            const data = await response.json();
            setPromptSequence(data.prompt_sequence);
            setAlignmentBriefing(data.alignment_briefing);
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
                <h2 className="font-semibold text-lg mb-1">Step 1: Provide Strategic Context</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Input your high-level product vision, strategic objectives (like company OKRs), and your current roadmap or backlog.</p>
                
                <label className="block text-sm font-medium mb-1">Product Vision</label>
                <input type="text" value={vision} onChange={e => setVision(e.target.value)} className="w-full p-2 mb-4 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" disabled={step > 1} />

                <label className="block text-sm font-medium mb-1">Strategic Objectives (OKRs)</label>
                <textarea value={objectives} onChange={e => setObjectives(e.target.value)} rows={4} className="w-full p-2 mb-4 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" disabled={step > 1} />
                
                <label className="block text-sm font-medium mb-1">Current Roadmap / Backlog Outline</label>
                <textarea value={roadmap} onChange={e => setRoadmap(e.target.value)} rows={5} className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" disabled={step > 1} />
                
                 <button onClick={handleSubmit} disabled={isLoading || step > 1} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                    {isLoading ? 'Analyzing...' : 'Generate Alignment Briefing'}
                </button>
            </div>
            
            {step >= 2 && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-4">Step 2: Your Generated Strategy Documents</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">AI Prompt Sequence (for your internal AI)</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-mono">{promptSequence}</pre>
                            </div>
                        </div>
                        <div>
                             <h3 className="font-semibold mb-2">Alignment Strategy Briefing</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-sans">{alignmentBriefing}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const QualitativeInsightsSynthesizer: React.FC = () => {
    const [step, setStep] = React.useState(1);
    const [rawData, setRawData] = React.useState('User A: "The new dashboard is visually pleasing but loads very slowly with my large dataset."\nUser B: "I can\'t figure out what \'segmentation\' means. The terminology is confusing."\nUser C: "Love the new look! Wish I could export the charts to PowerPoint for my weekly report."\nUser D: "The login process is still frustrating. It keeps logging me out."');
    const [researchGoal, setResearchGoal] = React.useState('We are exploring why users are churning from our analytics dashboard.');
    const [clusters, setClusters] = React.useState<any[]>([]);
    const [insightsReport, setInsightsReport] = React.useState('');
    const [ost, setOst] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAnalyzeThemes = async () => {
        setIsLoading(true);
        setClusters([]);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
            
            const response = await fetch('/api/qualitative-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'analyze_themes', raw_data: rawData, research_goal: researchGoal })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze themes.');
            }
            const data = await response.json();
            setClusters(data.clusters);
            setStep(2);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateArtifacts = async () => {
        setIsLoading(true);
        setInsightsReport('');
        setOst('');
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
            
            const response = await fetch('/api/qualitative-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'generate_artifacts', clusters: clusters, research_goal: researchGoal })
            });

            if (!response.ok) {
                throw new Error('Failed to generate artifacts.');
            }
            const data = await response.json();
            setInsightsReport(data.insights_report);
            setOst(data.ost_starter_kit);
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
                <h2 className="font-semibold text-lg mb-1">Step 1: Ingest Qualitative Data</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Paste unstructured text data (interview transcripts, survey responses, support tickets) and state your research goal.</p>
                 <label className="block text-sm font-medium mb-1">Research Goal</label>
                <input type="text" value={researchGoal} onChange={e => setResearchGoal(e.target.value)} className="w-full p-2 mb-4 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" disabled={step > 1} />
                <label className="block text-sm font-medium mb-1">Raw User Feedback</label>
                <textarea 
                    value={rawData}
                    onChange={(e) => setRawData(e.target.value)}
                    rows={8}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 font-sans text-sm"
                    disabled={step > 1}
                />
                 <button onClick={handleAnalyzeThemes} disabled={isLoading || step > 1} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                    {isLoading ? 'Analyzing...' : 'Analyze Themes'}
                </button>
            </div>

            {step >= 2 && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-4">Step 2: Curate and Refine Themes</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Review the AI-generated insight clusters. You can merge, rename, or delete clusters to refine the analysis. (Curation controls coming soon).</p>
                    <div className="space-y-2">
                        {clusters.map((cluster, index) => (
                            <div key={index} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                                <p className="font-semibold text-sm">{cluster}</p>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleGenerateArtifacts} disabled={isLoading || step > 2} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                        {isLoading ? 'Generating...' : 'Generate Strategic Artifacts'}
                    </button>
                </div>
            )}

            {step >= 3 && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-4">Step 3: Your Strategic Artifacts</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        <div>
                            <h3 className="font-semibold mb-2">Evidence-Backed Insights Report</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-sans">{insightsReport}</pre>
                            </div>
                        </div>
                        <div>
                             <h3 className="font-semibold mb-2">Opportunity Solution Tree Starter Kit</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-sans">{ost}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ... keep other implemented components like CiCdDiagnostician, CodebaseOnboardingCompanion, etc.

const CiCdDiagnostician: React.FC = () => {
    const [step, setStep] = React.useState(1);
    const [symptoms, setSymptoms] = React.useState('Our main CI build times out on the E2E test suite, taking over 30 minutes. Deployments to staging frequently fail on Tuesdays after the weekly dependency update job runs.');
    const [promptSequence, setPromptSequence] = React.useState('');
    const [stakeholderReport, setStakeholderReport] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found. Please set it in Settings.");

            const response = await fetch('/api/cicd-diagnostician', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ symptoms })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get a response from the server.");
            }

            const data = await response.json();
            setPromptSequence(data.prompt_sequence);
            setStakeholderReport(data.improvement_report);
            setStep(2);
        } catch (err: any) {
            console.error(err);
            // You might want to display this error to the user
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <h2 className="font-semibold text-lg mb-1">Step 1: Describe Pipeline Symptoms</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Describe the observable problems with your CI/CD pipeline (e.g., long test runs, frequent failures, slow deployments).</p>
                
                <textarea 
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={6}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition font-sans text-sm"
                    disabled={step > 1}
                />
                
                 <button onClick={handleSubmit} disabled={isLoading || step > 1} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                    {isLoading ? 'Analyzing...' : 'Generate Diagnostic Plan'}
                </button>
            </div>
            
            {step >= 2 && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-1">Step 2: Your Generated Strategy Documents</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Use the Prompt Sequence in your company's secure AI, and the Improvement Report to get buy-in.</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">AI Prompt Sequence (for your internal AI)</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-mono">{promptSequence}</pre>
                            </div>
                        </div>
                        <div>
                             <h3 className="font-semibold mb-2">Pipeline Improvement Report Memo</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-sans">{stakeholderReport}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CodebaseOnboardingCompanion: React.FC = () => {
    const [projectScope, setProjectScope] = React.useState('E-commerce platform built in Rails with microservices for inventory, payments, and user accounts. The frontend is a React SPA. Key challenge is understanding the data flow between the monolith and the newer microservices.');
    const [promptSequence, setPromptSequence] = React.useState('');
    const [summaryDocument, setSummaryDocument] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isGenerated, setIsGenerated] = React.useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        setIsGenerated(false);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found. Please set it in Settings.");

            const response = await fetch('/api/codebase-onboarding', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ project_scope: projectScope })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get a response from the server.");
            }

            const data = await response.json();
            setPromptSequence(data.prompt_sequence);
            setSummaryDocument(data.onboarding_summary);
            setIsGenerated(true);
        } catch (err: any) {
            console.error(err);
            // You might want to display this error to the user
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <h2 className="font-semibold text-lg mb-1">Codebase Onboarding Companion</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Provide a high-level description of the project, including its scope, tech stack, and any known challenges. The AI will act as a senior mentor to generate an onboarding plan.</p>
                
                <textarea 
                    value={projectScope}
                    onChange={(e) => setProjectScope(e.target.value)}
                    rows={6}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition font-sans text-sm"
                    disabled={isGenerated}
                />
                
                 <button onClick={handleSubmit} disabled={isLoading || isGenerated} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                    {isLoading ? 'Generating Plan...' : 'Generate Onboarding Plan'}
                </button>
            </div>
            
            {isGenerated && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-1">Your Generated Onboarding Documents</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Use the Prompt Sequence in your company's secure AI to explore the codebase, and share the Onboarding Summary with the new engineer.</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">AI Prompt Sequence (for your internal AI)</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-mono">{promptSequence}</pre>
                            </div>
                        </div>
                        <div>
                             <h3 className="font-semibold mb-2">Onboarding Summary Document</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-sans">{summaryDocument}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ArchitecturalTradeoffAnalyst: React.FC = () => {
    const [step, setStep] = React.useState(1);
    const [problem, setProblem] = React.useState("We need to build a real-time notification system for 1 million concurrent users.");
    const [constraints, setConstraints] = React.useState("Must have less than 200ms latency, must be cost-effective, our team has deep expertise in Kafka but not in Pulsar.");
    const [options, setOptions] = React.useState<any[]>([]);
    const [evaluations, setEvaluations] = React.useState<any>({});
    const [adr, setAdr] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

    const handleBrainstorm = async () => {
        setIsLoading(true);
        setOptions([]);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
            
            const response = await fetch('/api/architectural-tradeoff-analyst', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ step: 'brainstorm_solutions', problem_statement: problem, constraints })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to brainstorm solutions.');
            }
            const data = await response.json();
            setOptions(data.options);
            const initialEvals = data.options.reduce((acc: any, option: any, index: number) => {
                acc[index] = { score: 3, notes: '' };
                return acc;
            }, {});
            setEvaluations(initialEvals);
            setStep(2);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEvaluationChange = (index: number, field: string, value: string | number) => {
        setEvaluations((prev: any) => ({
            ...prev,
            [index]: { ...prev[index], [field]: value }
        }));
    };

    const handleGenerateAdr = async () => {
        setIsLoading(true);
        setAdr("");
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");
            
            const response = await fetch('/api/architectural-tradeoff-analyst', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    step: 'generate_adr',
                    problem_statement: problem,
                    constraints,
                    options,
                    evaluations
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate ADR.');
            }
            const data = await response.json();
            setAdr(data.adr);
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
                <h2 className="font-semibold text-lg mb-1">Step 1: Frame the Problem</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Define the problem you are solving and the key constraints or quality attributes.</p>
                <label className="text-sm font-medium">Problem Statement</label>
                <textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={3} className="w-full p-2 mt-1 mb-3 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" disabled={step > 1} />
                <label className="text-sm font-medium">Key Constraints</label>
                <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={3} className="w-full p-2 mt-1 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" disabled={step > 1} />
                <button onClick={handleBrainstorm} disabled={isLoading || step > 1} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                    {isLoading ? 'Brainstorming...' : 'Brainstorm Solutions'}
                </button>
            </div>

            {step >= 2 && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-4">Step 2: Evaluate Architectural Options</h2>
                    <div className="space-y-4">
                        {options.map((option, index) => (
                            <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                                <h3 className="font-semibold">{option.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{option.overview}</p>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium">Your Evaluation Notes</label>
                                    <textarea value={evaluations[index]?.notes || ''} onChange={(e) => handleEvaluationChange(index, 'notes', e.target.value)} rows={2} className="w-full p-2 mt-1 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600" disabled={step > 2} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleGenerateAdr} disabled={isLoading || step > 2} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm">
                        {isLoading ? 'Generating ADR...' : 'Generate Architecture Decision Record'}
                    </button>
                </div>
            )}

            {step >= 3 && (
                 <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-4">Step 3: Your Architecture Decision Record (ADR)</h2>
                     <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-sans">{adr}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};


const LegacyCodeArchaeologist: React.FC = () => {
    const [step, setStep] = React.useState(1);
    const [context, setContext] = React.useState("Our legacy billing system is a Java monolith. Symptoms include slow build times (30+ mins), frequent bugs in the payment module, and it is very difficult to onboard new developers. It processes all B2B payments and is a single point of failure.");
    const [findings, setFindings] = React.useState("");
    const [discoveryPlan, setDiscoveryPlan] = React.useState("");
    const [strategyDoc, setStrategyDoc] = React.useState("");
    const [riskMemo, setRiskMemo] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

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

const FeaturePrioritizationFacilitator: React.FC = () => {
    const [step, setStep] = React.useState(1);
    const [features, setFeatures] = React.useState('1. Build new mobile app (Effort: L)\n2. Redesign the onboarding flow (Effort: M)\n3. Integrate with Salesforce (Effort: XL)');
    const [businessContext, setBusinessContext] = React.useState('Our primary OKR this quarter is to increase user retention by 15%. A secondary goal is to improve new user activation rate.');
    const [promptSequence, setPromptSequence] = React.useState('');
    const [prioritizedMemo, setPrioritizedMemo] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found.");

            const response = await fetch('/api/feature-prioritization', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ features, business_context: businessContext })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get a response from the server.");
            }
            const data = await response.json();
            setPromptSequence(data.prompt_sequence);
            setPrioritizedMemo(data.prioritized_memo);
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
                <h2 className="font-semibold text-lg mb-1">Step 1: List Features & Business Context</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Provide your list of potential features and the overarching business goals for this cycle.</p>
                
                <label htmlFor="features" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proposed Features (one per line)</label>
                <textarea 
                    id="features"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    rows={6}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition font-sans text-sm"
                    disabled={step > 1}
                />
                
                <label htmlFor="businessContext" className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Context / OKRs</label>
                <textarea 
                    id="businessContext"
                    value={businessContext}
                    onChange={(e) => setBusinessContext(e.target.value)}
                    rows={3}
                    className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition font-sans text-sm"
                    disabled={step > 1}
                />

                 <button onClick={handleSubmit} disabled={isLoading || step > 1} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                    {isLoading ? 'Prioritizing...' : 'Generate Prioritization Plan'}
                </button>
            </div>
            
            {step >= 2 && (
                <div className="p-6 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-lg mb-1">Step 2: Your Generated Prioritization Documents</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Use the Prompt Sequence for deeper analysis and the Prioritized Memo to communicate your roadmap decisions.</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">AI Prompt Sequence (for your internal AI)</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-mono">{promptSequence}</pre>
                            </div>
                        </div>
                        <div>
                             <h3 className="font-semibold mb-2">Prioritized Feature Backlog Memo</h3>
                            <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap font-sans">{prioritizedMemo}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const TechnicalDebtStrategist: React.FC = () => {
    const [step, setStep] = React.useState(1);
    const [symptoms, setSymptoms] = React.useState('Our CI/CD pipeline for the main monolith is taking over 45 minutes to run, which slows down developer velocity. New features in the billing module are taking twice as long as estimated because the code is tightly coupled and lacks tests. We had two minor production incidents last quarter related to this module.');
    const [businessContext, setBusinessContext] = React.useState('The billing module is business-critical. It handles all revenue and subscription logic. Any downtime directly impacts revenue. Slowing down feature development in this area means we are falling behind competitors.');
    const [promptSequence, setPromptSequence] = React.useState('');
    const [stakeholderBriefing, setStakeholderBriefing] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

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
    const [sourceText, setSourceText] = React.useState('');
    const [question, setQuestion] = React.useState('');
    const [result, setResult] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');

        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found. Please set it in Settings.");

             const response = await fetch('/api/rag', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ source_text: sourceText, question: question })
            });

             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get a response from the server.");
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
    const [projectGoal, setProjectGoal] = React.useState('');
    const [stakeholders, setStakeholders] = React.useState('');
    const [result, setResult] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');

        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) throw new Error("API key not found. Please set it in Settings.");

            const response = await fetch('/api/generate-kickoff', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ project_goal: projectGoal, stakeholders: stakeholders })
            });

             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get a response from the server.");
            }

            const data = await response.json();
            setResult(data.kickoff_plan);
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
    const [model, setModel] = React.useState<Model>('gemini-2.5-flash');
    const [prompt, setPrompt] = React.useState(initialPrompt || '');
    const [result, setResult] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
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
            if (!apiKey) throw new Error("API key not found. Please set it in Settings.");

            const response = await fetch('/api/execute-prompt', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ prompt: prompt, model: model })
            });

             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get a response from the server.");
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
                        <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Cost-Effective)</option>
                        <option value="gemini-2.5-pro">gemini-2.5-pro (Advanced Reasoning)</option>
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
