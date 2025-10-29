#!/usr/bin/env python3

"""
RAG Service Starter
Simple script to start the FastAPI RAG service
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    python_dir = project_root / "python"
    
    if not python_dir.exists():
        print("Error: Python directory not found")
        sys.exit(1)
    
    # Change to python directory
    os.chdir(python_dir)
    
    # Check if required packages are installed
    try:
        import fastapi
        import sentence_transformers
        import pymongo
        print("✅ Required packages are installed")
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("Please install requirements:")
        print("pip install fastapi uvicorn sentence-transformers pymongo")
        sys.exit(1)
    
    # Set environment variables
    env = os.environ.copy()
    env['MONGODB_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/engify')
    
    # Start the FastAPI server
    print("🚀 Starting RAG service on http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("\nPress Ctrl+C to stop the service")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "api.rag:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], env=env)
    except KeyboardInterrupt:
        print("\n👋 RAG service stopped")
    except Exception as e:
        print(f"❌ Error starting RAG service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
