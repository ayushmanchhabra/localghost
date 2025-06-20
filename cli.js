import { program } from 'commander';
import crawl from './crawler.js';

program
  .argument('<url>', 'Target URL')
  .option('-m, --mode <string>', 'Choose between crawl and crawl.', 'crawl');

program.parse();

const options = program.opts();
const targetUrl = program.args[0];

if (options.mode === 'crawl') {
  console.log(`${targetUrl} - crawl mode selected`);

  try {
    const urls = await crawl(targetUrl);
    console.log('Crawled URLs:\n', JSON.stringify(urls, null, 2));
  } catch (error) {
    console.error('Crawl failed:', error);
  }
}
