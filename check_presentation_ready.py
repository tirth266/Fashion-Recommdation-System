"""
Quick Pre-Presentation Verification Script
Run this before your presentation to ensure everything works!
"""

import os
import sys
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        print(f"✅ {description}: Found")
        return True
    else:
        print(f"❌ {description}: NOT FOUND")
        print(f"   Expected at: {filepath}")
        return False

def check_directory_exists(dirpath, description):
    """Check if a directory exists"""
    if os.path.isdir(dirpath):
        file_count = len(list(Path(dirpath).glob('*')))
        print(f"✅ {description}: Found ({file_count} items)")
        return True
    else:
        print(f"❌ {description}: NOT FOUND")
        print(f"   Expected at: {dirpath}")
        return False

def main():
    print("=" * 60)
    print("🎯 FASHION RECOMMENDATION SYSTEM - PRE-PRESENTATION CHECK")
    print("=" * 60)
    print()
    
    all_good = True
    
    # Check environment files
    print("📁 Checking Environment Files...")
    all_good &= check_file_exists("d:/FY/Fashion-Recommdation-System/frontend/.env", "Frontend .env")
    all_good &= check_file_exists("d:/FY/Fashion-Recommdation-System/backend/.env", "Backend .env")
    print()
    
    # Check database
    print("💾 Checking Database...")
    all_good &= check_file_exists("d:/FY/Fashion-Recommdation-System/backend/instance/fashion.db", "SQLite Database")
    print()
    
    # Check ML models
    print("🤖 Checking ML Models...")
    all_good &= check_file_exists("d:/FY/Fashion-Recommdation-System/backend/models/embeddings.pkl", "Embeddings File")
    all_good &= check_file_exists("d:/FY/Fashion-Recommdation-System/backend/models/filenames.pkl", "Filenames File")
    print()
    
    # Check image dataset
    print("🖼️  Checking Image Dataset...")
    all_good &= check_directory_exists("d:/FY/Fashion-Recommdation-System/data/datasets/images", "Images Directory")
    print()
    
    # Check key source files
    print("📝 Checking Key Source Files...")
    all_good &= check_file_exists("d:/FY/Fashion-Recommdation-System/backend/app/main.py", "Backend Main")
    all_good &= check_file_exists("d:/FY/Fashion-Recommdation-System/frontend/src/App.jsx", "Frontend App")
    all_good &= check_file_exists("d:/FY/Fashion-Recommdation-System/backend/app/routes/auth.py", "Auth Routes")
    print()
    
    # Check if servers might be running
    print("🔌 Server Status...")
    print("   ℹ️  Check manually:")
    print("   - Backend: http://localhost:5000/api/health")
    print("   - Frontend: http://localhost:5173")
    print()
    
    # Final verdict
    print("=" * 60)
    if all_good:
        print("✅ ALL CHECKS PASSED! You're ready for the presentation!")
        print()
        print("📋 Next Steps:")
        print("   1. Start backend: cd backend && python run.py")
        print("   2. Start frontend: cd frontend && npm run dev")
        print("   3. Open http://localhost:5173")
        print("   4. Review presentation_checklist.md")
    else:
        print("⚠️  SOME CHECKS FAILED - Review the errors above")
        print()
        print("💡 Common Fixes:")
        print("   - Missing .env files: Already created, should be there")
        print("   - Missing database: Will be created when you run backend")
        print("   - Missing embeddings: Check if CNN feature extraction ran")
    print("=" * 60)
    
    return 0 if all_good else 1

if __name__ == "__main__":
    sys.exit(main())
