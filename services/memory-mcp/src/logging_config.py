"""
Centralized Logging Configuration for Memory MCP Service

This module provides a unified logging configuration for the Memory MCP service.
"""

import logging
import sys
import os
from typing import Optional, Literal

# Default log format
DEFAULT_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
JSON_FORMAT = '{"timestamp":"%(asctime)s","name":"%(name)s","level":"%(levelname)s","message":"%(message)s"}'

# Store configured state
_configured = False


def configure_logging(
    level: Literal['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] = 'INFO',
    service_name: Optional[str] = None,
    json_format: bool = False
) -> None:
    """
    Configure logging for the Memory MCP service.

    Args:
        level: Logging level
        service_name: Optional service name
        json_format: If True, use JSON format for logs
    """
    global _configured

    if _configured:
        return

    log_format = JSON_FORMAT if json_format else DEFAULT_FORMAT
    log_level = getattr(logging, level.upper())

    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)]
    )

    _configured = True

    if service_name:
        logging.getLogger(__name__).info(f"Logging configured for service: {service_name}")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance.

    Args:
        name: Logger name

    Returns:
        Logger instance
    """
    if not _configured:
        configure_logging(
            level=os.getenv('LOG_LEVEL', 'INFO'),
            json_format=os.getenv('MEMORY_LOG_JSON', '').lower() in ('true', '1', 'yes')
        )

    return logging.getLogger(name)
