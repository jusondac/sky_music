#!/bin/bash

echo "🔧 Setting up yt-dlp for the music bot..."

# Check if yt-dlp is installed
if command -v yt-dlp &> /dev/null; then
    echo "✅ yt-dlp is already installed"
    yt-dlp --version
else
    echo "📦 Installing yt-dlp..."
    
    # Try to install via pip
    if command -v pip3 &> /dev/null; then
        pip3 install yt-dlp
    elif command -v pip &> /dev/null; then
        pip install yt-dlp
    else
        echo "❌ pip not found. Please install yt-dlp manually:"
        echo "   sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp"
        echo "   sudo chmod a+rx /usr/local/bin/yt-dlp"
        exit 1
    fi
fi

# Check if ffmpeg is installed
if command -v ffmpeg &> /dev/null; then
    echo "✅ ffmpeg is already installed"
else
    echo "📦 Installing ffmpeg..."
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y ffmpeg
    elif command -v yum &> /dev/null; then
        sudo yum install -y ffmpeg
    elif command -v pacman &> /dev/null; then
        sudo pacman -S ffmpeg
    else
        echo "❌ Please install ffmpeg manually for your system"
        exit 1
    fi
fi

echo "✅ Setup complete! You can now run the bot with: npm start"
