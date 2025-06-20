import url from "node:url";

import selenium from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const options = new chrome.Options();
options.addArguments("--headless");

const driver = new selenium.Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

/**
 * 
 * @param {string} target_url
 * @param {object} urlMap
 */
export default async function crawl(target_url, urlMap = {}) {

    if (urlMap[target_url] !== undefined) {
        return urlMap;
    }

    await driver.get(target_url);

    const elements = await driver.findElements(selenium.By.css("a[href]"));
    const hrefs = [];

    for (const element of elements) {
        const href = await element.getAttribute('href');
        const parsedHref = new url.URL(href);
        const parsedTarget = new url.URL(target_url);

        if (parsedHref.origin === parsedTarget.origin) {
            hrefs.push(href);
            console.log(`[ INFO ] ${target_url} -> ${href}`);
        } else {
            console.log('[ INFO ] Skipping external link:', href);
        }
    }

    urlMap[target_url] = hrefs;

    for (const href of hrefs) {
        if (urlMap[href] === undefined) {
            try {
                await crawl(href, urlMap);
            } catch (err) {
                console.error(`Failed to crawl ${href}: ${err.message}`);
            }
        }
    }

    return urlMap;
}
