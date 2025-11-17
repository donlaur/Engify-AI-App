# Research URL Verification Prompt for Gemini

## Instructions
I need you to verify if these research documents and reports exist online and find their correct URLs. For each item:
1. **Research if the document exists** - Check if the report, study, or article was actually published
2. **Find the correct URL** - If it exists, provide the actual working URL
3. **Note the publication date** - Confirm if it's 2024, 2025, or a different year
4. **Verify the source** - Make sure the URL is from the official source (company website, research institution, etc.)
5. **If it doesn't exist** - Mark it as "NOT FOUND" and suggest if there's a similar report or if we should remove the citation

## Research Items to Verify

### 1. Veracode 2025 AI Security Report
**Current URL:** https://www.veracode.com/resources/reports/ai-security-report
**Summary:** Security research report from Veracode analyzing AI-generated code vulnerabilities. Should contain statistics about security issues in AI-generated code snippets, possibly including data about 45% of AI-generated snippets shipping with vulnerabilities.
**What to find:**
- Does Veracode publish AI security reports?
- What is the correct URL for their 2025 (or most recent) AI security report?
- Does it exist on their website or was it published elsewhere?

### 2. GitLab Global DevSecOps AI Report (2024)
**Current URL:** https://about.gitlab.com/resources/ebook-global-devsecops-report/
**Summary:** GitLab's annual DevSecOps report that includes AI adoption metrics and best practices. Should cover developer survey data, security practices, and AI tool usage in software development.
**What to find:**
- Does GitLab publish a Global DevSecOps Report?
- What is the correct URL for the 2024 (or most recent) report?
- Is it available as an ebook, PDF, or web page?

### 3. Metabob – The Hidden Pitfalls of Using LLMs in Software Development (2025)
**Current URL:** https://metabob.com/blog/hidden-pitfalls-llms-software-development
**Summary:** Blog post or article from Metabob discussing common issues when using Large Language Models in software development. Should cover pitfalls, challenges, and best practices for AI-assisted development.
**What to find:**
- Does Metabob have a blog or research section?
- Does this specific article exist?
- What is the correct URL if it exists?

### 4. Google Cloud – Responsible AI Leadership Report (2025)
**Current URL:** https://cloud.google.com/resources/responsible-ai-leadership-report
**Summary:** Google Cloud's report on responsible AI practices and leadership strategies. Should cover AI governance, ethics, and best practices for enterprise AI adoption.
**What to find:**
- Does Google Cloud publish Responsible AI reports?
- What is the correct URL for their 2025 (or most recent) report?
- Is it part of their cloud resources or published elsewhere?

### 5. Jellyfish 2024 Release Reliability Report
**Current URL:** https://www.jellyfish.co/resources/release-reliability-report-2024
**Summary:** Jellyfish's annual report on software release reliability and deployment practices. Should include metrics on release frequency, failure rates, and best practices for reliable deployments.
**What to find:**
- Does Jellyfish publish release reliability reports?
- What is the correct URL for the 2024 (or most recent) report?
- Is it available on their website or published elsewhere?

### 6. Developer Survey Aggregate 2025
**Current URL:** https://github.com/engify-ai/developer-survey-aggregate
**Summary:** Aggregate analysis of multiple developer surveys from 2025. Should compile data from Stack Overflow, JetBrains, GitHub, and other developer surveys to show trends in AI adoption, productivity, and developer experience.
**What to find:**
- Does this aggregate exist as a public repository or report?
- If not, should we cite individual surveys instead?
- What are the actual sources that should be cited?

### 7. Engify Field Tests (2025)
**Current URL:** https://engify.ai/research/field-tests-2025
**Summary:** Internal research from Engify documenting field tests of AI-assisted development workflows. Should contain data from real-world testing of guardrails, workflows, and AI coding assistants.
**What to find:**
- Does Engify have a research page?
- Should this be an internal document or public research?
- What is the correct URL if it exists?

### 8. Engify Field Observations (2025)
**Current URL:** https://engify.ai/research/field-observations-2025
**Summary:** Internal research from Engify documenting field observations of AI-assisted development patterns. Should contain qualitative observations and patterns from real-world usage of AI coding tools.
**What to find:**
- Does this research page exist?
- Should this be an internal document or public research?
- What is the correct URL if it exists?

### 9. PCMag – Replit AI Agent Incident (2025)
**Current URL:** https://www.pcmag.com/news/replit-ai-agent-incident
**Summary:** News article from PCMag covering an incident where Replit's AI agent caused issues or failures. Should document a specific incident, outage, or failure related to AI agents in development.
**What to find:**
- Did PCMag publish an article about a Replit AI agent incident in 2025?
- What is the correct URL if it exists?
- What is the actual title and publication date?

### 10. Unosecur – AI Agent Wiped Live DB (2025)
**Current URL:** https://unosecur.com/blog/ai-agent-wiped-live-database
**Summary:** Blog post or case study from Unosecur documenting an incident where an AI agent accidentally wiped a live database. Should be a security incident case study about AI agent failures.
**What to find:**
- Does Unosecur have a blog or case studies section?
- Does this specific article exist?
- What is the correct URL if it exists?
- Is Unosecur the correct source or should it be a different security company?

### 11. Stanford Brownfield Productivity Study (2025)
**Current URL:** https://cs.stanford.edu/research/brownfield-productivity-study
**Summary:** Academic research study from Stanford University on productivity in brownfield (existing/legacy) software development. Should examine how developers work with existing codebases and the impact of tools on productivity.
**What to find:**
- Does Stanford CS department have research on brownfield development?
- What is the correct URL if it exists?
- Who are the authors and what is the publication title?
- Is it a 2025 study or an earlier study?

### 12. METR 2025 Randomized Control Trial
**Current URL:** https://metr.org/research/rct-2025
**Summary:** Randomized control trial research from METR (Model Evaluation and Threat Research) organization on AI development practices. Should be a scientific study comparing different approaches to AI-assisted development.
**What to find:**
- Does METR publish randomized control trials?
- What is the correct URL if it exists?
- What is the actual title and publication date?
- Is METR the correct organization name?

## Output Format

For each research item, provide:

```markdown
### [Research Item Name]

**Status:** [FOUND / NOT FOUND / SIMILAR EXISTS]
**Correct URL:** [URL if found, or "N/A" if not found]
**Publication Date:** [Actual publication date]
**Notes:** [Any relevant notes about the source, similar reports, or why it doesn't exist]
**Recommendation:** [Should we use this URL, find a different source, or remove the citation]
```

## Additional Context

- We're building a public website (engify.ai) that needs accurate, verifiable citations
- All sources must be real and accessible
- If a 2025 report doesn't exist, we can use 2024 or earlier reports if they're still relevant
- Internal Engify research can be marked as "internal" if it's not public
- We prefer authoritative sources (academic institutions, major tech companies, established research organizations)

## Verification Checklist

For each item, verify:
- [ ] Does the source organization exist?
- [ ] Does the report/article exist?
- [ ] Is the URL correct?
- [ ] Is the publication date accurate?
- [ ] Is the content relevant to AI-assisted development?
- [ ] Is the source authoritative and trustworthy?

