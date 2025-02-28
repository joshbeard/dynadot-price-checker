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