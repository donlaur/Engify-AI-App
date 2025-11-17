"""
Centralized Logging Configuration for AWS Lambda Functions

This module provides a unified logging configuration for Lambda handlers.
AWS Lambda automatically captures stdout/stderr to CloudWatch Logs.
"""

import logging
import sys
import os
from typing import Optional, Literal

# JSON format is preferred for CloudWatch Logs
JSON_FORMAT = '{"timestamp":"%(asctime)s","name":"%(name)s","level":"%(levelname)s","message":"%(message)s","request_id":"%(aws_request_id)s"}'
DEFAULT_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - [%(aws_request_id)s] - %(message)s'

_configured = False


def configure_lambda_logging(
    level: Literal['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] = 'INFO',
    service_name: Optional[str] = None,
    json_format: bool = True
) -> None:
    """
    Configure logging for AWS Lambda.

    Args:
        level: Logging level
        service_name: Optional service name
        json_format: If True, use JSON format (recommended for CloudWatch)
    """
    global _configured

    if _configured:
        return

    log_format = JSON_FORMAT if json_format else DEFAULT_FORMAT
    log_level = getattr(logging, level.upper())

    # Get root logger
    root = logging.getLogger()

    # Remove existing handlers if any
    if root.handlers:
        for handler in root.handlers:
            root.removeHandler(handler)

    # Set level and add handler
    root.setLevel(log_level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)

    # For Lambda, don't include aws_request_id in format if not using JSON
    # (we'll add it per-request via LoggerAdapter)
    if json_format:
        handler.setFormatter(logging.Formatter(log_format, defaults={'aws_request_id': 'N/A'}))
    else:
        handler.setFormatter(logging.Formatter(DEFAULT_FORMAT, defaults={'aws_request_id': 'N/A'}))

    root.addHandler(handler)

    _configured = True

    if service_name:
        logging.getLogger(__name__).info(f"Lambda logging configured for: {service_name}")


def get_lambda_logger(name: str, aws_request_id: Optional[str] = None) -> logging.Logger:
    """
    Get a logger instance for Lambda.

    Args:
        name: Logger name
        aws_request_id: AWS request ID from Lambda context (optional)

    Returns:
        Logger instance
    """
    if not _configured:
        configure_lambda_logging(
            level=os.getenv('LOG_LEVEL', 'INFO'),
            json_format=os.getenv('LOG_JSON', 'true').lower() in ('true', '1', 'yes')
        )

    logger = logging.getLogger(name)

    # Add request ID to logger context if provided
    if aws_request_id:
        logger = logging.LoggerAdapter(logger, {'aws_request_id': aws_request_id})

    return logger
