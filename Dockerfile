FROM node:20-slim

WORKDIR /app

# Install Chromium dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci || npm install

# Copy application code
COPY . .

# Create config from sample if it doesn't exist
RUN if [ ! -f config.js ]; then cp config.sample.js config.js; fi

# Run the script
CMD ["node", "check.js"] 