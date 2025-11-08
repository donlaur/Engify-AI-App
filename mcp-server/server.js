#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Express app for Chrome extension
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/engify')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Bug Schema
const BugSchema = new mongoose.Schema({
  file: { type: String, required: true },
  line: { type: Number, required: true },
  column: { type: Number, required: true },
  screenshot: { type: String },
  description: { type: String },
  timestamp: { type: Date, default: Date.now },
  url: { type: String },
  userId: { type: String }
});

const Bug = mongoose.model('Bug', BugSchema);

// MCP Server setup
const server = new Server(
  {
    name: process.env.MCP_SERVER_NAME || 'engify-mcp-server',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
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
            screenshot: { type: 'string', description: 'Base64 screenshot' },
            description: { type: 'string', description: 'Bug description' },
            url: { type: 'string', description: 'Page URL' },
            userId: { type: 'string', description: 'User ID' }
          },
          required: ['file', 'line', 'column']
        }
      },
      {
        name: 'get_bug_history',
        description: 'Get bug history for a file or user',
        inputSchema: {
          type: 'object',
          properties: {
            file: { type: 'string', description: 'Source file path' },
            userId: { type: 'string', description: 'User ID' },
            limit: { type: 'number', description: 'Maximum number of results' }
          }
        }
      },
      {
        name: 'search_similar_bugs',
        description: 'Search for similar bugs',
        inputSchema: {
          type: 'object',
          properties: {
            file: { type: 'string', description: 'Source file path' },
            description: { type: 'string', description: 'Bug description' },
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
        const bug = new Bug({
          file: args.file,
          line: args.line,
          column: args.column,
          screenshot: args.screenshot,
          description: args.description,
          url: args.url,
          userId: args.userId
        });
        await bug.save();
        return {
          content: [
            {
              type: 'text',
              text: `Bug context stored: ${args.file}:${args.line}:${args.column}`
            }
          ]
        };

      case 'get_bug_history':
        const query = {};
        if (args.file) query.file = args.file;
        if (args.userId) query.userId = args.userId;
        
        const bugs = await Bug.find(query)
          .sort({ timestamp: -1 })
          .limit(args.limit || 10);
          
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(bugs, null, 2)
            }
          ]
        };

      case 'search_similar_bugs':
        const searchQuery = {};
        if (args.file) {
          // Search for files with similar names
          searchQuery.file = { $regex: args.file.split('/').pop(), $options: 'i' };
        }
        if (args.description) {
          searchQuery.description = { $regex: args.description, $options: 'i' };
        }
        
        const similarBugs = await Bug.find(searchQuery)
          .sort({ timestamp: -1 })
          .limit(args.limit || 5);
          
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(similarBugs, null, 2)
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
    const { file, line, column, screenshot, description, url, userId } = req.body;
    
    const bug = new Bug({
      file,
      line,
      column,
      screenshot,
      description,
      url,
      userId: userId || 'anonymous'
    });
    
    await bug.save();
    
    res.json({ 
      success: true, 
      message: 'Bug context stored successfully',
      id: bug._id 
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
    const { file, userId, limit = 10 } = req.query;
    const query = {};
    
    if (file) query.file = file;
    if (userId) query.userId = userId;
    
    const bugs = await Bug.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
      
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
    http: 'running'
  });
});

// Start Express server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});

// Start MCP server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server running on stdio');
}

main().catch(console.error);
