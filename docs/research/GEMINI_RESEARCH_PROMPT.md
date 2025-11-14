# Gemini Research Prompt: Find Real URLs for Broken Research Citations

## Context
I'm building a public website (engify.ai) that documents AI-assisted development workflows and pain points. I need to verify and find correct URLs for research citations that are currently returning 404 errors. Each citation is used to support specific claims about AI development challenges.

## Task
For each research item below:
1. **Research if the document exists** - Search for the actual report, study, or article
2. **Find the correct URL** - If it exists, provide the working URL from the official source
3. **Verify the claim** - Confirm if the specific statistic or claim mentioned is actually in the source
4. **Note publication date** - Confirm if it's 2024, 2025, or a different year
5. **If not found** - Suggest alternative sources or mark as "NOT FOUND"

## Research Items to Verify

### 1. Veracode 2025 AI Security Report
**Current URL:** https://www.veracode.com/resources/reports/ai-security-report (404)
**Claim in workflows:** "Veracode's AI Security Report found 45% of AI-generated snippets ship with vulnerabilities"
**Summary:** Security research report from Veracode analyzing vulnerabilities in AI-generated code. Should contain statistics about security issues found in AI-generated code snippets, specifically mentioning that 45% of AI-generated snippets contain vulnerabilities.
**Context:** Used in workflow "Prevent Insecure Code" to support claims about AI security vulnerabilities.
**What to find:**
- Does Veracode publish AI security reports?
- What is the correct URL for their 2025 (or most recent) AI security report?
- Does it contain the 45% statistic about AI-generated code vulnerabilities?
- Is it published on their website or elsewhere (e.g., blog, research portal)?

### 2. GitLab Global DevSecOps AI Report (2024)
**Current URL:** https://about.gitlab.com/resources/ebook-global-devsecops-report/ (404)
**Claim in workflows:** References GitLab's DevSecOps survey data about AI adoption and security practices
**Summary:** GitLab's annual DevSecOps report that includes AI adoption metrics, security practices, and developer survey data. Should cover how teams are adopting AI tools, security concerns, and best practices.
**Context:** Used in workflow "Enforce Daily Merge Discipline" to support claims about merge practices and AI adoption.
**What to find:**
- Does GitLab publish a Global DevSecOps Report?
- What is the correct URL for the 2024 (or most recent) report?
- Is it available as an ebook, PDF download, or web page?
- Does it include AI-specific sections or data?

### 3. Metabob – The Hidden Pitfalls of Using LLMs in Software Development (2025)
**Current URL:** https://metabob.com/blog/hidden-pitfalls-llms-software-development (404)
**Claim in workflows:** References Metabob's research on LLM pitfalls in software development
**Summary:** Blog post or article from Metabob discussing common issues when using Large Language Models in software development. Should cover pitfalls, challenges, and best practices for AI-assisted development, possibly including issues with code quality, security, or developer productivity.
**Context:** Used in workflow "Prevent Toolchain Sprawl" to support claims about AI tool adoption challenges.
**What to find:**
- Does Metabob have a blog or research section?
- Does this specific article exist?
- What is the correct URL if it exists?
- What are the actual pitfalls mentioned?

### 4. Google Cloud – Responsible AI Leadership Report (2025)
**Current URL:** https://cloud.google.com/resources/responsible-ai-leadership-report (404)
**Claim in workflows:** "Enterprises cite transparent governance metrics as a top driver for AI adoption confidence"
**Summary:** Google Cloud's report on responsible AI practices and leadership strategies. Should cover AI governance, ethics, metrics, and best practices for enterprise AI adoption. Specifically mentions that transparent governance metrics drive AI adoption confidence.
**Context:** Used in workflow "Track AI Governance Metrics" to support claims about governance metrics importance.
**What to find:**
- Does Google Cloud publish Responsible AI reports?
- What is the correct URL for their 2025 (or most recent) report?
- Is it part of their cloud resources, blog, or research portal?
- Does it mention governance metrics and AI adoption confidence?

### 5. Jellyfish 2024 Release Reliability Report
**Current URL:** https://www.jellyfish.co/resources/release-reliability-report-2024 (404)
**Claim in workflows:** References Jellyfish's release reliability findings and metrics
**Summary:** Jellyfish's annual report on software release reliability and deployment practices. Should include metrics on release frequency, failure rates, deployment practices, and best practices for reliable deployments. May include data about how AI affects release reliability.
**Context:** Used in workflow "Track Release Readiness" to support claims about release reliability metrics.
**What to find:**
- Does Jellyfish publish release reliability reports?
- What is the correct URL for the 2024 (or most recent) report?
- Is it available on their website or published elsewhere?
- What metrics does it include?

### 6. Developer Survey Aggregate 2025
**Current URL:** https://github.com/engify-ai/developer-survey-aggregate (404)
**Claim in workflows:** "Teams lose significant time when AI incidents aren't logged and lessons aren't documented"
**Summary:** Aggregate analysis of multiple developer surveys from 2025. Should compile data from Stack Overflow, JetBrains, GitHub, and other developer surveys to show trends in AI adoption, productivity, developer experience, and incident management. Specifically mentions that teams lose time when AI incidents aren't logged.
**Context:** Used in workflow "Context Drift Containment" to support claims about time lost due to undocumented incidents.
**What to find:**
- Does this aggregate exist as a public repository or report?
- If not, should we cite individual surveys instead?
- What are the actual sources that should be cited for the "time lost" claim?
- Is there a specific survey that mentions incident logging and time loss?

