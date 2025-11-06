#!/usr/bin/env tsx

/**
 * Seed Design Patterns Script
 * 
 * Seeds common software engineering design patterns into the database
 * Patterns are separate from AI prompt patterns - these are code patterns
 * 
 * Usage:
 *   tsx scripts/content/seed-design-patterns.ts
 *   tsx scripts/content/seed-design-patterns.ts --dry-run
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import type { DesignPattern } from '@/lib/db/schemas/design-pattern';

const DESIGN_PATTERNS: Array<Partial<DesignPattern>> = [
  // Creational Patterns
  {
    id: 'singleton',
    name: 'Singleton Pattern',
    category: 'CREATIONAL',
    level: 'beginner',
    description: 'Ensures a class has only one instance and provides a global point of access to it.',
    problemStatement: 'Need to ensure only one instance of a class exists (e.g., database connection, logger, configuration manager).',
    solution: 'Create a private constructor, static instance variable, and static getInstance() method that returns the single instance.',
    whenToUse: [
      'Need exactly one instance of a class (database connections, loggers, cache managers)',
      'Global access point without global variables',
      'Shared resource that should be managed centrally',
    ],
    whenNotToUse: [
      'When multiple instances are acceptable',
      'When you need lazy initialization in multiple threads (use thread-safe singleton)',
      'When pattern adds unnecessary complexity',
    ],
    bestPractices: [
      'Use thread-safe implementation in multi-threaded environments',
      'Consider lazy initialization vs eager initialization',
      'Use dependency injection instead when possible (better testability)',
      'Prefer enum singleton in languages that support it (Java)',
    ],
    commonMistakes: [
      'Not making constructor private (allows multiple instances)',
      'Not handling multi-threading properly',
      'Overusing singleton when simple instance variables would suffice',
      'Creating global state that makes testing difficult',
    ],
    relatedPatterns: ['factory-pattern', 'builder-pattern'],
    tradeoffs: [
      'Pros: Controlled access, lazy initialization, reduced memory footprint',
      'Cons: Hard to test, potential global state issues, violates Single Responsibility Principle',
    ],
    tags: ['creational', 'singleton', 'design-pattern', 'single-instance'],
    languages: ['typescript', 'python', 'java', 'javascript'],
    metaDescription: 'Learn the Singleton design pattern: ensure only one instance exists. Includes TypeScript examples, best practices, and when to use it.',
    seoKeywords: ['singleton pattern', 'design pattern', 'creational pattern', 'single instance', 'software design'],
  },
  {
    id: 'factory-pattern',
    name: 'Factory Pattern',
    category: 'CREATIONAL',
    level: 'intermediate',
    description: 'Creates objects without specifying the exact class of object that will be created.',
    problemStatement: 'Need to create objects without coupling code to specific classes, allowing flexibility in object creation.',
    solution: 'Define an interface for creating objects, but let subclasses decide which class to instantiate.',
    whenToUse: [
      'Don\'t know exact types or dependencies at compile time',
      'Want to provide a library of products to users',
      'Need to decouple object creation from usage',
      'Adding new product types without modifying existing code',
    ],
    bestPractices: [
      'Use factory method when you need flexibility in object creation',
      'Use abstract factory when you need families of related objects',
      'Consider builder pattern for complex object construction',
      'Keep factories focused on single responsibility',
    ],
    relatedPatterns: ['builder-pattern', 'abstract-factory', 'singleton'],
    tags: ['creational', 'factory', 'design-pattern', 'object-creation'],
    languages: ['typescript', 'python', 'java', 'javascript'],
    metaDescription: 'Master the Factory design pattern: create objects without coupling to specific classes. TypeScript examples, use cases, and best practices.',
    seoKeywords: ['factory pattern', 'factory method', 'creational pattern', 'design pattern', 'object creation'],
  },
  {
    id: 'builder-pattern',
    name: 'Builder Pattern',
    category: 'CREATIONAL',
    level: 'intermediate',
    description: 'Constructs complex objects step by step, allowing different representations using the same construction process.',
    problemStatement: 'Objects with many optional parameters or complex construction logic become unwieldy with constructors.',
    solution: 'Separate object construction from representation, allowing same construction process to create different representations.',
    whenToUse: [
      'Objects with many optional parameters',
      'Complex object construction with validation',
      'Need to create objects step-by-step',
      'Want to avoid telescoping constructor anti-pattern',
    ],
    bestPractices: [
      'Make builder methods return self for method chaining',
      'Validate parameters in build() method',
      'Consider making builder a nested class',
      'Use static factory method for builder creation',
    ],
    relatedPatterns: ['factory-pattern', 'strategy-pattern'],
    tags: ['creational', 'builder', 'design-pattern', 'object-construction'],
    languages: ['typescript', 'python', 'java', 'javascript'],
    metaDescription: 'Learn the Builder design pattern: construct complex objects step-by-step. TypeScript examples, use cases, and best practices.',
    seoKeywords: ['builder pattern', 'creational pattern', 'design pattern', 'object construction', 'method chaining'],
  },
  // Structural Patterns
  {
    id: 'adapter-pattern',
    name: 'Adapter Pattern',
    category: 'STRUCTURAL',
    level: 'intermediate',
    description: 'Allows incompatible interfaces to work together by wrapping an object with an adapter.',
    problemStatement: 'Need to use a class with an incompatible interface without modifying the original class.',
    solution: 'Create an adapter class that translates requests from the client to the adaptee.',
    whenToUse: [
      'Integrating third-party libraries with incompatible interfaces',
      'Legacy code integration',
      'Need to use existing classes with different interfaces',
      'Creating a reusable library that needs to work with various interfaces',
    ],
    bestPractices: [
      'Use object adapter (composition) over class adapter (inheritance) when possible',
      'Keep adapter focused on translation only',
      'Consider if refactoring is better than adapting',
      'Document what the adapter does and why',
    ],
    relatedPatterns: ['facade-pattern', 'decorator-pattern'],
    tags: ['structural', 'adapter', 'design-pattern', 'interface-compatibility'],
    languages: ['typescript', 'python', 'java', 'javascript'],
    metaDescription: 'Master the Adapter design pattern: make incompatible interfaces work together. TypeScript examples and integration patterns.',
    seoKeywords: ['adapter pattern', 'structural pattern', 'design pattern', 'interface compatibility', 'legacy integration'],
  },
  {
    id: 'repository-pattern',
    name: 'Repository Pattern',
    category: 'ARCHITECTURAL',
    level: 'intermediate',
    description: 'Mediates between domain and data mapping layers, providing an abstraction over data access.',
    problemStatement: 'Need to decouple business logic from data access logic, making code testable and maintainable.',
    solution: 'Create a repository interface that abstracts data access, with concrete implementations for different data sources.',
    whenToUse: [
      'Want to decouple domain logic from data access',
      'Need to test business logic without database',
      'Require flexibility to switch data sources',
      'Building domain-driven design (DDD) architecture',
    ],
    bestPractices: [
      'Define repository interface based on domain needs, not database structure',
      'Keep repositories focused on single aggregate root',
      'Use unit of work pattern for transactions',
      'Consider CQRS pattern for read/write separation',
    ],
    relatedPatterns: ['unit-of-work', 'cqrs-pattern', 'data-mapper'],
    tags: ['architectural', 'repository', 'design-pattern', 'data-access', 'ddd'],
    languages: ['typescript', 'python', 'java', 'csharp'],
    metaDescription: 'Learn the Repository pattern: decouple domain logic from data access. TypeScript examples, testing strategies, and DDD integration.',
    seoKeywords: ['repository pattern', 'architectural pattern', 'data access', 'domain-driven design', 'ddd'],
  },
  // Behavioral Patterns
  {
    id: 'strategy-pattern',
    name: 'Strategy Pattern',
    category: 'BEHAVIORAL',
    level: 'intermediate',
    description: 'Defines a family of algorithms, encapsulates each one, and makes them interchangeable.',
    problemStatement: 'Need to select algorithm at runtime, or avoid conditionals for algorithm selection.',
    solution: 'Define strategy interface, implement concrete strategies, and use context to select strategy.',
    whenToUse: [
      'Multiple ways to perform a task',
      'Want to avoid conditional statements for algorithm selection',
      'Need to add new algorithms without modifying existing code',
      'Algorithms should be interchangeable at runtime',
    ],
    bestPractices: [
      'Keep strategies stateless when possible',
      'Use dependency injection for strategy selection',
      'Consider state pattern for state-dependent behavior',
      'Document when to use each strategy',
    ],
    relatedPatterns: ['state-pattern', 'template-method', 'command-pattern'],
    tags: ['behavioral', 'strategy', 'design-pattern', 'algorithm'],
    languages: ['typescript', 'python', 'java', 'javascript'],
    metaDescription: 'Master the Strategy pattern: encapsulate algorithms and make them interchangeable. TypeScript examples and runtime algorithm selection.',
    seoKeywords: ['strategy pattern', 'behavioral pattern', 'design pattern', 'algorithm selection', 'runtime polymorphism'],
  },
  {
    id: 'observer-pattern',
    name: 'Observer Pattern',
    category: 'BEHAVIORAL',
    level: 'beginner',
    description: 'Defines a one-to-many dependency between objects so that when one object changes state, all dependents are notified.',
    problemStatement: 'Need to notify multiple objects about state changes without tight coupling.',
    solution: 'Create subject (observable) and observer interfaces, allowing loose coupling between subject and observers.',
    whenToUse: [
      'Need to notify multiple objects about state changes',
      'Want loose coupling between subject and observers',
      'Dynamic subscription/unsubscription needed',
      'Event-driven architecture',
    ],
    bestPractices: [
      'Use event emitters or pub/sub systems for complex scenarios',
      'Consider weak references to prevent memory leaks',
      'Notify observers in a consistent order',
      'Handle errors in observers gracefully',
    ],
    relatedPatterns: ['pub-sub', 'mediator-pattern', 'event-driven'],
    tags: ['behavioral', 'observer', 'design-pattern', 'event-driven'],
    languages: ['typescript', 'python', 'java', 'javascript'],
    metaDescription: 'Learn the Observer pattern: notify multiple objects about state changes. TypeScript examples, event-driven architecture, and best practices.',
    seoKeywords: ['observer pattern', 'behavioral pattern', 'design pattern', 'pub-sub', 'event-driven'],
  },
];

async function seedDesignPatterns() {
  const db = await getMongoDb();
  const collection = db.collection<DesignPattern>('design_patterns');

  console.log('🌱 Seeding design patterns...\n');

  let inserted = 0;
  let updated = 0;

  for (const pattern of DESIGN_PATTERNS) {
    const existing = await collection.findOne({ id: pattern.id });

    const patternDoc: DesignPattern = {
      id: pattern.id!,
      name: pattern.name!,
      category: pattern.category!,
      level: pattern.level!,
      description: pattern.description!,
      problemStatement: pattern.problemStatement,
      solution: pattern.solution,
      whenToUse: pattern.whenToUse || [],
      whenNotToUse: pattern.whenNotToUse || [],
      bestPractices: pattern.bestPractices || [],
      commonMistakes: pattern.commonMistakes || [],
      relatedPatterns: pattern.relatedPatterns || [],
      tradeoffs: pattern.tradeoffs || [],
      tags: pattern.tags || [],
      languages: pattern.languages || [],
      metaDescription: pattern.metaDescription,
      seoKeywords: pattern.seoKeywords || [],
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (existing) {
      await collection.updateOne(
        { id: pattern.id },
        { $set: patternDoc }
      );
      updated++;
      console.log(`   ✅ Updated: ${pattern.name}`);
    } else {
      await collection.insertOne(patternDoc);
      inserted++;
      console.log(`   ✨ Created: ${pattern.name}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✨ Created: ${inserted} patterns`);
  console.log(`   ✅ Updated: ${updated} patterns`);
  console.log(`   📈 Total: ${inserted + updated} patterns\n`);
}

seedDesignPatterns().catch((error) => {
  console.error('❌ Error seeding design patterns:', error);
  process.exit(1);
});

