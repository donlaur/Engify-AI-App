

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { KICKOFF_PLAN_PROMPT_TEMPLATE } from '../services/agentService';

type Model = 'gemini-2.5-flash' | 'gemini-2.5-pro';
type ActiveTab = 'roadmap-defense-architect' | 'roadmap-alignment' | 'qualitative-insights' | 'codebase-onboarding' | 'cicd-diagnostician' | 'legacy-code-archaeologist' | 'architectural-tradeoff-analyst' | 'feature-prioritization' | 'post-mortem-facilitator' | 'incident-co-commander' | 'incident-strategist' | 'tech-debt-strategist' | 'user-story-generator' | 'knowledge-navigator' | 'okr-architect' | 'project-kickoff' | 'prompt-lab' | 'core-values-architect';


const EngifyWorkbench: React.FC<{ initialPrompt?: string }> = ({ initialPrompt }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('roadmap-defense-architect');

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
    const PostmortemFacilitator: React.FC = () => <FeatureStub title="Post-Mortem Facilitator" description="Guides a team through a blameless post-mortem process to find root causes and create actionable follow-up items." />;
    const IncidentCoCommander: React.FC = () => <FeatureStub title="Incident Co-Commander" description="Acts as an AI partner during a live incident, providing structured guidance, communication nudges, and a real-time log." />;
    
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
                    <TabButton name="Project Kickoff" isActive={activeTab === 'project-kickoff'} onClick={() => setActiveTab('project-kickoff')} />
                    <TabButton name="Prompt Lab" isActive={activeTab === 'prompt-lab'} onClick={() => setActiveTab('prompt-lab')} />
                </nav>
            </div>
            
            <div className="mt-6 flex-1 overflow-y-auto pr-2 min-h-0">
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

const RoadmapDefenseArchitect: React.FC = () => {
    const [step, setStep] = useState(1);
    const [initiatives, setInitiatives] = useState("1. Build a new mobile app -> Increase user retention by 15%\n2. Redesign the onboarding flow -> Improve new user activation rate\n3. Integrate with Salesforce -> Increase enterprise sales");
    const [stakeholders, setStakeholders] = useState("CEO: Overall business growth\nHead of Sales: Closing enterprise deals this quarter\nCTO: Technical stability and scalability");
    const [riceScores, setRiceScores] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [defenseKit, setDefenseKit] = useState<any>(null);

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
    const [step, setStep] = useState(1);
    const [vision, setVision] = useState("To become the leading B2B platform for enterprise data analytics.");
    const [objectives, setObjectives] = useState("Q4 OKRs:\n1. Increase new enterprise user sign-ups by 20%.\n2. Reduce customer churn from 5% to 3%.");
    const [roadmap, setRoadmap] = useState("Current Roadmap Items:\n- Redesign user dashboard\n- Integrate with Salesforce\n- Build a new mobile app\n- Add two-factor authentication");
    const [promptSequence, setPromptSequence] = useState('');
    const [alignmentBriefing, setAlignmentBriefing] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
    const [step, setStep] = useState(1);
    const [rawData, setRawData] = useState('User A: "The new dashboard is visually pleasing but loads very slowly with my large dataset."\nUser B: "I can\'t figure out what \'segmentation\' means. The terminology is confusing."\nUser C: "Love the new look! Wish I could export the charts to PowerPoint for my weekly report."\nUser D: "The login process is still frustrating. It keeps logging me out."');
    const [researchGoal, setResearchGoal] = useState('We are exploring why users are churning from our analytics dashboard.');
    const [clusters, setClusters] = useState<any[]>([]);
    const [insightsReport, setInsightsReport] = useState('');
    const [ost, setOst] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
    const [step, setStep] = useState(1);
    const [symptoms, setSymptoms] = useState('Our main CI build times out on the E2E test suite, taking over 30 minutes. Deployments to staging frequently fail on Tuesdays after the weekly dependency update job runs.');
    const [promptSequence, setPromptSequence] = useState('');
    const [stakeholderReport, setStakeholderReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
    const [projectScope, setProjectScope] = useState('E-commerce platform built in Rails with microservices for inventory, payments, and user accounts. The frontend is a React SPA. Key challenge is understanding the data flow between the monolith and the newer microservices.');
    const [promptSequence, setPromptSequence] = useState('');
    const [summaryDocument, setSummaryDocument] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);

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
    const [step, setStep] = useState(1);
    const [problem, setProblem] = useState("We need to build a real-time notification system for 1 million concurrent users.");
    const [constraints, setConstraints] = useState("Must have less than 200ms latency, must be cost-effective, our team has deep expertise in Kafka but not in Pulsar.");
    const [options, setOptions] = useState<any[]>([]);
    const [evaluations, setEvaluations] = useState<any>({});
    const [adr, setAdr] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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

const FeaturePrioritizationFacilitator: React.FC = () => {
    const [step, setStep] = useState(1);
    const [features, setFeatures] = useState('1. Build new mobile app (Effort: L)\n2. Redesign the onboarding flow (Effort: M)\n3. Integrate with Salesforce (Effort: XL)');
    const [businessContext, setBusinessContext] = useState('Our primary OKR this quarter is to increase user retention by 15%. A secondary goal is to improve new user activation rate.');
    const [promptSequence, setPromptSequence] = useState('');
    const [prioritizedMemo, setPrioritizedMemo] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
    const [sourceText, setSourceText] = useState('');
    const [question, setQuestion] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');

        try {
            const prompt = `Based on the following text, please answer the question.\n\nText:\n"""\n${sourceText}\n"""\n\nQuestion: ${question}`;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            // Using gemini-2.5-flash for a basic Q&A task as per guidelines.
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setResult(response.text);
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
    const [projectGoal, setProjectGoal] = useState('');
    const [stakeholders, setStakeholders] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');

        try {
            const promptContent = KICKOFF_PLAN_PROMPT_TEMPLATE
                .replace('{{projectGoal}}', projectGoal)
                .replace('{{stakeholders}}', stakeholders);
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            // Using gemini-2.5-pro for a complex text task as per guidelines.
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: promptContent,
            });
            setResult(response.text);
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
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
            });
            setResult(response.text);
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