#!/usr/bin/env node

/**
 * Engify MCP Server - Working Example
 * 
 * This demonstrates how the MCP server works with bug reports.
 * Run: node example.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Same schema as server.js
const BugReportSchema = new mongoose.Schema({
  intent: { type: String, required: true },
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

async function main() {
  console.log('🚀 Engify MCP Server - Working Example\n');

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/engify');
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }

  // Example 1: Get new bug reports (simulates get_new_bug_reports tool)
  console.log('📋 Example 1: Get New Bug Reports');
  console.log('─'.repeat(50));
  
  try {
    const reports = await BugReport.find({ status: 'new' })
      .sort({ createdAt: -1 })
      .limit(5);
    
    if (reports.length === 0) {
      console.log('No new bug reports found.');
      console.log('💡 Tip: Use the Chrome extension to report a bug first!\n');
    } else {
      console.log(`Found ${reports.length} new bug report(s):\n`);
      
      reports.forEach((report, i) => {
        console.log(`${i + 1}. Bug Report [${report._id}]`);
        console.log(`   Page: ${report.pageUrl}`);
        console.log(`   Issue: ${report.description}`);
        console.log(`   Element: ${report.selector || 'N/A'}`);
        console.log(`   Created: ${report.createdAt.toISOString()}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Example 2: Get bug report details (simulates get_bug_report_details tool)
  console.log('📋 Example 2: Get Bug Report Details');
  console.log('─'.repeat(50));
  
  try {
    const firstReport = await BugReport.findOne({ status: 'new' });
    
    if (!firstReport) {
      console.log('No bug reports to show details for.\n');
    } else {
      console.log('🐛 Bug Report Details:\n');
      console.log(`ID: ${firstReport._id}`);
      console.log(`Page: ${firstReport.pageUrl}`);
      console.log(`Description: ${firstReport.description}`);
      console.log(`Element: ${firstReport.selector || 'N/A'}`);
      console.log(`Element Text: ${firstReport.elementText || 'N/A'}`);
      console.log(`Size: ${firstReport.elementSize || 'N/A'}`);
      console.log(`Status: ${firstReport.status}`);
      console.log(`Created: ${firstReport.createdAt.toISOString()}`);
      console.log('');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Example 3: Mark bug as sent to IDE (simulates mark_bug_sent_to_ide tool)
  console.log('📋 Example 3: Mark Bug as Sent to IDE');
  console.log('─'.repeat(50));
  
  try {
    const bugToUpdate = await BugReport.findOne({ status: 'new' });
    
    if (!bugToUpdate) {
      console.log('No new bugs to mark as sent.\n');
    } else {
      console.log(`Marking bug ${bugToUpdate._id} as sent to IDE...`);
      
      bugToUpdate.status = 'sent_to_ide';
      bugToUpdate.updatedAt = new Date();
      await bugToUpdate.save();
      
      console.log('✅ Bug marked as sent to IDE');
      console.log(`Status changed: new → sent_to_ide\n`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Summary
  console.log('📊 Summary');
  console.log('─'.repeat(50));
  
  try {
    const statusCounts = await BugReport.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('Bug Reports by Status:');
    statusCounts.forEach(({ _id, count }) => {
      console.log(`  ${_id}: ${count}`);
    });
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Close connection
  await mongoose.connection.close();
  console.log('✅ Example complete!\n');
  console.log('💡 Next steps:');
  console.log('   1. Configure Cursor with mcp.json (see SETUP.md)');
  console.log('   2. Use MCP tools in Cursor to interact with bug reports');
  console.log('   3. Run: npm start (to start the MCP server)');
}

main().catch(console.error);
