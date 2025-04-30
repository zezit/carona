"""
Global logging configuration for the rides_matcher service.
This module provides a consistent logging setup across all files.
"""
import logging
import colorlog

def setup_logger(logger_name="rides_matcher"):
    """
    Configure and return a logger with colored output.
    
    Args:
        logger_name (str): Name for the logger. Default is "rides_matcher".
        
    Returns:
        logging.Logger: Configured logger instance
    """
    # Create a handler with colored output
    handler = colorlog.StreamHandler()
    handler.setFormatter(colorlog.ColoredFormatter(
        '%(asctime)s %(log_color)s%(levelname)s%(reset)s [%(module)s:%(lineno)d] %(funcName)s(): %(message)s',
        log_colors={
            'DEBUG': 'cyan',
            'INFO': 'green',
            'WARNING': 'yellow',
            'ERROR': 'red',
            'CRITICAL': 'red,bg_white',
        }
    ))
    
    # Get or create a logger with the specified name
    logger = colorlog.getLogger(logger_name)
    
    # Remove existing handlers to avoid duplicate logs
    if logger.handlers:
        logger.handlers.clear()
    
    # Add the new handler to the logger
    logger.addHandler(handler)
    
    # Set default level
    logger.setLevel(logging.INFO)
    
    # Prevent propagation to the root logger to avoid duplicate logs
    logger.propagate = False
    
    return logger