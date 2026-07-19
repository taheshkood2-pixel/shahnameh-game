#!/usr/bin/env bash
# ============================================================
# Push Shahnameh game to GitHub & trigger automatic APK build
# ============================================================
# Usage:
#   1. Create a new repo on GitHub (e.g. shahnameh-game)
#   2. Run:  bash push-to-github.sh <github-username> <repo-name>
#   3. Wait ~5 min → GitHub Actions builds APK automatically
#   4. Download APK from repo's Releases page
# ============================================================

set -e

USERNAME=${1:-}
REPO=${2:-shahnameh-game}

if [ -z "$USERNAME" ]; then
  echo "Usage: bash push-to-github.sh <github-username> [repo-name]"
  echo "Example: bash push-to-github.sh myusername shahnameh-game"
  exit 1
fi

echo "🏛 Pushing Shahnameh game to https://github.com/$USERNAME/$REPO"
echo ""

# Init git if needed
if [ ! -d .git ]; then
  git init -b main
fi

# Configure git user if not set
git config user.email 2>/dev/null || git config user.email "$USERNAME@users.noreply.github.com"
git config user.name 2>/dev/null || git config user.name "$USERNAME"

# .gitignore
cat > .gitignore << 'EOF'
node_modules/
android/
www/
_site/
package*.json
capacitor.config.*
.DS_Store
*.log
EOF

# Stage & commit
git add -A
git commit -m "Shahnameh: Rise of Kings — initial release" || echo "Nothing to commit"

# Remote
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "https://github.com/$USERNAME/$REPO.git"
else
  git remote add origin "https://github.com/$USERNAME/$REPO.git"
fi

echo ""
echo "🚀 Pushing to GitHub..."
echo "   You will be prompted for your GitHub username and Personal Access Token"
echo "   (create one at: https://github.com/settings/tokens with 'repo' + 'workflow' scopes)"
echo ""

git push -u origin main --force

echo ""
echo "✅ Push successful!"
echo ""
echo "📱 What happens next (automatic):"
echo "   1. GitHub Actions builds APK (~5 min)"
echo "   2. APK appears at: https://github.com/$USERNAME/$REPO/releases"
echo "   3. Playable web version at: https://$USERNAME.github.io/$REPO/"
echo ""
echo "🔧 Don't forget:"
echo "   - Enable GitHub Pages: Settings → Pages → Source: GitHub Actions"
echo "   - Enable Actions: Settings → Actions → Allow all actions"
