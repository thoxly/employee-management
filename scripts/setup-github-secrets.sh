#!/bin/bash

# Скрипт для настройки GitHub Secrets
# Использование: ./scripts/setup-github-secrets.sh

set -e

echo "🔧 Setting up GitHub Secrets for CI/CD..."

# Проверяем наличие gh CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Please install it first: https://cli.github.com/"
    exit 1
fi

# Проверяем авторизацию
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "Please run: gh auth login"
    exit 1
fi

echo "📋 Setting up required secrets..."

# SSH Private Key
echo "🔑 Setting SSH_PRIVATE_KEY..."
if [ -f ~/.ssh/id_rsa_server ]; then
    gh secret set SSH_PRIVATE_KEY < ~/.ssh/id_rsa_server
    echo "✅ SSH_PRIVATE_KEY set"
else
    echo "⚠️ SSH key not found at ~/.ssh/id_rsa_server"
    echo "Please create it first: ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_server"
fi

# Telegram Bot Token
echo "🤖 Setting TELEGRAM_BOT_TOKEN..."
read -p "Enter your Telegram bot token: " TELEGRAM_BOT_TOKEN
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
    echo "$TELEGRAM_BOT_TOKEN" | gh secret set TELEGRAM_BOT_TOKEN
    echo "✅ TELEGRAM_BOT_TOKEN set"
else
    echo "⚠️ TELEGRAM_BOT_TOKEN not provided"
fi

# Telegram Chat ID
echo "💬 Setting TELEGRAM_CHAT_ID..."
read -p "Enter your Telegram chat ID: " TELEGRAM_CHAT_ID
if [ -n "$TELEGRAM_CHAT_ID" ]; then
    echo "$TELEGRAM_CHAT_ID" | gh secret set TELEGRAM_CHAT_ID
    echo "✅ TELEGRAM_CHAT_ID set"
else
    echo "⚠️ TELEGRAM_CHAT_ID not provided"
fi

# Проверяем существующие секреты
echo "🔍 Current secrets:"
gh secret list

echo "✅ GitHub Secrets setup completed!"
echo ""
echo "📋 Required secrets for CI/CD:"
echo "   - SSH_PRIVATE_KEY: SSH key for server access"
echo "   - TELEGRAM_BOT_TOKEN: Bot token for notifications"
echo "   - TELEGRAM_CHAT_ID: Chat ID for notifications"
echo ""
echo "🌐 Next steps:"
echo "   1. Push to dev branch to trigger development deployment"
echo "   2. Push to staging branch to trigger staging deployment"
echo "   3. Push to main branch to trigger production deployment" 