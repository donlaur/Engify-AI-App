#!/usr/bin/env node

// MCP server with MongoDB integration

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

// Express app for Chrome extension
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/engify';
const client = new MongoClient(mongoUri);
let db;

async function connectToMongo() {
  try {
    await client.connect();
    db = client.db();
    console.log('✅ Connected to MongoDB');
    
    // Create indexes for better queries
    await db.collection('bugs').createIndex({ file: 1, timestamp: -1 });
    await db.collection('bugs').createIndex({ userId: 1, timestamp: -1 });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('⚠️ Using in-memory storage as fallback');
    
    // Fallback to in-memory storage
    global.bugStorage = global.bugStorage || [];
  }
}

// Initialize MongoDB connection
connectToMongo();

// Store bug in database
async function storeBug(bugData) {
  try {
    if (db) {
      // Store in MongoDB
      const bug = {
        ...bugData,
        timestamp: new Date(),
        id: Date.now().toString(),
        status: 'pending' // For dashboard queue functionality
      };
      
      const result = await db.collection('bugs').insertOne(bug);
      console.log('✅ Stored in MongoDB:', bug);
      return { ...bug, _id: result.insertedId };
    } else {
      // Fallback to in-memory
      const bug = {
        ...bugData,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
        status: 'pending'
      };
      
      global.bugStorage.push(bug);
      console.log('✅ Stored in memory:', bug);
      return bug;
    }
  } catch (error) {
    console.error('❌ Error storing bug:', error);
    throw error;
  }
}

// Get bugs from database
async function getBugs(filter = {}, limit = 10) {
  try {
    if (db) {
      const bugs = await db.collection('bugs')
        .find(filter)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      return bugs;
    } else {
      // Fallback to in-memory
      return global.bugStorage.slice(-limit).reverse();
    }
  } catch (error) {
    console.error('❌ Error getting bugs:', error);
    return [];
  }
}
const server = new Server(
  {
    name: 'engify-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// MCP Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'store_bug_context',
        description: 'Store bug context from Chrome extension',
        inputSchema: {
          type: 'object',
          properties: {
            file: { type: 'string', description: 'Source file path' },
            line: { type: 'number', description: 'Line number' },
            column: { type: 'number', description: 'Column number' },
            description: { type: 'string', description: 'Bug description' }
          },
          required: ['file', 'line', 'column']
        }
      },
      {
        name: 'get_bug_history',
        description: 'Get bug history',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number of results' }
          }
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'store_bug_context':
        const bug = await storeBug({
          file: args.file,
          line: args.line,
          column: args.column,
          description: args.description || 'No description',
          issues: args.issues || [],
          dimensions: args.dimensions || {},
          styles: args.styles || {},
          elementInfo: args.elementInfo || {},
          source: 'mcp-tool'
        });
        
        return {
          content: [
            {
              type: 'text',
              text: `Bug context stored: ${args.file}:${args.line}:${args.column}`
            }
          ]
        };

      case 'get_bug_history':
        const filter = {};
        if (args.file) filter.file = args.file;
        if (args.userId) filter.userId = args.userId;
        
        const bugs = await getBugs(filter, args.limit || 10);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(bugs, null, 2)
            }
          ]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ]
    };
  }
});

// HTTP endpoint for Chrome extension
app.post('/api/bug', async (req, res) => {
  try {
    const { file, line, column, description, issues, dimensions, styles, elementInfo } = req.body;
    
    const bug = await storeBug({
      file,
      line,
      column,
      description: description || 'No description',
      issues: issues || [],
      dimensions: dimensions || {},
      styles: styles || {},
      elementInfo: elementInfo || {},
      source: 'chrome-extension',
      url: req.body.url || 'unknown'
    });
    
    console.log('✅ Received from Chrome extension:', bug);
    
    res.json({ 
      success: true, 
      message: 'Bug context stored successfully',
      id: bug._id || bug.id 
    });
  } catch (error) {
    console.error('Error storing bug:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get bug history
app.get('/api/bugs', async (req, res) => {
  try {
    const { file, limit = 10 } = req.query;
    
    const filter = {};
    if (file) filter.file = file;
    
    const bugs = await getBugs(filter, parseInt(limit));
    
    res.json({ success: true, bugs });
  } catch (error) {
    console.error('Error getting bugs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mcp: 'running',
    http: 'running',
    database: db ? 'mongodb' : 'in-memory',
    connected: !!db
  });
});

// Start Express server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 HTTP server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Start MCP server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🔌 MCP server running on stdio');
}

main().catch(console.error);
