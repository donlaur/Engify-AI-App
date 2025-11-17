#!/usr/bin/env python3

"""
RAG Service Starter
Simple script to start the FastAPI RAG service
"""

import os
import sys
import subprocess
from pathlib import Path

# Add parent directory to path to import utils
sys.path.insert(0, str(Path(__file__).parent.parent / "python"))
from utils.logging_config import get_logger, configure_for_cli

# Configure logging for CLI
configure_for_cli(service_name="rag-service-starter")
logger = get_logger(__name__)

def main():
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    python_dir = project_root / "python"

    if not python_dir.exists():
        logger.error("Error: Python directory not found")
        sys.exit(1)
    
    # Change to python directory
    os.chdir(python_dir)
    
    # Check if required packages are installed
    try:
        import fastapi
        import sentence_transformers
        import pymongo
        logger.info("✅ Required packages are installed")
    except ImportError as e:
        logger.error(f"❌ Missing required package: {e}")
        logger.info("Please install requirements:")
        logger.info("pip install fastapi uvicorn sentence-transformers pymongo")
        sys.exit(1)
    
    # Set environment variables
    env = os.environ.copy()
    env['MONGODB_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/engify')

    # Start the FastAPI server
    logger.info("🚀 Starting RAG service on http://localhost:8000")
    logger.info("📚 API Documentation: http://localhost:8000/docs")
    logger.info("🔍 Health Check: http://localhost:8000/health")
    logger.info("\nPress Ctrl+C to stop the service")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "api.rag:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ], env=env)
    except KeyboardInterrupt:
        logger.info("\n👋 RAG service stopped")
    except Exception as e:
        logger.error(f"❌ Error starting RAG service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
