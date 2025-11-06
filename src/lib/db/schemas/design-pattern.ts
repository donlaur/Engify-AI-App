/**
 * Design Pattern Schema
 * Software engineering design patterns (Singleton, Factory, Repository, etc.)
 * Separate from prompt engineering patterns
 */

import { z } from 'zod';

export const DesignPatternCategorySchema = z.enum([
  'CREATIONAL', // Singleton, Factory, Builder, etc.
  'STRUCTURAL', // Adapter, Decorator, Facade, etc.
  'BEHAVIORAL', // Observer, Strategy, Command, etc.
  'CONCURRENCY', // Producer-Consumer, Lock, etc.
  'ARCHITECTURAL', // MVC, Repository, CQRS, etc.
  'TESTING', // Mock, Stub, Spy, etc.
  'API', // REST, GraphQL patterns, etc.
]);

export const DesignPatternSchema = z.object({
  _id: z.string().optional(),
  id: z.string(), // URL-friendly slug (e.g., 'singleton', 'factory-pattern')
  name: z.string(), // Display name (e.g., 'Singleton Pattern')
  category: DesignPatternCategorySchema,
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  
  // Core descriptions
  description: z.string(), // Short description (1-2 sentences)
  fullDescription: z.string().optional(), // Comprehensive explanation
  problemStatement: z.string().optional(), // What problem does this solve?
  solution: z.string().optional(), // How does it solve it?
  
  // When to use
  whenToUse: z.array(z.string()).optional(), // List of scenarios
  whenNotToUse: z.array(z.string()).optional(), // Anti-patterns/alternatives
  
  // Examples
  example: z.union([
    z.string(), // Simple code example
    z.object({
      problem: z.string(), // Code without pattern
      solution: z.string(), // Code with pattern
      explanation: z.string(), // Why pattern helps
      language: z.string().optional(), // 'typescript', 'python', etc.
    }),
  ]).optional(),
  
  // Best practices and common mistakes
  bestPractices: z.array(z.string()).optional(),
  commonMistakes: z.array(z.string()).optional(),
  antiPatterns: z.array(z.string()).optional(), // What to avoid
  
  // Related patterns
  relatedPatterns: z.array(z.string()).optional(), // IDs of related patterns
  alternativePatterns: z.array(z.string()).optional(), // Alternative solutions
  
  // Educational content
  tradeoffs: z.array(z.string()).optional(), // Pros/cons
  implementationNotes: z.string().optional(), // Implementation guidance
  testingConsiderations: z.string().optional(), // How to test this pattern
  
  // AI Prompt integration
  linkedPrompts: z.array(z.string()).optional(), // Prompt IDs that help implement this pattern
  useCases: z.array(z.string()).optional(), // Real-world use cases
  
  // SEO
  metaDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  
  // Metadata
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(), // ['typescript', 'python', 'java']
  organizationId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type DesignPattern = z.infer<typeof DesignPatternSchema>;
export type DesignPatternCategory = z.infer<typeof DesignPatternCategorySchema>;

