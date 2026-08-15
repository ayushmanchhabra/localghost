import { equal } from 'node:assert';
import { assert } from 'node:console';
import path from 'node:path';
import process from 'node:process';
import { after, before, describe, it } from 'node:test';

import selenium from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

describe('NW.js Selenium ServiceBuilder test suite', async () => {
    let driver = undefined;

    /* Setup Selenium driver. */
    before(async function () {
        /* Initialise Chrome options */
        const options = new chrome.Options();

        const seleniumArguments = [
            'nwapp=' + path.resolve('src', 'desktop')
        ];

        /* Run in headless mode when in CI environment. */
        if (process.env.CI) {
            seleniumArguments.push('headless=new');
        }

        options.addArguments(seleniumArguments);

        const chromeDriverPath = path.resolve('cache', 'nwjs-sdk-v0.114.1-linux-x64', 'chromedriver');
        /* Pass file path of NW.js ChromeDriver to ServiceBuilder */
        const service = new chrome.ServiceBuilder(chromeDriverPath).build();

        /* Create a new session using the Chromium options and DriverService defined above. */
        driver = chrome.Driver.createSession(options, service);
    });

    /**
     * Get text via element's ID and assert it is equal.
     */
    it('Get application title', async function () {
        const title = await driver.getTitle();
        assert(title, 'Localghost');
    });

    /**
     * Quit Selenium driver.
     */
    after(() => {
        driver.quit();
    });
});
