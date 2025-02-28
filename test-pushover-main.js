// Test script for Pushover notifications using the main script's implementation
const CONFIG = require('./config');
const Pushover = require('node-pushover');

// Initialize Pushover
const pushover = new Pushover({
    token: CONFIG.pushover.token,
    user: CONFIG.pushover.user
});

// Function to send Pushover notification (same as in check.js)
async function sendPushoverNotification(title, message, priority = CONFIG.pushover.priority) {
    if (!CONFIG.pushover.enabled || !pushover) {
        console.log('Pushover notifications are disabled or not initialized.');
        return;
    }

    console.log('Sending Pushover notification with:', { title, message, priority });

    return new Promise((resolve, reject) => {
        pushover.send(title, message, (err, res) => {
            if (err) {
                console.error('Error sending Pushover notification:', err);
                reject(err);
            } else {
                console.log(`Pushover notification sent successfully: ${title}`, res);
                resolve(res);
            }
        });
    });
}

// Send a test notification
async function main() {
    try {
        console.log('Sending test notification...');
        await sendPushoverNotification(
            'Test from Main Script Implementation',
            'This is a test notification using the same implementation as the main script.'
        );
        console.log('Test completed.');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

main(); 