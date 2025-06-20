import assert from 'node:assert';
import path from 'node:path';
import url from 'node:url';

import express from 'express';

import { after, before, describe, it } from 'node:test';

import crawl from '../../crawler.js';

// const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

describe('Crawler test suite', function () {
    let router = null;
    let server = null;

    before(() => {
        return new Promise((resolve) => {
            router = express();

            router.get('/nolinks', function (req, res) {
                res.sendFile(path.resolve('.', 'tests', 'fixtures', 'nolinks.html'));
            });

            server = router.listen(3000, () => {
                console.log('Test server running on http://localhost:3000');
                resolve();
            });
        })
    });

    it('should return an empty url map for a page with no links', async function () {
        const urlMap = await crawl('http://localhost:3000/nolinks', {});
        assert.deepStrictEqual(urlMap, { 'http://localhost:3000/nolinks': [] });
    });

    after(function () {
        return new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    })
});
