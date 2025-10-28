# Workbench Setup Guide

**Setting up the Python AI Workbench for local development**

## Prerequisites

- Python 3.9+ installed
- Node.js 18+ and pnpm installed
- API keys for AI providers (OpenAI, Anthropic, Google, Groq)

## Quick Start

### 1. Python Environment Setup

```bash
# Navigate to python directory
cd python

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Create `.env.local` in the project root:

```bash
# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Python Configuration
PYTHON_PATH=./python/venv/bin/python
VENV_PATH=./python/venv

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Verify Installation

```bash
# Test Python environment
python --version
pip list

# Test AI execution (requires API key)
python api/ai_execute.py --help

# Test Next.js integration
cd ..
npm run dev
```

## Detailed Setup

### Python Dependencies

The workbench uses these key Python packages:

```txt
# Core AI Libraries
openai>=1.0.0          # OpenAI API client
anthropic>=0.7.0        # Anthropic Claude API
google-generativeai>=0.3.0  # Google Gemini API
groq>=0.4.0            # Groq API client

# Vector Database & ML
chromadb>=0.4.0        # Vector database for RAG
numpy>=1.24.0          # Numerical computing
pandas>=2.0.0          # Data manipulation

# Development & Testing
pytest>=7.0.0          # Testing framework
pytest-asyncio>=0.21.0 # Async testing support
black>=23.0.0          # Code formatting
flake8>=6.0.0          # Linting
```

### API Key Setup

#### OpenAI

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Add to `.env.local` as `OPENAI_API_KEY`

#### Anthropic (Claude)

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Generate API key
3. Add to `.env.local` as `ANTHROPIC_API_KEY`

#### Google (Gemini)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env.local` as `GOOGLE_API_KEY`

#### Groq

1. Visit [Groq Console](https://console.groq.com/keys)
2. Generate API key
3. Add to `.env.local` as `GROQ_API_KEY`

### Vercel Functions Integration

The Python utilities integrate with Next.js through Vercel Functions:

```typescript
// pages/api/ai/workbench/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { operation, data } = await request.json();

    // Validate operation
    const validOperations = ['ai_execute', 'embeddings', 'rag'];
    if (!validOperations.includes(operation)) {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    // Execute Python utility
    const pythonPath = process.env.PYTHON_PATH || 'python';
    const scriptPath = path.join(
      process.cwd(),
      'python',
      'api',
      `${operation}.py`
    );

    const pythonProcess = spawn(pythonPath, [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    // Send data to Python process
    pythonProcess.stdin.write(JSON.stringify(data));
    pythonProcess.stdin.end();

    // Collect response
    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    // Wait for completion
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(error));
        }
      });
    });

    return NextResponse.json(JSON.parse(output));
  } catch (error) {
    console.error('Workbench error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Development Workflow

### Running Python Utilities

```bash
# Activate virtual environment
cd python
source venv/bin/activate

# Test AI execution
python api/ai_execute.py --prompt "Hello world" --model gpt-3.5-turbo

# Test with different providers
python api/ai_execute.py --prompt "Explain AI" --provider anthropic --model claude-3-sonnet

# Test embeddings (when implemented)
python api/embeddings.py --text "Sample text for embedding"

# Test RAG system (when implemented)
python api/rag.py --query "What is machine learning?" --top-k 5
```

### Testing Integration

```bash
# Start Next.js development server
npm run dev

# Test workbench API endpoint
curl -X POST http://localhost:3000/api/ai/workbench \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "ai_execute",
    "data": {
      "prompt": "Hello from the workbench!",
      "provider": "openai",
      "model": "gpt-3.5-turbo"
    }
  }'
```

### Running Tests

```bash
# Run Python tests
cd python
pytest tests/ -v

# Run specific test file
pytest tests/test_ai_execute.py -v

# Run with coverage
pytest tests/ --cov=api --cov-report=html
```

## Troubleshooting

### Common Issues

#### Python Environment Issues

```bash
# If virtual environment not found
python -m venv venv --clear

# If packages not installing
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

#### API Key Issues

```bash
# Verify API keys are loaded
python -c "import os; print('OPENAI_KEY:', bool(os.getenv('OPENAI_API_KEY')))"

# Test API key validity
python api/ai_execute.py --test-keys
```

#### Integration Issues

```bash
# Check Python path in Next.js
node -e "console.log(process.env.PYTHON_PATH)"

# Test Python process spawning
node -e "
const { spawn } = require('child_process');
const proc = spawn('python', ['--version']);
proc.stdout.on('data', (data) => console.log(data.toString()));
"
```

### Performance Optimization

#### Memory Management

```python
# In Python utilities
import gc
import psutil

def monitor_memory():
    """Monitor memory usage during operations"""
    process = psutil.Process()
    memory_info = process.memory_info()
    print(f"Memory usage: {memory_info.rss / 1024 / 1024:.2f} MB")

    # Force garbage collection
    gc.collect()
```

#### Connection Pooling

```python
# Reuse HTTP connections
import httpx

class AIExecutor:
    def __init__(self, api_key: str):
        self.client = httpx.AsyncClient(
            timeout=30.0,
            limits=httpx.Limits(max_keepalive_connections=5)
        )

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
```

## Production Deployment

### Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "pages/api/ai/workbench/route.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  },
  "env": {
    "PYTHON_PATH": "/opt/python/bin/python3",
    "VENV_PATH": "/opt/python"
  }
}
```

### Docker Setup (Optional)

```dockerfile
# Dockerfile.python
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python utilities
COPY python/ .

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Default command
CMD ["python", "api/ai_execute.py", "--help"]
```

## Security Considerations

### API Key Security

- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate keys regularly
- Monitor usage patterns

### Input Validation

```python
import re
from typing import Any, Dict

def validate_prompt(prompt: str) -> bool:
    """Validate prompt input"""
    if not prompt or len(prompt.strip()) == 0:
        return False

    if len(prompt) > 10000:  # Reasonable limit
        return False

    # Check for potentially malicious content
    dangerous_patterns = [
        r'<script.*?>',
        r'javascript:',
        r'data:text/html'
    ]

    for pattern in dangerous_patterns:
        if re.search(pattern, prompt, re.IGNORECASE):
            return False

    return True
```

### Error Handling

```python
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def safe_execute(func, *args, **kwargs) -> Dict[str, Any]:
    """Safely execute function with error handling"""
    try:
        result = func(*args, **kwargs)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error in {func.__name__}: {str(e)}")
        return {
            "success": False,
            "error": "Internal error occurred",
            "error_code": "INTERNAL_ERROR"
        }
```

---

**This setup guide demonstrates professional development practices for AI/ML integration and showcases expertise in building production-ready systems.**
