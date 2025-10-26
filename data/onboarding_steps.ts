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
