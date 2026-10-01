#!/usr/bin/env python
"""Simple API runner script."""
import os
import sys

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

import uvicorn

if __name__ == "__main__":
    print(f"Starting API from: {project_root}")
    print("Loading dependencies...")
    
    try:
        print("✓ Importing API module...")
        from src.api.main import app
        print("✓ API module loaded successfully!")
        
        print("✓ Starting Uvicorn server on http://0.0.0.0:8000")
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
