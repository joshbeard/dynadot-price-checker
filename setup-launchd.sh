#!/bin/bash

# Define paths
PLIST_FILE="$HOME/Library/LaunchAgents/me.joshbeard.dynadotpricechecker.plist"
NODE_PATH="/opt/homebrew/bin/node"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/check.js"
LOG_PATH="$SCRIPT_DIR/check.log"
CONFIG_PATH="$SCRIPT_DIR/config.js"

# --- Configuration Check ---
if [ ! -f "$CONFIG_PATH" ]; then
    echo "ERROR: Configuration file not found at $CONFIG_PATH"
    echo "Please copy config.sample.js to config.js and update it with your details."
    exit 1
fi
# --- End Configuration Check ---

# Create LaunchAgents directory if it doesn't exist
mkdir -p ~/Library/LaunchAgents

# Check if plist file already exists
if [ -f "$PLIST_FILE" ]; then
    echo "Existing plist file found. It will be updated."
fi

# Create or overwrite plist file
cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>me.joshbeard.dynadotpricechecker</string>
    <key>ProgramArguments</key>
    <array>
        <string>$NODE_PATH</string>
        <string>$SCRIPT_PATH</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$SCRIPT_DIR</string>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>13</integer>
        <key>Minute</key>
        <integer>00</integer>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$LOG_PATH</string>
    <key>StandardErrorPath</key>
    <string>$LOG_PATH</string>
</dict>
</plist>
EOF

# Set permissions
chmod 644 "$PLIST_FILE"

# Stop and unload any existing job (if present)
if launchctl list | grep -q me.joshbeard.dynadotpricechecker; then
    echo "Stopping and unloading existing job..."
    launchctl stop me.joshbeard.dynadotpricechecker 2>/dev/null
    launchctl unload "$PLIST_FILE" 2>/dev/null
fi

# Validate plist file
if ! plutil -lint "$PLIST_FILE" >/dev/null; then
    echo "Error: Plist file is invalid. Check syntax."
    exit 1
fi

# Load the job
launchctl load "$PLIST_FILE"

# Verify
echo "Verifying job setup..."
if launchctl list | grep -q me.joshbeard.dynadotpricechecker; then
    echo "Job successfully loaded!"
else
    echo "Failed to load job. Check plist file, paths, or permissions."
    exit 1
fi
