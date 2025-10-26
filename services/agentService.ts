// This file can be used for client-side constants or type definitions
// related to the AI services. All core AI logic now resides in the Python backend.

export const KICKOFF_PLAN_PROMPT_TEMPLATE = `Act as an expert Principal Engineer and a seasoned Project Manager combined. Your task is to create a comprehensive, well-structured project kickoff plan based on the minimal information provided. The output should be clear, concise, and actionable, formatted in Markdown.

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

*   **Project Goal:** {{projectGoal}}
*   **Key Stakeholders:** {{stakeholders}}
---

**OUTPUT (Markdown Format):**`;
