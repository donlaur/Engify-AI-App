# Engify MCP Server

Model Context Protocol server for Engify - provides memory and context for AI coding assistants.

## Features

- Store and retrieve bug context from Chrome extension
- Memory layer for preventing repeat mistakes
- MCP tools for IDE integration
- MongoDB persistence
- HTTP API for Chrome extension communication

## Installation

1. Clone this repository
2. Navigate to `mcp-server` directory
3. Copy `.env.example` to `.env`
4. Update `.env` with your MongoDB connection string
5. Install dependencies: `npm install`
6. Start server: `npm start`

## Configuration

Create `.env` file:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/engify
PORT=3001
HOST=localhost
MCP_SERVER_NAME=engify-mcp-server
MCP_SERVER_VERSION=1.0.0
```

## Usage

### As MCP Server

The server runs on stdio transport for MCP clients (IDEs, AI assistants):

```bash
npm start
```

### As HTTP Server

The server also exposes HTTP endpoints for the Chrome extension:

- `POST /api/bug` - Store bug context
- `GET /api/bugs` - Get bug history
- `GET /health` - Health check

## MCP Tools

### store_bug_context

Store bug context from Chrome extension.

**Parameters:**
- `file` (string): Source file path
- `line` (number): Line number
- `column` (number): Column number
- `screenshot` (string, optional): Base64 screenshot
- `description` (string, optional): Bug description
- `url` (string, optional): Page URL
- `userId` (string, optional): User ID

### get_bug_history

Get bug history for a file or user.

**Parameters:**
- `file` (string, optional): Source file path
- `userId` (string, optional): User ID
- `limit` (number, optional): Maximum results (default: 10)

### search_similar_bugs

Search for similar bugs.

**Parameters:**
- `file` (string, optional): Source file path
- `description` (string, optional): Bug description
- `limit` (number, optional): Maximum results (default: 5)

## API Endpoints

### POST /api/bug

Store bug context from Chrome extension.

**Request:**
```json
{
  "file": "src/components/Button.tsx",
  "line": 42,
  "column": 3,
  "screenshot": "data:image/png;base64,...",
  "description": "Button text is white on white background",
  "url": "http://localhost:3000",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bug context stored successfully",
  "id": "507f1f77bcf86cd799439011"
}
```

### GET /api/bugs

Get bug history.

**Query Parameters:**
- `file` (optional): Filter by file
- `userId` (optional): Filter by user
- `limit` (optional): Maximum results (default: 10)

**Response:**
```json
{
  "success": true,
  "bugs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "file": "src/components/Button.tsx",
      "line": 42,
      "column": 3,
      "timestamp": "2025-11-08T10:30:00.000Z",
      "description": "Button text is white on white background"
    }
  ]
}
```

## Database Schema

### Bugs Collection

```javascript
{
  _id: ObjectId,
  file: String,
  line: Number,
  column: Number,
  screenshot: String,
  description: String,
  timestamp: Date,
  url: String,
  userId: String
}
```

## Development

### Running in Development

```bash
npm run dev
```

### Testing MCP Tools

Use an MCP client to test tools:

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "store_bug_context", "arguments": {"file": "test.js", "line": 1, "column": 1}}}' | npm start
```

### Testing HTTP API

```bash
# Health check
curl http://localhost:3001/health

# Store bug
curl -X POST http://localhost:3001/api/bug \
  -H "Content-Type: application/json" \
  -d '{"file": "test.js", "line": 1, "column": 1, "description": "Test bug"}'

# Get bugs
curl http://localhost:3001/api/bugs
```

## Integration with Chrome Extension

The Chrome extension sends bug context to `/api/bug`. The server stores it in MongoDB and makes it available via MCP tools for IDE integration.

## Integration with IDEs

Configure your IDE (VS Code, Cursor) to connect to this MCP server:

```json
{
  "mcpServers": {
    "engify": {
      "command": "node",
      "args": ["/path/to/mcp-server/server.js"]
    }
  }
}
```

## License

MIT
