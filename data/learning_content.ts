export interface LearningArticle {
    id: string;
    title: string;
    author: string;
    source: string;
    url: string;
    publicationDate: string;
    tags: string[];
    fullText: string;
}

export const learningContent: LearningArticle[] = [
    {
        id: '1',
        title: 'Pragmatic Engineer Test',
        author: 'Gergely Orosz',
        source: 'The Pragmatic Engineer',
        url: 'https://blog.pragmaticengineer.com/the-pragmatic-engineer-test/',
        publicationDate: '2022-09-27',
        tags: ['Engineering Culture', 'Team Health', 'Best Practices'],
        fullText: `This is the full text of the Pragmatic Engineer Test article. It outlines a checklist for engineers to evaluate the health and practices of a potential employer's engineering team. Key areas include code quality, testing culture, CI/CD, on-call practices, and career development. The test serves as a framework for asking insightful questions during interviews to gauge the engineering maturity of a company. It suggests that companies with strong engineering cultures will have positive answers to most of the checklist items, such as having a documented architectural approach, a clear testing strategy, and a fair and sustainable on-call rotation. The article emphasizes that no company is perfect, but the answers to these questions reveal a company's priorities and its commitment to engineering excellence. It provides a list of questions that senior engineers should ask, such as 'What is the on-call situation like?' and 'How does the promotion process work?'. Ultimately, the test is a tool for empowerment, helping engineers make informed decisions about where they choose to work.`
    },
    {
        id: '2',
        title: 'The T-Shaped Person: Building a Broader Skill Set',
        author: 'J. Jabry',
        source: 'NN/g Nielsen Norman Group',
        url: 'https://www.nngroup.com/articles/t-shaped-people/',
        publicationDate: '2021-12-12',
        tags: ['Career Growth', 'Skill Development', 'Teamwork'],
        fullText: `This article explains the concept of a "T-shaped" professional. The vertical bar of the 'T' represents the depth of skills and expertise in a single field, while the horizontal bar represents the ability to collaborate across disciplines with experts in other areas and to apply knowledge in areas of expertise other than one's own. The author argues that building a T-shaped skill set is crucial for effective teamwork and innovation in modern organizations. It allows for better communication and collaboration between different specialists, such as designers, engineers, and product managers. The article provides tips on how to become more T-shaped, such as seeking out cross-functional projects, learning the basics of adjacent disciplines, and actively practicing empathy to understand the perspectives of colleagues from different backgrounds. The ultimate goal is to foster a team of individuals who are not only deep experts but also effective collaborators, leading to more creative and successful outcomes.`
    },
    {
        id: '3',
        title: 'Giving and Receiving Feedback Effectively',
        author: 'Center for Creative Leadership',
        source: 'CCL.org',
        url: 'https://www.ccl.org/articles/leading-effectively-articles/feedback-that-works-how-to-give-and-receive-feedback-effectively/',
        publicationDate: '2023-01-15',
        tags: ['Communication', 'Soft Skills', 'Leadership'],
        fullText: `This article details best practices for both giving and receiving feedback in a professional setting. For giving feedback, it emphasizes the importance of being specific, objective, and timely. It introduces frameworks like the Situation-Behavior-Impact (SBI) model to structure conversations constructively. The goal is to focus on the behavior and its impact, rather than making personal judgments. For receiving feedback, the article stresses the importance of listening actively, asking clarifying questions, and showing appreciation, even if the feedback is difficult to hear. It advises against becoming defensive and instead encourages a mindset of curiosity and a commitment to growth. The article concludes that a healthy feedback culture is a cornerstone of high-performing teams, as it fosters trust, accelerates learning, and drives continuous improvement for both individuals and the organization as a whole.`
    },
    {
        id: '4',
        title: 'AI Agents, Clearly Explained in 40 Minutes | Wade Foster (Zapier)',
        author: 'Peter Yang',
        source: 'Creator Economy by Peter Yang',
        url: 'https://creators.peterhyang.com/p/ai-agents-clearly-explained-in-40',
        publicationDate: '2023-10-26',
        tags: ['AI Agents', 'Automation', 'Workflows', 'Productivity'],
        fullText: `Zapier CEO on why we need to stop calling everything an AI agent and what actually works instead. Plus a live demo of his email triage workflow and how to automate your calendar.

Dear subscribers,

Today, I want to share a new episode with Wade Foster.

Wade is the co-founder and CEO of Zapier. We’re both sick of everyone calling everything an “AI agent” so we had some real talk about what actually works instead. Wade gave me a practical tutorial of his AI workflow that triages 100+ emails to 10 and shared exactly how to find AI automation opportunities on your calendar.

Watch now on YouTube, Apple, and Spotify.

Wade and I talked about:

(00:00) Why most people asking for agents actually want workflows
(01:25) The AI automation spectrum explained with real examples
(05:16) Live demo: Wade’s email agent that triages 100+ emails down to 10
(13:27) The difference between APIs vs MCPs
(17:05) Wade’s 90/10 rule for getting the most out of AI
(18:52) Making Zapier AI-first: Why the CEO memo isn’t enough
(24:08) Wade’s response to AI influencers saying “RIP Zapier”
(32:09) How Zapier tests for AI fluency in job interviews
(35:31) How to identify what to automate with AI in your calendar

This episode is brought to you by…Sevalla

Sevalla is the easiest and fastest way to deploy your web projects. Most deployment platforms charge per seat or hit you with surprise bills when your app scales.

Sevalla handles apps, databases, and static sites in one place with straightforward usage-based pricing. There are no caps on team size or parallel builds, and traffic between your services is free.

Try Sevalla and Get $50 in Free Credits

Top 10 takeaways I learned from this episode

Watch Wade break down the AI automation spectrum
Start with agentic workflows, not agents. “When people say they want an agent, you realize they actually just want an agentic workflow. Full agents are just not reliable for most complex tasks.” Agentic workflows are currently the happy middle ground with both deterministic and AI steps.

Build a small, focused agent for one specific task. Wade’s email agent does one thing well: “I get about 100 emails and it gives me 10 to look at.” He created categories (action required, EA should handle, FYI only) and lets the agent triage everything. The best agents are laser-focused on a specific task.`
    }
];