### 7. Engify Field Tests (2025)
**Current URL:** https://engify.ai/research/field-tests-2025 (404)
**Claim in workflows:** Internal research from Engify documenting field tests
**Summary:** Internal research from Engify documenting field tests of AI-assisted development workflows. Should contain data from real-world testing of guardrails, workflows, and AI coding assistants. This is internal Engify research that may not be public.
**Context:** Used in various workflows to support claims about workflow effectiveness.
**What to find:**
- Does Engify have a research page?
- Should this be an internal document or public research?
- What is the correct URL if it exists?
- If internal, should we remove the citation?

### 8. Engify Field Observations (2025)
**Current URL:** https://engify.ai/research/field-observations-2025 (404)
**Claim in workflows:** Internal research from Engify documenting field observations
**Summary:** Internal research from Engify documenting field observations of AI-assisted development patterns. Should contain qualitative observations and patterns from real-world usage of AI coding tools. This is internal Engify research that may not be public.
**Context:** Used in various workflows to support claims about real-world patterns.
**What to find:**
- Does this research page exist?
- Should this be an internal document or public research?
- What is the correct URL if it exists?
- If internal, should we remove the citation?

### 9. PCMag – Replit AI Agent Incident (2025)
**Current URL:** https://www.pcmag.com/news/replit-ai-agent-incident (404)
**Claim in workflows:** References a specific incident where Replit's AI agent caused issues or failures
**Summary:** News article from PCMag covering an incident where Replit's AI agent caused issues, failures, or outages. Should document a specific incident, outage, or failure related to AI agents in development, possibly including details about what went wrong and how it was resolved.
**Context:** Used in workflow "Prevent HITL Bypass" to support claims about AI agent failures.
**What to find:**
- Did PCMag publish an article about a Replit AI agent incident in 2025?
- What is the correct URL if it exists?
- What is the actual title and publication date?
- What was the incident about?

### 10. Unosecur – AI Agent Wiped Live DB (2025)
**Current URL:** https://unosecur.com/blog/ai-agent-wiped-live-database (404)
**Claim in workflows:** References an incident where an AI agent accidentally wiped a live database
**Summary:** Blog post or case study from Unosecur documenting an incident where an AI agent accidentally wiped a live database. Should be a security incident case study about AI agent failures, possibly including details about how the incident occurred, the impact, and lessons learned.
**Context:** Used in workflow "Prevent Destructive Actions" to support claims about AI agent destructive operations.
**What to find:**
- Does Unosecur have a blog or case studies section?
- Does this specific article exist?
- What is the correct URL if it exists?
- Is Unosecur the correct source or should it be a different security company?
- What was the actual incident?

### 11. Stanford Brownfield Productivity Study (2025)
**Current URL:** https://cs.stanford.edu/research/brownfield-productivity-study (404)
**Claim in workflows:** References Stanford research on productivity in brownfield (existing/legacy) software development
**Summary:** Academic research study from Stanford University on productivity in brownfield (existing/legacy) software development. Should examine how developers work with existing codebases, the impact of tools on productivity, and challenges in maintaining legacy systems. May include data about AI tool effectiveness in brownfield contexts.
**Context:** Used in workflow "Prevent Brownfield Penalty" to support claims about AI challenges with legacy code.
**What to find:**
- Does Stanford CS department have research on brownfield development?
- What is the correct URL if it exists?
- Who are the authors and what is the publication title?
- Is it a 2025 study or an earlier study?
- What are the key findings?

### 12. METR 2025 Randomized Control Trial
**Current URL:** https://metr.org/research/rct-2025 (404)
**Claim in workflows:** References METR's randomized control trial findings on AI development practices
**Summary:** Randomized control trial research from METR (Model Evaluation and Threat Research) organization on AI development practices. Should be a scientific study comparing different approaches to AI-assisted development, possibly including metrics on productivity, code quality, or security.
**Context:** Used in workflow "Catch Mock Metrics" to support claims about AI development research.
**What to find:**
- Does METR publish randomized control trials?
- What is the correct URL if it exists?
- What is the actual title and publication date?
- Is METR the correct organization name?
- What are the key findings?

## Output Format

For each research item, provide:

```markdown
### [Research Item Name]

**Status:** [FOUND / NOT FOUND / SIMILAR EXISTS / INTERNAL]
**Correct URL:** [URL if found, or "N/A" if not found]
**Publication Date:** [Actual publication date]
**Claim Verification:** [Does the specific claim/statistic exist in the source?]
**Notes:** [Any relevant notes about the source, similar reports, or why it doesn't exist]
**Recommendation:** [Should we use this URL, find a different source, or remove the citation]
**Alternative Sources:** [If not found, suggest alternative authoritative sources]
```

## Additional Context

- We're building a public website (engify.ai) that needs accurate, verifiable citations
- All sources must be real and accessible
- If a 2025 report doesn't exist, we can use 2024 or earlier reports if they're still relevant
- Internal Engify research can be marked as "INTERNAL" if it's not public
- We prefer authoritative sources (academic institutions, major tech companies, established research organizations)
- Each citation supports a specific claim or statistic in our workflows

## Verification Checklist

For each item, verify:
- [ ] Does the source organization exist?
- [ ] Does the report/article exist?
- [ ] Is the URL correct?
- [ ] Is the publication date accurate (2024, 2025, or other)?
- [ ] Does the source contain the specific claim/statistic mentioned?
- [ ] Is the content relevant to AI-assisted development?
- [ ] Is the source authoritative and trustworthy?
- [ ] If not found, what are alternative sources?

## Priority

Focus on finding sources for items that support specific statistics or claims:
1. **High Priority:** Veracode (45% statistic), Google Cloud (governance metrics claim), Developer Survey Aggregate (time lost claim)
2. **Medium Priority:** GitLab, Jellyfish, Stanford, METR (general references)
3. **Low Priority:** PCMag, Unosecur (specific incidents that may not be documented)
4. **Internal:** Engify Field Tests, Engify Field Observations (may not be public)

