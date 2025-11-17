"""
Centralized Logging Configuration for Engify AI App

This module provides a unified logging configuration across all Python services
including FastAPI applications, Lambda handlers, and utility scripts.

Usage:
    from utils.logging_config import get_logger, configure_logging

    # Configure logging once at application startup
    configure_logging(level='INFO', service_name='my-service')

    # Get a logger for your module
    logger = get_logger(__name__)
    logger.info("Application started")
"""

import logging
import sys
import os
from typing import Optional, Literal

# Default log format
DEFAULT_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
JSON_FORMAT = '{"timestamp":"%(asctime)s","name":"%(name)s","level":"%(levelname)s","message":"%(message)s"}'

# Store configured state to avoid duplicate configuration
_configured = False
_service_name: Optional[str] = None


def configure_logging(
    level: Literal['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] = 'INFO',
    service_name: Optional[str] = None,
    json_format: bool = False,
    log_file: Optional[str] = None
) -> None:
    """
    Configure logging for the application.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        service_name: Optional service name to include in logs
        json_format: If True, use JSON format for logs (useful for log aggregation)
        log_file: Optional file path to write logs to (in addition to stdout)

    Example:
        configure_logging(level='INFO', service_name='rag-api')
    """
    global _configured, _service_name

    if _configured:
        logging.getLogger().warning("Logging already configured, skipping reconfiguration")
        return

    _service_name = service_name
    log_format = JSON_FORMAT if json_format else DEFAULT_FORMAT
    log_level = getattr(logging, level.upper())

    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)]
    )

    # Add file handler if specified
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(log_level)
        file_handler.setFormatter(logging.Formatter(log_format))
        logging.getLogger().addHandler(file_handler)

    _configured = True

    # Log initial message
    if service_name:
        logging.getLogger(__name__).info(f"Logging configured for service: {service_name}")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.

    Args:
        name: Logger name (typically __name__ of the calling module)

    Returns:
        Logger instance configured with centralized settings

    Example:
        logger = get_logger(__name__)
        logger.info("Processing request")
    """
    # Auto-configure with defaults if not yet configured
    if not _configured:
        configure_logging(
            level=os.getenv('LOG_LEVEL', 'INFO'),
            json_format=os.getenv('LOG_JSON', '').lower() in ('true', '1', 'yes')
        )

    logger = logging.getLogger(name)

    # Add service name to logger if configured
    if _service_name:
        logger = logging.LoggerAdapter(logger, {'service': _service_name})

    return logger


def reset_logging() -> None:
    """
    Reset logging configuration state.
    Used primarily for testing to allow reconfiguration.
    """
    global _configured, _service_name
    _configured = False
    _service_name = None

    # Remove all handlers from root logger
    root = logging.getLogger()
    for handler in root.handlers[:]:
        root.removeHandler(handler)


# Environment-based auto-configuration for common services
def configure_for_fastapi(service_name: str = "fastapi-app") -> None:
    """Configure logging optimized for FastAPI applications."""
    configure_logging(
        level=os.getenv('LOG_LEVEL', 'INFO'),
        service_name=service_name,
        json_format=os.getenv('LOG_JSON', '').lower() in ('true', '1', 'yes')
    )


def configure_for_lambda(service_name: str = "lambda-function") -> None:
    """Configure logging optimized for AWS Lambda."""
    # Lambda uses CloudWatch, so JSON format is preferred
    configure_logging(
        level=os.getenv('LOG_LEVEL', 'INFO'),
        service_name=service_name,
        json_format=True
    )


def configure_for_cli(service_name: str = "cli-tool") -> None:
    """Configure logging optimized for CLI tools."""
    configure_logging(
        level=os.getenv('LOG_LEVEL', 'INFO'),
        service_name=service_name,
        json_format=False
    )
