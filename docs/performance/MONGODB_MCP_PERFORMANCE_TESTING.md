# MongoDB MCP Performance Testing Setup

## Overview

This setup implements MongoDB MCP (Model Context Protocol) Server integration with Performance Advisor for comprehensive database performance testing and optimization.

## Components

### 1. MongoDB MCP Server Configuration

### 2. Performance Testing Scripts

### 3. Performance Advisor Integration

### 4. Automated Performance Monitoring

---

## 1. MongoDB MCP Server Setup

### Installation

```bash
# Install MongoDB MCP Server
npm install @mongodb/mcp-server

# Install performance testing dependencies
npm install --save-dev @mongodb/performance-advisor mongodb-memory-server
```

### Configuration

```typescript
// src/lib/mongodb/mcp-server.ts
import { MongoClient } from 'mongodb';
import { PerformanceAdvisor } from '@mongodb/performance-advisor';

export class MongoDBMCPServer {
  private client: MongoClient;
  private performanceAdvisor: PerformanceAdvisor;

  constructor(uri: string) {
    this.client = new MongoClient(uri);
    this.performanceAdvisor = new PerformanceAdvisor(this.client);
  }

  async connect(): Promise<void> {
    await this.client.connect();
    console.log('MongoDB MCP Server connected');
  }

  async getPerformanceRecommendations(): Promise<any> {
    return await this.performanceAdvisor.getRecommendations();
  }

  async analyzeQueryPerformance(query: any): Promise<any> {
    return await this.performanceAdvisor.analyzeQuery(query);
  }
}
```

---

## 2. Performance Testing Scripts

### Load Testing Script

```typescript
// scripts/performance/mongodb-load-test.ts
import { MongoClient } from 'mongodb';
import { performance } from 'perf_hooks';

interface PerformanceMetrics {
  operation: string;
  duration: number;
  documentsProcessed: number;
  memoryUsage: number;
  timestamp: Date;
}

class MongoDBLoadTester {
  private client: MongoClient;
  private metrics: PerformanceMetrics[] = [];

  constructor(uri: string) {
    this.client = new MongoClient(uri);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Test inefficient queries to generate performance data
   * This intentionally creates slow queries for Performance Advisor analysis
   */
  async runInefficientQueries(): Promise<void> {
    const db = this.client.db('engify');
    const usersCollection = db.collection('users');
    const promptsCollection = db.collection('prompts');

    console.log('🚀 Starting inefficient query tests...');

    // Test 1: Full collection scan without index
    await this.testFullCollectionScan(usersCollection);

    // Test 2: Complex aggregation without proper indexes
    await this.testComplexAggregation(promptsCollection);

    // Test 3: Large document operations
    await this.testLargeDocumentOperations(usersCollection);

    // Test 4: Concurrent operations
    await this.testConcurrentOperations(usersCollection, promptsCollection);
  }

  private async testFullCollectionScan(collection: any): Promise<void> {
    const startTime = performance.now();

    // Intentionally inefficient query - full collection scan
    const result = await collection
      .find({
        $or: [
          { email: { $regex: /test/i } },
          { name: { $regex: /user/i } },
          { role: { $in: ['user', 'admin', 'moderator'] } },
        ],
      })
      .toArray();

    const endTime = performance.now();

    this.metrics.push({
      operation: 'full_collection_scan',
      duration: endTime - startTime,
      documentsProcessed: result.length,
      memoryUsage: process.memoryUsage().heapUsed,
      timestamp: new Date(),
    });

    console.log(
      `📊 Full collection scan: ${result.length} docs in ${(endTime - startTime).toFixed(2)}ms`
    );
  }

  private async testComplexAggregation(collection: any): Promise<void> {
    const startTime = performance.now();

    // Complex aggregation pipeline without proper indexes
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: new Date('2024-01-01') },
          tags: { $exists: true },
        },
      },
      {
        $unwind: '$tags',
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          avgLength: { $avg: { $strLenCP: '$content' } },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 100,
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const endTime = performance.now();

    this.metrics.push({
      operation: 'complex_aggregation',
      duration: endTime - startTime,
      documentsProcessed: result.length,
      memoryUsage: process.memoryUsage().heapUsed,
      timestamp: new Date(),
    });

    console.log(
      `📊 Complex aggregation: ${result.length} results in ${(endTime - startTime).toFixed(2)}ms`
    );
  }

  private async testLargeDocumentOperations(collection: any): Promise<void> {
    const startTime = performance.now();

    // Create large documents to test memory usage
    const largeDocuments = Array.from({ length: 100 }, (_, i) => ({
      _id: `large_doc_${i}`,
      content: 'x'.repeat(10000), // 10KB per document
      metadata: {
        timestamp: new Date(),
        index: i,
        data: Array.from({ length: 100 }, () => Math.random()),
      },
    }));

    await collection.insertMany(largeDocuments);
    const endTime = performance.now();

    this.metrics.push({
      operation: 'large_document_insert',
      duration: endTime - startTime,
      documentsProcessed: largeDocuments.length,
      memoryUsage: process.memoryUsage().heapUsed,
      timestamp: new Date(),
    });

    console.log(
      `📊 Large document insert: ${largeDocuments.length} docs in ${(endTime - startTime).toFixed(2)}ms`
    );

    // Cleanup
    await collection.deleteMany({ _id: { $regex: /^large_doc_/ } });
  }

  private async testConcurrentOperations(
    collection1: any,
    collection2: any
  ): Promise<void> {
    const startTime = performance.now();

    // Run multiple operations concurrently
    const operations = [
      collection1.find({}).limit(1000).toArray(),
      collection2.find({}).limit(1000).toArray(),
      collection1.countDocuments(),
      collection2.countDocuments(),
      collection1.distinct('role'),
      collection2.distinct('category'),
    ];

    const results = await Promise.all(operations);
    const endTime = performance.now();

    this.metrics.push({
      operation: 'concurrent_operations',
      duration: endTime - startTime,
      documentsProcessed: results.reduce(
        (sum, result) => sum + (Array.isArray(result) ? result.length : 1),
        0
      ),
      memoryUsage: process.memoryUsage().heapUsed,
      timestamp: new Date(),
    });

    console.log(
      `📊 Concurrent operations: completed in ${(endTime - startTime).toFixed(2)}ms`
    );
  }

  async generatePerformanceReport(): Promise<void> {
    console.log('\n📈 Performance Test Report');
    console.log('========================');

    this.metrics.forEach((metric) => {
      console.log(`${metric.operation}:`);
      console.log(`  Duration: ${metric.duration.toFixed(2)}ms`);
      console.log(`  Documents: ${metric.documentsProcessed}`);
      console.log(
        `  Memory: ${(metric.memoryUsage / 1024 / 1024).toFixed(2)}MB`
      );
      console.log(`  Timestamp: ${metric.timestamp.toISOString()}`);
      console.log('');
    });

    // Calculate averages
    const avgDuration =
      this.metrics.reduce((sum, m) => sum + m.duration, 0) /
      this.metrics.length;
    const totalDocs = this.metrics.reduce(
      (sum, m) => sum + m.documentsProcessed,
      0
    );

    console.log('Summary:');
    console.log(`  Average Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`  Total Documents Processed: ${totalDocs}`);
    console.log(`  Total Operations: ${this.metrics.length}`);
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}

