#!/bin/bash

# Voting System - Quick Deploy Script
# This script helps you push to GitHub and provides Vercel deployment instructions

echo "🚀 Voting System Deployment Helper"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the voting-system directory"
    exit 1
fi

echo "✅ Current directory: $(pwd)"
echo ""

# Check git status
echo "📊 Git Status:"
git status --short
echo ""

# Check if remote is set
if git remote get-url origin &>/dev/null; then
    echo "✅ Git remote configured:"
    git remote get-url origin
    echo ""
    
    echo "📤 To push to GitHub, run one of these:"
    echo ""
    echo "Option 1: If you have GitHub CLI installed:"
    echo "  gh auth login"
    echo "  git push -u origin main"
    echo ""
    echo "Option 2: Use GitHub Desktop or authenticate manually"
    echo ""
    echo "Option 3: Set up SSH key or Personal Access Token"
    echo ""
else
    echo "⚠️  Git remote not configured"
    echo "Run: git remote add origin https://github.com/icmohioelections-gif/voting-system.git"
fi

echo ""
echo "🔐 Environment Variables Status:"
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    if grep -q "SUPABASE_SERVICE_ROLE_KEY=eyJ" .env.local; then
        echo "✅ Supabase Service Role Key configured"
    else
        echo "⚠️  Supabase Service Role Key needs to be set"
    fi
else
    echo "⚠️  .env.local not found"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Push code to GitHub (see options above)"
echo "2. Go to: https://vercel.com/new"
echo "3. Import your GitHub repository"
echo "4. Add environment variables from .env.local"
echo "5. Deploy!"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - PUSH_AND_DEPLOY.md"
echo "   - DEPLOYMENT.md"
echo ""

