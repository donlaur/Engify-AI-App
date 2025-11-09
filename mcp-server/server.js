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

// Bug Report Schema (matches /api/bug-reports)
const BugReportSchema = new mongoose.Schema({
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

// MCP Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_new_bug_reports',
        description: 'Get new bug reports from the dashboard that need attention',
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
        const reports = await BugReport.find({ status: 'new' })
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
        const report = await BugReport.findById(args.id);
        
        if (!report) {
          throw new Error('Bug report not found');
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `🐛 Bug Report Details\n\n` +
                    `ID: ${report._id}\n` +
                    `Page: ${report.pageUrl}\n` +
                    `Description: ${report.description}\n` +
                    `Element: ${report.selector || 'N/A'}\n` +
                    `Element Text: ${report.elementText || 'N/A'}\n` +
                    `Size: ${report.elementSize || 'N/A'}\n` +
                    `User Agent: ${report.userAgent || 'N/A'}\n` +
                    `Status: ${report.status}\n` +
                    `Created: ${report.createdAt}\n`
            }
          ]
        };

      case 'mark_bug_sent_to_ide':
        const updated = await BugReport.findByIdAndUpdate(
          args.id,
          { status: 'sent_to_ide', updatedAt: new Date() },
          { new: true }
        );
        
        if (!updated) {
          throw new Error('Bug report not found');
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Bug report ${args.id} marked as sent to IDE`
            }
          ]
        };

      case 'search_similar_bugs':
        // Use RAG to find similar bugs
        const ragUrl = process.env.RAG_API_URL || 'http://localhost:8000';
        const searchResponse = await fetch(`${ragUrl}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: args.description })
        });
        
        if (!searchResponse.ok) {
          throw new Error('RAG search failed');
        }
        
        const searchData = await searchResponse.json();
        const similarBugs = searchData.results || [];
        
        if (similarBugs.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No similar bugs found for: "${args.description}"`
              }
            ]
          };
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Found ${similarBugs.length} similar bug(s):\n\n` +
                    similarBugs.slice(0, args.limit || 5).map((bug, i) =>
                      `${i + 1}. [Score: ${(bug.score * 100).toFixed(1)}%]\n` +
                      `   ${bug.content}\n` +
                      `   ID: ${bug._id}\n`
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

// Health check (MCP server status)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mcp: 'running',
    message: 'MCP server is running. Use MCP tools to interact with bug reports.'
  });
});

// Start Express server (just for health check)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP server health endpoint: http://localhost:${PORT}/health`);
  console.log(`Bug reports are managed via main API at engify.ai/api/bug-reports`);
});

// Start MCP server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server running on stdio');
}

main().catch(console.error);
