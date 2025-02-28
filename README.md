# Dynadot Domain Price Checker

A quickly generated script to check domain prices on Dynadot and send notifications via Pushover or email.

## Setup Instructions

### Option 1: Direct Node.js Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Create your configuration file:**

Copy `config.sample.js` to `config.js` and update it with your details.

```javascript
const path = require('path');

module.exports = {
    domains: ['example.com'],
    checkFrequency: 'daily',
    dataPath: path.join(__dirname, 'domain-price-history.json'),
    email: {
        enabled: false,
        from: 'your-email@gmail.com',
        to: 'recipient-email@gmail.com',
        password: 'your-app-password',
        subject: 'Domain Price Alert: '
    },
    pushover: {
        enabled: true,
        user: 'your-pushover-user-key',
        token: 'your-pushover-app-token',
        device: '',
        sound: 'pushover',
        priority: 0
    }
};
```

3. **Run the script:**

```bash
node check.js
```

### Option 2: Docker Setup

#### Using Docker Compose (Recommended)

1. **Create your configuration file:**

Copy `config.sample.js` to `config.js` and update it with your details.

2. **Run with docker-compose:**

```bash
docker-compose up
```

3. **Set up as a cron job:**

Add to your crontab (edit with `crontab -e`):

```
# Run daily at 8 AM
0 8 * * * cd /path/to/dynadot-checker && docker-compose up
```

#### Using Docker Directly

1. **Create your configuration file:**

Copy `config.sample.js` to `config.js` and update it with your details.

2. **Build the Docker image:**

```bash
docker build -t dynadot-checker .
```

3. **Run the container:**

```bash
docker run --rm -v $(pwd)/config.js:/app/config.js -v $(pwd)/domain-price-history.json:/app/domain-price-history.json dynadot-checker
```

4. **Set up as a cron job:**

Add to your crontab (edit with `crontab -e`):

```
# Run daily at 8 AM
0 8 * * * cd /path/to/dynadot-checker && docker run --rm -v $(pwd)/config.js:/app/config.js -v $(pwd)/domain-price-history.json:/app/domain-price-history.json dynadot-checker
```

## Troubleshooting

- Ensure your Pushover credentials are correct and your device is properly configured to receive notifications.
- If you're having issues with Pushover, run the test script: `node test-pushover-main.js`
