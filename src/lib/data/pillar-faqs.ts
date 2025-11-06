/**
 * Pillar Page FAQ Data
 * FAQs for the Prompt Engineering Masterclass pillar page
 * Targeting practitioner-focused long-tail keywords
 */

import { FAQItem } from '@/components/features/FAQSection';

export const PILLAR_FAQS: FAQItem[] = [
  {
    question:
      'What is prompt engineering and why is it important for developers?',
    answer:
      "Prompt engineering is the practice of designing effective instructions and queries for AI models to produce desired outputs. For developers, it's crucial because well-crafted prompts can generate better code, debug issues faster, write comprehensive tests, and create better documentation. Mastering prompt engineering helps developers leverage AI tools more effectively and become more productive.",
  },
  {
    question: 'What is the chain-of-thought prompting pattern?',
    answer:
      'Chain-of-thought prompting is a technique that guides AI to think step-by-step when solving complex problems. Instead of asking for a direct answer, you prompt the AI to show its reasoning process. This leads to more accurate results, especially for multi-step problems like debugging, code refactoring, or architectural decisions. The pattern works by breaking down complex tasks into smaller, manageable steps.',
  },
  {
    question: 'How do I use AI for debugging complex code?',
    answer:
      "Effective debugging prompts include the error message, stack trace, relevant code context, expected behavior, and what you've already tried. Use chain-of-thought prompting to guide the AI through systematic debugging steps. Our debugging prompts help you structure these requests to get actionable solutions faster.",
  },
  {
    question:
      'What are the best prompt engineering patterns for code generation?',
    answer:
      'The most effective patterns for code generation include: Few-Shot Learning (providing examples), Role Assignment (act as a senior engineer), Explicit Constraints (specify requirements clearly), and Iterative Refinement (build incrementally). Our pattern library covers 15+ proven patterns with examples and best practices.',
  },
  {
    question: 'How can I improve my prompt engineering skills?',
    answer:
      "Start with our fundamental patterns, practice with real-world scenarios, analyze what works and what doesn't, iterate on your prompts, and learn from examples. Our masterclass provides structured learning paths, pattern explanations, and practical examples to help you improve systematically.",
  },
  {
    question:
      "What's the difference between prompt engineering and context engineering?",
    answer:
      'Prompt engineering focuses on HOW you ask the AI (structuring instructions, using patterns, specifying formats). Context engineering focuses on WHAT information you provide (code context, documentation, examples, background). Both are essential: good prompts without context produce generic results, and rich context without good prompts produces unfocused outputs.',
  },
  {
    question:
      'How do I write prompts that work across different AI models (GPT-4, Claude, Gemini)?',
    answer:
      'Focus on clarity, specificity, and structure rather than model-specific tricks. Use standard patterns like role assignment, explicit constraints, and step-by-step instructions. Test your prompts across models and refine based on results. Our prompts are designed to work across major AI providers.',
  },
  {
    question: 'What are common mistakes in prompt engineering?',
    answer:
      'Common mistakes include: being too vague, providing insufficient context, not specifying output format, ignoring edge cases, and not iterating based on results. Our patterns and best practices help you avoid these pitfalls and write effective prompts from the start.',
  },
];
