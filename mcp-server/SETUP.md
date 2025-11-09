# Engify MCP Server Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/engify
PORT=3001
HOST=localhost
MCP_SERVER_NAME=engify-mcp-server
MCP_SERVER_VERSION=1.0.0
```

**Get your MongoDB URI from:**
- MongoDB Atlas dashboard
- Or use the same one from your main app's `.env.local`

### 3. Test the Server

```bash
npm start
```

You should see:
```
Connected to MongoDB
MCP server health endpoint: http://localhost:3001/health
Bug reports are managed via main API at engify.ai/api/bug-reports
MCP server running on stdio
```

Test health check:
```bash
curl http://localhost:3001/health
```

### 4. Configure Cursor IDE

**Option A: Global Config (Recommended)**

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "engify": {
      "command": "node",
      "args": ["/Users/donlaur/dev/Engify-AI-App/mcp-server/server.js"],
      "env": {
        "MONGODB_URI": "your_mongodb_uri_here"
      }
    }
  }
}
```

**Option B: Project Config**

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "engify": {
      "command": "node",
      "args": ["./mcp-server/server.js"],
      "env": {
        "MONGODB_URI": "${MONGODB_URI}"
      }
    }
  }
}
```

### 5. Restart Cursor

1. Quit Cursor completely
2. Reopen Cursor
3. Open Command Palette (Cmd+Shift+P)
4. Type "MCP" to see available tools

## Usage in Cursor

### Get New Bug Reports

In Cursor chat:
```
Use get_new_bug_reports to show me what bugs users reported
```

Response:
```
Found 3 new bug reports:

1. [673e5f8a1234567890abcdef]
   Page: https://www.engify.ai/prompts
   Issue: button isnt clickable, dont go anywhere
   Element: a.inline-flex.items-center...
   Time: 2025-11-09T01:42:00.000Z

2. [673e5f8b1234567890abcdef]
   Page: https://www.engify.ai/learn
   Issue: text needs to fill the full space
   Element: div.flex.items-start...
   Time: 2025-11-09T01:38:00.000Z
```

### Get Bug Details

```
Use get_bug_report_details with id "673e5f8a1234567890abcdef"
```

Response:
```
🐛 Bug Report Details

ID: 673e5f8a1234567890abcdef
Page: https://www.engify.ai/prompts
Description: button isnt clickable, dont go anywhere
Element: a.inline-flex.items-center.justify-center...
Element Text: "View Page"
Size: 118.46875x32px
User Agent: Mozilla/5.0...
Status: new
Created: 2025-11-09T01:42:00.000Z
```

### Mark as Sent to IDE

```
Use mark_bug_sent_to_ide with id "673e5f8a1234567890abcdef"
```

Response:
```
✅ Bug report 673e5f8a1234567890abcdef marked as sent to IDE
```

## Workflow

1. **User reports bug** via Chrome extension
2. **Bug saved** to MongoDB (status: 'new')
3. **In Cursor:** `get_new_bug_reports` → see all new bugs
4. **In Cursor:** `get_bug_report_details` → full context
5. **Fix the bug** in your code
6. **In Cursor:** `mark_bug_sent_to_ide` → update status

## Troubleshooting

### "Cannot connect to MongoDB"

- Check your `MONGODB_URI` in `.env`
- Make sure MongoDB Atlas allows your IP
- Test connection: `mongosh "your_mongodb_uri"`

### "MCP server not found in Cursor"

- Check `~/.cursor/mcp.json` exists
- Verify the path to `server.js` is correct
- Restart Cursor completely (Quit, not just close window)

### "No new bug reports"

- Test the extension first
- Check MongoDB has data: `db.bug_reports.find()`
- Make sure status is 'new' not 'sent_to_ide'

## Development

### Run in dev mode

```bash
npm run dev
```

### Test MCP tools manually

```bash
# Get new reports
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_new_bug_reports", "arguments": {}}}' | npm start

# Get details
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_bug_report_details", "arguments": {"id": "673e5f8a1234567890abcdef"}}}' | npm start
```

## Next Steps

1. ✅ Extension working
2. ✅ API working
3. ✅ MCP server working
4. 🔲 Dashboard page to view/manage bugs
5. 🔲 Auto-send to IDE feature

---

**Questions?** Check the main README.md or open an issue.
