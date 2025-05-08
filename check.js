const puppeteer = require('puppeteer');
const fs = require('fs');
const CONFIG = require('./config');
const DYNADOT_SEARCH_URL = 'https://www.dynadot.com/domain/search?domain=';

// Initialize Pushover if enabled
let pushover = null;
if (CONFIG.pushover.enabled) {
    const Pushover = require('node-pushover');
    pushover = new Pushover({
        token: CONFIG.pushover.token,
        user: CONFIG.pushover.user
    });
}

// Function to load previous price data
function loadPriceHistory() {
    try {
        if (fs.existsSync(CONFIG.dataPath)) {
            const data = fs.readFileSync(CONFIG.dataPath, 'utf8');
            return JSON.parse(data);
        } else {
            return { domains: {} };
        }
    } catch (error) {
        console.error('Error loading price history:', error);
        return { domains: {} };
    }
}

// Function to save price data
function savePriceHistory(data) {
    try {
        fs.writeFileSync(CONFIG.dataPath, JSON.stringify(data, null, 2));
        console.log('Price history saved successfully.');
    } catch (error) {
        console.error('Error saving price history:', error);
    }
}

// Function to check domain price on Dynadot
async function checkDomainPrice(domain) {
    console.log(`Checking price for ${domain} on Dynadot...`);

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 5000;
    let browser;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`Attempt ${attempt} for ${domain}...`);
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();

            await page.goto(`${DYNADOT_SEARCH_URL}${domain}`, {
                waitUntil: 'networkidle2',
                timeout: 60000 // Keep original timeout for each attempt
            });

            // Wait for the price element to be available
            await page.waitForSelector('.domain-price', { timeout: 30000 });

            // Extract the price
            const priceText = await page.$eval('.domain-price', el => el.textContent.trim());

            // Clean up the price string and convert to number
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

            console.log(`Current price for ${domain}: $${price}`);
            await browser.close();
            return price;

        } catch (error) {
            console.error(`Attempt ${attempt} failed for ${domain}:`, error.message);
            if (browser) {
                await browser.close().catch(e => console.error('Error closing browser during retry:', e));
            }

            // Check if it's the specific error and if retries are left
            if (error.message.includes('Navigating frame was detached') && attempt < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            } else {
                console.error(`Final error checking price for ${domain} after ${attempt} attempts:`, error);
                return null;
            }
        }
    }
    console.error(`Failed to get price for ${domain} after ${MAX_RETRIES} attempts.`);
    return null;
}

// Function to send Pushover notification
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

// Function to check a single domain and update history
async function checkAndUpdateDomain(domain, priceData) {
    // Initialize domain in data structure if it doesn't exist
    if (!priceData.domains[domain]) {
        priceData.domains[domain] = {
            priceHistory: []
        };
    }

    const currentPrice = await checkDomainPrice(domain);

    if (currentPrice === null) {
        console.error(`Failed to retrieve current price for ${domain}.`);
        await sendPushoverNotification(
            'Price Check Error',
            `Failed to check price for ${domain}.`
        );
        return false;
    }

    // Get the most recent price record if available
    const domainHistory = priceData.domains[domain].priceHistory;
    const lastRecord = domainHistory.length > 0 ? domainHistory[domainHistory.length - 1] : null;

    // Add the new price to history
    domainHistory.push({
        date: new Date().toISOString(),
        price: currentPrice
    });

    // Determine price difference and notification message
    let priceDiffMsg = 'No previous data';
    let changeDirection = '';
    let formattedDifference = '0.00';

    if (lastRecord) {
        const priceDifference = currentPrice - lastRecord.price;
        changeDirection = priceDifference > 0 ? 'increased' : (priceDifference < 0 ? 'decreased' : 'unchanged');
        formattedDifference = Math.abs(priceDifference).toFixed(2);

        if (priceDifference !== 0) {
            priceDiffMsg = `${changeDirection} by $${formattedDifference}`;
        } else {
            priceDiffMsg = 'unchanged';
        }
    }

    // Notification message
    const notificationMessage = `${domain} - $${currentPrice.toFixed(2)} - ${priceDiffMsg}`;

    // Send Pushover notification for every check
    await sendPushoverNotification(
        'Domain Price Check',
        notificationMessage
    );

    return true;
}

// Main function to run the price check
async function main() {
    console.log(`Starting Dynadot price check for ${CONFIG.domains.length} domains`);

    // Load previous price history
    const priceData = loadPriceHistory();

    // Initialize domains property if it doesn't exist
    if (!priceData.domains) {
        priceData.domains = {};
    }

    // Check each domain
    let successCount = 0;
    for (const domain of CONFIG.domains) {
        const success = await checkAndUpdateDomain(domain, priceData);
        if (success) successCount++;

        // Small delay between checks to avoid hammering the server
        if (CONFIG.domains.indexOf(domain) < CONFIG.domains.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    savePriceHistory(priceData);
}

main()
    .then(() => {
        console.log('Price check completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('An error occurred during the price check:', error);
        sendPushoverNotification('Price Check Error', `An error occurred: ${error.message}`, 1)
            .finally(() => {
                process.exit(1);
            });
    });