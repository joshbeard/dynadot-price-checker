# Dynadot Domain Price Checker

This simple tool checks domain prices on Dynadot and can send notifications via [Pushover](https://pushover.net).

## Setup and Usage (Local Node.js - Recommended)

Follow these steps to get the checker running on your local machine:

1.  **Clone the Repository:**
    ```shell
    git clone https://github.com/joshbeard/dynadot-price-checker.git
    cd dynadot-price-checker
    ```

2.  **Create Your Configuration:**
    Copy the sample configuration file, then edit `config.js` with your specific details (domains, API keys, notification preferences).
    ```shell
    cp config.sample.js config.js
    nvim config.js
    ```

3.  **Install Dependencies:**
    ```shell
    npm install
    ```

4.  **Run the Checker Manually:**
    To perform a one-time check:
    ```shell
    node check.js
    ```

## Automated Scheduling (macOS with launchd)

For macOS users, the `setup-launchd.sh` script configures the local Node.js application to run automatically.

1.  **Prerequisites:**
    *   Complete steps 1-3 from the "Setup and Usage (Local Node.js)" section.

2.  **Configure and Run the Setup Script:**
    *   Open `setup-launchd.sh` in a text editor.
    *   **Important:**
        *   Verify the `NODE_PATH` variable correctly points to your Node.js executable (e.g., `/opt/homebrew/bin/node`). Find your Node path by running `which node`.
        *   Adjust the `StartCalendarInterval` (Hour and Minute values) if you wish to change the default schedule (13:00 / 1 PM).
    *   Make the script executable and run it from the project directory:
        ```shell
        bash ./setup-launchd.sh
        ```
    This will set up a LaunchAgent to run `node check.js` according to the schedule you've set. Logs will be saved to `check.log` in the project directory.

## Alternative Setup (Docker)

If you prefer a containerized environment:

1.  **Prerequisites:**
    * Docker and Docker Compose installed.
    * Complete steps 1 and 2 from the "Setup and Usage (Local Node.js)" section.

2.  **Build and Run with Docker Compose:**
    *   To build the image and run the checker (foreground):
        ```shell
        docker-compose up --build
        ```
    *   To run in detached (background) mode:
        ```shell
        docker-compose up --build -d
        ```
    *   To stop the service:
        ```shell
        docker-compose down
        ```
    The `domain-price-history.json` file will also be persisted in your project directory.

3.  **Scheduling Docker with Cron:**
    Set up a cron job to run the Docker container. Edit your crontab (`crontab -e`):
    ```cron
    # Example: Run daily at 8 AM
    0 8 * * * cd /path/to/your/dynadot-price-checker && docker-compose up
    ```
    Replace `/path/to/your/dynadot-price-checker` with the absolute path to where you cloned the project.
