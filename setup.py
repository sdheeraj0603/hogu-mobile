#!/usr/bin/env python3
"""
HOG-U Setup Assistant - Interactive setup wizard
Run this to get started in 30 seconds!
"""

import os
import json
import subprocess
import sys

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def print_success(text):
    print(f"✅ {text}")

def print_error(text):
    print(f"❌ {text}")

def print_info(text):
    print(f"ℹ️  {text}")

def check_file_exists(filename):
    return os.path.exists(filename)

def main():
    print_header("🍽️ HOG-U Setup Assistant")
    print_info("This wizard will help you set up the automated meal recommendation engine\n")
    
    # Step 1: Check Python
    print_info("Checking Python version...")
    if sys.version_info < (3, 6):
        print_error("Python 3.6+ required")
        sys.exit(1)
    print_success(f"Python {sys.version.split()[0]} detected\n")
    
    # Step 2: Check dependencies
    print_info("Checking dependencies...")
    try:
        import requests
        import urllib3
        print_success("All required packages installed\n")
    except ImportError:
        print_error("Missing dependencies")
        print_info("Installing requirements...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print_success("Dependencies installed\n")
        except Exception as e:
            print_error(f"Failed to install: {e}")
            sys.exit(1)
    
    # Step 3: Check Strava credentials
    print_header("Strava Configuration")
    
    if check_file_exists("strava_token.json"):
        print_success("Token file found - you're already authenticated!\n")
    else:
        print_info("You need Strava API credentials to continue")
        print_info("Visit: https://www.strava.com/settings/api\n")
        
        input("Press ENTER after creating your API app and copying credentials...")
        
        client_id = input("\n📝 Enter your Client ID: ").strip()
        client_secret = input("📝 Enter your Client Secret: ").strip()
    
    if not client_id or not client_secret:
        print_error("Credentials cannot be empty")
        sys.exit(1)
    
    # Update the main file with credentials
    try:
        with open('hogu_strava_integration.py', 'r') as f:
            content = f.read()
        
        content = content.replace(
            'STRAVA_CLIENT_ID = "YOUR_CLIENT_ID"',
            f'STRAVA_CLIENT_ID = "{client_id}"'
        )
        content = content.replace(
            'STRAVA_CLIENT_SECRET = "YOUR_CLIENT_SECRET"',
            f'STRAVA_CLIENT_SECRET = "{client_secret}"'
        )
        
        with open('hogu_strava_integration.py', 'w') as f:
            f.write(content)
        
        print_success("Credentials saved to hogu_strava_integration.py\n")
    except Exception as e:
        print_error(f"Failed to update credentials: {e}")
        print_info("Please manually edit hogu_strava_integration.py lines 13-14")
    
    # Step 4: Choose interface
    print_header("Choose Your Interface")
    print("1️⃣  Terminal (Simple, immediate output)")
    print("2️⃣  Web Dashboard (Beautiful UI with Zomato links)")
    print("3️⃣  Both (Set up both options)\n")
    
    choice = input("Choose (1-3): ").strip()
    
    # Step 5: First run
    print_header("Initial Setup Complete! 🎉")
    
    if choice == '1':
        print_info("Starting terminal mode...")
        run_terminal_mode()
    elif choice == '2':
        print_info("Setting up web dashboard...")
        run_web_mode()
    else:
        print_info("Setting up both modes...")
        print("\n📌 Terminal mode first:")
        run_terminal_mode()
        print("\n\n📌 Web dashboard available at:")
        run_web_mode()

def run_terminal_mode():
    """Run in terminal mode"""
    print("\nFetching your activities from Strava...\n")
    try:
        from hogu_strava_integration import run_automated_hogu
        results = run_automated_hogu(prefer_local=True, limit=5)
        
        print("\n" + "="*60)
        print_success(f"Generated recommendations for {len(results)} activities!")
        print_success("Results saved to hogu_recommendations.json")
        
    except Exception as e:
        print_error(f"Failed: {e}")
        print_info("Make sure you authorized Strava access")

def run_web_mode():
    """Set up web dashboard"""
    print("\nChecking Flask installation...")
    
    try:
        import importlib
        importlib.import_module('flask')
        print_success("Flask is installed\n")
    except ImportError:
        print_info("Installing Flask...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "flask"])
            print_success("Flask installed\n")
        except Exception as e:
            print_error(f"Failed to install Flask: {e}")
            return
    
    print("="*60)
    print("🚀 Starting web dashboard...")
    print("="*60)
    print("\n📱 Open your browser to: http://localhost:5000\n")
    print("Press Ctrl+C to stop\n")
    
    try:
        from app import app
        app.run(debug=False, port=5000)
    except Exception as e:
        print_error(f"Failed to start dashboard: {e}")

def check_setup():
    """Check if setup is complete"""
    checks = {
        "hogu_strava_integration.py exists": check_file_exists("hogu_strava_integration.py"),
        "requirements.txt exists": check_file_exists("requirements.txt"),
        "Credentials configured": False
    }
    
    # Check if credentials are configured
    try:
        with open('hogu_strava_integration.py', 'r') as f:
            content = f.read()
            if 'YOUR_CLIENT_ID' not in content and 'YOUR_CLIENT_SECRET' not in content:
                checks["Credentials configured"] = True
    except:
        pass
    
    return all(checks.values())

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Setup cancelled")
    except Exception as e:
        print_error(f"Setup failed: {e}")
        print_info("See QUICKSTART.md for manual setup instructions")
