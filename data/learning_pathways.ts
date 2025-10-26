
export interface PathwayStep {
    id: number;
    title: string;
    description: string;
    actionText: string;
    type: 'article' | 'playbook' | 'workbench' | 'external_link';
    targetId: string; // e.g., article id, playbook id, workbench tool id, or a URL
}

export interface LearningPathway {
    id: string;
    title: string;
    description: string;
    steps: PathwayStep[];
}

export const learningPathways: LearningPathway[] = [
    {
        id: 'ai-strategy-for-leaders',
        title: 'AI Strategy for Leaders',
        description: 'A guided pathway for engineering managers and directors to develop a robust AI strategy for their teams.',
        steps: [
            {
                id: 1,
                title: "Understand the Landscape",
                description: "Start by reading a key article on how AI is impacting engineering leadership to understand the challenges and opportunities.",
                actionText: "Read Article",
                type: 'article',
                targetId: '7', // "How AI Is Impacting Engineering Leadership"
            },
            {
                id: 2,
                title: "Define Your AI Policy",
                description: "Before you can adopt AI, you need a clear and safe policy. Use this playbook to draft a comprehensive AI usage policy for your team.",
                actionText: "Use Playbook",
                type: 'playbook',
                targetId: 'ai-usage-policy', // Assumes a new playbook id
            },
            {
                id: 3,
                title: "Set Measurable Goals",
                description: "A great strategy needs measurable goals. Use the 'Goal & OKR Architect' to define clear objectives for your team's AI adoption this quarter.",
                actionText: "Go to Workbench",
                type: 'workbench',
                targetId: 'okr-architect',
            },
            {
                id: 4,
                title: "Learn from the Best",
                description: "Read how leaders at OpenAI think about the intersection of Engineering Strategy and AI Product Strategy.",
                actionText: "Read Article",
                type: 'article',
                targetId: '9', // "AI Product Strategy for Engineering Leaders"
            },
            {
                id: 5,
                title: "Tackle Strategic Problems",
                description: "Now, apply your strategic thinking. Use the 'Technical Debt Strategist' to build a business case for a real-world problem.",
                actionText: "Go to Workbench",
                type: 'workbench',
                targetId: 'tech-debt-strategist',
            },
        ]
    },
    {
        id: 'foundational-certifications',
        title: 'Foundational AI & Cloud Certifications',
        description: 'A curated list of cost-effective, industry-recognized courses to build a strong foundation in AI and cloud engineering.',
        steps: [
            {
                id: 1,
                title: "Google AI Essentials",
                description: "Taught by Google AI experts on Coursera, this course provides a solid, non-technical introduction to AI and machine learning concepts. It's the perfect starting point for understanding Google's ecosystem.",
                actionText: "Explore on Coursera",
                type: 'external_link',
                targetId: 'https://www.coursera.org/google-ai-essentials',
            },
            {
                id: 2,
                title: "AI for Everyone by DeepLearning.AI",
                description: "Created by Andrew Ng, this is a classic, highly-regarded course that explains AI from a strategic, business-oriented perspective. Essential for leaders, PMs, and any engineer who wants to understand the 'why' behind AI.",
                actionText: "Explore on Coursera",
                type: 'external_link',
                targetId: 'https://www.coursera.org/learn/ai-for-everyone',
            },
            {
                id: 3,
                title: "AWS Certified Cloud Practitioner",
                description: "A foundational understanding of cloud computing is essential for working with AI at scale. This certification from AWS provides a comprehensive overview of cloud concepts, services, and security. Similar certifications are available for GCP and Azure.",
                actionText: "Explore AWS Training",
                type: 'external_link',
                targetId: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
            },
             {
                id: 4,
                title: "Microsoft Azure AI Fundamentals",
                description: "This certification is a great entry point into Microsoft's AI ecosystem. It covers fundamental concepts of machine learning and AI workloads on Azure, making it a valuable credential in a multi-cloud world.",
                actionText: "Explore Microsoft Learn",
                type: 'external_link',
                targetId: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/',
            }
        ]
    }
];
// We will add more pathways here in the future.
// e.g., "AI for Product Managers", "Developer's First 30 Days with AI", etc.