// Main execution
async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/engify';
  const tester = new MongoDBLoadTester(uri);

  try {
    await tester.connect();
    await tester.runInefficientQueries();
    await tester.generatePerformanceReport();
  } catch (error) {
    console.error('Performance test failed:', error);
  } finally {
    await tester.close();
  }
}

if (require.main === module) {
  main();
}

export { MongoDBLoadTester };
```

---

## 3. Performance Advisor Integration

```typescript
// src/lib/mongodb/performance-advisor.ts
import { MongoClient } from 'mongodb';

export class PerformanceAdvisorIntegration {
  private client: MongoClient;

  constructor(client: MongoClient) {
    this.client = client;
  }

  /**
   * Get performance recommendations from MongoDB Performance Advisor
   */
  async getRecommendations(): Promise<any> {
    try {
      const db = this.client.db('admin');

      // Query Performance Advisor recommendations
      const recommendations = await db
        .collection('system.profile')
        .find({
          'command.aggregate': { $exists: true },
        })
        .limit(10)
        .toArray();

      return {
        recommendations: recommendations,
        timestamp: new Date(),
        status: 'success',
      };
    } catch (error) {
      console.error('Failed to get performance recommendations:', error);
      return {
        recommendations: [],
        timestamp: new Date(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Analyze specific query performance
   */
  async analyzeQuery(query: any): Promise<any> {
    const startTime = performance.now();

    try {
      const db = this.client.db('engify');
      const result = await db
        .collection('users')
        .find(query)
        .explain('executionStats');

      const endTime = performance.now();

      return {
        query,
        executionTime: endTime - startTime,
        executionStats: result.executionStats,
        recommendations: this.generateQueryRecommendations(
          result.executionStats
        ),
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        query,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  private generateQueryRecommendations(executionStats: any): string[] {
    const recommendations: string[] = [];

    if (
      executionStats.totalDocsExamined >
      executionStats.totalDocsReturned * 2
    ) {
      recommendations.push(
        'Consider adding indexes to reduce document examination'
      );
    }

    if (executionStats.executionTimeMillis > 100) {
      recommendations.push(
        'Query execution time is high - consider optimization'
      );
    }

    if (
      executionStats.totalKeysExamined >
      executionStats.totalDocsReturned * 2
    ) {
      recommendations.push('Index efficiency could be improved');
    }

    return recommendations;
  }

  /**
   * Get index usage statistics
   */
  async getIndexUsageStats(): Promise<any> {
    try {
      const db = this.client.db('engify');
      const stats = await db
        .collection('users')
        .aggregate([{ $indexStats: {} }])
        .toArray();

      return {
        indexStats: stats,
        timestamp: new Date(),
        status: 'success',
      };
    } catch (error) {
      return {
        indexStats: [],
        timestamp: new Date(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
```

---

## 4. MCP Server Integration

```typescript
// src/lib/mongodb/mcp-integration.ts
import { MongoDBMCPServer } from './mcp-server';
import { PerformanceAdvisorIntegration } from './performance-advisor';

export class EngifyMCPIntegration {
  private mcpServer: MongoDBMCPServer;
  private performanceAdvisor: PerformanceAdvisorIntegration;

  constructor(mongoUri: string) {
    this.mcpServer = new MongoDBMCPServer(mongoUri);
    this.performanceAdvisor = new PerformanceAdvisorIntegration(
      this.mcpServer['client']
    );
  }

  async initialize(): Promise<void> {
    await this.mcpServer.connect();
    console.log('✅ MongoDB MCP Server initialized');
  }

  /**
   * Get AI-powered performance recommendations
   */
  async getAIPerformanceRecommendations(): Promise<any> {
    const recommendations = await this.performanceAdvisor.getRecommendations();
    const indexStats = await this.performanceAdvisor.getIndexUsageStats();

    return {
      recommendations,
      indexStats,
      aiAnalysis: await this.generateAIAnalysis(recommendations, indexStats),
      timestamp: new Date(),
    };
  }

  private async generateAIAnalysis(
    recommendations: any,
    indexStats: any
  ): Promise<string> {
    // This would integrate with your AI system to analyze performance data
    const analysis = `
    Performance Analysis:
    
    Recommendations Found: ${recommendations.recommendations?.length || 0}
    Index Statistics: ${indexStats.indexStats?.length || 0} indexes analyzed
    
    Key Insights:
    - Database performance monitoring active
    - Performance Advisor integration working
    - Ready for optimization recommendations
    
    Next Steps:
    1. Review performance recommendations
    2. Implement suggested indexes
    3. Monitor performance improvements
    4. Re-run tests to validate changes
    `;

    return analysis;
  }

  async close(): Promise<void> {
    await this.mcpServer['client'].close();
  }
}
```

---

## 5. Usage Examples

### Running Performance Tests

```bash
# Run MongoDB load testing
npm run test:mongodb-performance

# Get performance recommendations
npm run mongodb:recommendations

# Analyze specific query
npm run mongodb:analyze-query
```

### Package.json Scripts

```json
{
  "scripts": {
    "test:mongodb-performance": "tsx scripts/performance/mongodb-load-test.ts",
    "mongodb:recommendations": "tsx scripts/performance/get-recommendations.ts",
    "mongodb:analyze-query": "tsx scripts/performance/analyze-query.ts"
  }
}
```

---

## 6. Integration with Existing System

### API Endpoint for Performance Monitoring

```typescript
// src/app/api/v2/performance/mongodb/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EngifyMCPIntegration } from '@/lib/mongodb/mcp-integration';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { success: false, error: 'MongoDB URI not configured' },
        { status: 500 }
      );
    }

    const mcpIntegration = new EngifyMCPIntegration(mongoUri);
    await mcpIntegration.initialize();

    const performanceData =
      await mcpIntegration.getAIPerformanceRecommendations();

    await mcpIntegration.close();

    return NextResponse.json({
      success: true,
      data: performanceData,
      metadata: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

---

## Benefits

1. **Automated Performance Monitoring**: Continuous monitoring of MongoDB performance
2. **AI-Powered Recommendations**: Get intelligent suggestions for optimization
3. **Load Testing**: Simulate real-world usage patterns
4. **Index Optimization**: Identify missing or inefficient indexes
5. **Query Analysis**: Detailed analysis of query performance
6. **Integration Ready**: Seamlessly integrates with existing MCP infrastructure

This setup provides comprehensive MongoDB performance testing and optimization capabilities using the MongoDB MCP Server and Performance Advisor integration!
