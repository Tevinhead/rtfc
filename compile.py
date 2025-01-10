import os
import fnmatch
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from app.core.logging import get_logger

logger = get_logger(__name__)

def collect_source_code(root_dir, output_file):
    """
    Collects source code files from a directory tree, excluding specified
    directories and file patterns, and writes the collected code to an
    output file.
    """

    # Directories to exclude - These are not relevant for most context or are too large
    exclude_dirs = {
        'node_modules',
        'dist',
        'build',
        '__pycache__',
        'venv',
        '.git',
        'public',
        'assets',
        'logs', 
    }

    # File patterns to include - Focus on core code files
    include_patterns = [
        '*.py',
        '*.tsx',
        '*.ts',
        '*.js',
        '*.jsx',
        '*.css',
        '*.scss',
        '*.html',
    ]

    # Specific files to exclude - These might contain secrets, configs, or are generally not needed for context
    exclude_files = {
        'package.json',
        'package-lock.json',
        'tsconfig.json',
        'vite.config.ts',
        'requirements.txt',
        '.env',
        '.gitignore',
        'README.md',
        'source_code_collection.txt' # Exclude the output file itself
    }

    with open(output_file, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(root_dir):
            # Remove excluded directories in-place to prevent os.walk from traversing them
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for file in files:
                if file in exclude_files:
                    continue

                # Check if file matches include patterns
                if any(fnmatch.fnmatch(file, pattern) for pattern in include_patterns):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, root_dir)

                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            # Write file header with separators
                            outfile.write(f'\n{"="*80}\n')
                            outfile.write(f'File: {relative_path}\n')
                            outfile.write(f'{"="*80}\n\n')

                            # Write file contents
                            outfile.write(infile.read())
                            outfile.write('\n\n')
                    except Exception as e:
                        error_msg = f'Error reading {relative_path}: {str(e)}'
                        logger.error("File read error", 
                                   error=str(e),
                                   file_path=relative_path)
                        outfile.write(f'{error_msg}\n\n')

if __name__ == '__main__':
    root_directory = '.'  # Parent directory
    output_file = 'source_code_collection.txt'

    logger.info("Starting source code collection",
                root_directory=root_directory,
                output_file=output_file)
    
    try:
        collect_source_code(root_directory, output_file)
        logger.info("Source code collection complete",
                   output_file=output_file)
    except Exception as e:
        logger.exception("Source code collection failed",
                        error=str(e))
        raise
