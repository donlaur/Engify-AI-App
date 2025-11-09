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

// Get credentials from command line arguments or environment
const args = process.argv.slice(2);
const userId = args[0] || process.env.ENGIFY_USER_ID;
const accessToken = args[1] || process.env.ENGIFY_ACCESS_TOKEN;

// Validate credentials
if (!userId || !accessToken) {
  console.error('❌ Missing credentials. Use engify-mcp-launcher.ts to start server.');
  process.exit(1);
}

console.log(`🚀 Starting Engify MCP Server for user: ${userId}`);

// Express app for Chrome extension
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection with M0-optimized settings
const mongoOptions = {
  maxPoolSize: 1, // M0: Limit connections
  minPoolSize: 0, // M0: Don't maintain pool
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  connectTimeoutMS: 5000,
  maxIdleTimeMS: 10000, // M0: Close idle connections quickly
  bufferMaxEntries: 0, // M0: Disable buffering
  bufferCommands: false, // M0: Disable command buffering
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/engify', mongoOptions)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Bug Report Schema (matches /api/bug-reports)
const BugReportSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // Multi-tenant support
  intent: { type: String, required: true }, // 'bug', 'learn', 'debug', 'design'
  description: { type: String, required: true },
  pageUrl: { type: String, required: true },
  selector: { type: String },
  elementText: { type: String },
  elementSize: { type: String },
  timestamp: { type: String },
  userAgent: { type: String },
  status: { 
    type: String, 
    enum: ['new', 'reviewed', 'sent_to_ide', 'resolved'],
    default: 'new'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const BugReport = mongoose.model('BugReport', BugReportSchema, 'bug_reports');

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

// Helper function to filter by user ID
const userFilter = { userId };

// MCP Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_new_bug_reports',
        description: 'Get new bug reports from your dashboard that need attention',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number of results (default: 10)' }
          }
        }
      },
      {
        name: 'get_bug_report_details',
        description: 'Get full details of a specific bug report by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Bug report ID', required: true }
          },
          required: ['id']
        }
      },
      {
        name: 'mark_bug_sent_to_ide',
        description: 'Mark a bug report as sent to IDE',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Bug report ID', required: true }
          },
          required: ['id']
        }
      },
      {
        name: 'search_similar_bugs',
        description: 'Search for similar bug reports using semantic search (RAG)',
        inputSchema: {
          type: 'object',
          properties: {
            description: { type: 'string', description: 'Bug description to search for', required: true },
            limit: { type: 'number', description: 'Maximum number of results (default: 5)' }
          },
          required: ['description']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_new_bug_reports':
        const reports = await BugReport.find({ 
          ...userFilter, 
          status: 'new' 
        })
          .sort({ createdAt: -1 })
          .limit(args.limit || 10);
          
        const formatted = reports.map(r => ({
          id: r._id,
          page: r.pageUrl,
          description: r.description,
          element: r.selector || 'N/A',
          elementText: r.elementText || 'N/A',
          timestamp: r.createdAt
        }));
          
        return {
          content: [
            {
              type: 'text',
              text: `Found ${formatted.length} new bug reports:\n\n` + 
                    formatted.map((r, i) => 
                      `${i + 1}. [${r.id}]\n` +
                      `   Page: ${r.page}\n` +
                      `   Issue: ${r.description}\n` +
                      `   Element: ${r.element}\n` +
                      `   Time: ${r.timestamp}\n`
                    ).join('\n')
            }
          ]
        };

      case 'get_bug_report_details':
        const report = await BugReport.findOne({ 
          ...userFilter, 
          _id: args.id 
        });
        
        if (!report) {
          throw new Error('Bug report not found or access denied');
        }

        return {
          content: [
            {
              type: 'text',
              text: `Bug Report Details:\n\n` +
                    `ID: ${report._id}\n` +
                    `Page: ${report.pageUrl}\n` +
                    `Description: ${report.description}\n` +
                    `Element: ${report.selector || 'N/A'}\n` +
                    `Element Text: ${report.elementText || 'N/A'}\n` +
                    `Status: ${report.status}\n` +
                    `Created: ${report.createdAt}\n`
            }
          ]
        };

      case 'mark_bug_sent_to_ide':
        const updateResult = await BugReport.updateOne(
          { 
            ...userFilter, 
            _id: args.id 
          },
          { 
            status: 'sent_to_ide',
            updatedAt: new Date()
          }
        );
        
        if (updateResult.matchedCount === 0) {
          throw new Error('Bug report not found or access denied');
        }

        return {
          content: [
            {
              type: 'text',
              text: `Bug report ${args.id} marked as sent to IDE`
            }
          ]
        };

      case 'search_similar_bugs':
        // For now, simple text search. Later integrate with RAG service
        const searchResults = await BugReport.find({
          ...userFilter,
          description: { $regex: args.description, $options: 'i' }
        })
          .sort({ createdAt: -1 })
          .limit(args.limit || 5);

        const searchFormatted = searchResults.map(r => ({
          id: r._id,
          description: r.description,
          page: r.pageUrl,
          status: r.status,
          createdAt: r.createdAt
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Found ${searchFormatted.length} similar bug reports:\n\n` +
                    searchFormatted.map((r, i) => 
                      `${i + 1}. [${r.id}] ${r.status}\n` +
                      `   Issue: ${r.description}\n` +
                      `   Page: ${r.page}\n` +
                      `   Time: ${r.createdAt}\n`
                    ).join('\n')
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
      ],
      isError: true
    };
  }
});

// Express routes for Chrome extension (still needed)
app.get('/api/bug-reports', async (req, res) => {
  try {
    const reports = await BugReport.find(userFilter)
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bug-reports', async (req, res) => {
  try {
    const bugReport = new BugReport({
      ...req.body,
      userId // Add user ID for multi-tenant support
    });
    await bugReport.save();
    res.status(201).json(bugReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start servers
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Start Express server for Chrome extension
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`🌐 Express server listening on port ${port}`);
  });
  
  console.error('✅ Engify MCP Server started successfully');
}

main().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
