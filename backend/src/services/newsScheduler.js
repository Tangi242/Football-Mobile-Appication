import cron from 'node-cron';
import { generateNewsFromEvents, generateLineupNews } from './aiNewsService.js';

// Run news generation every 6 hours (also checks for lineups every hour)
const NEWS_GENERATION_SCHEDULE = process.env.NEWS_GENERATION_SCHEDULE || '0 */6 * * *';
const LINEUP_CHECK_SCHEDULE = process.env.LINEUP_CHECK_SCHEDULE || '0 * * * *'; // Every hour

let scheduler = null;
let lineupScheduler = null;

export const startNewsScheduler = () => {
  if (scheduler) {
    console.log('News scheduler already running');
    return;
  }

  console.log(`Starting AI News Generator (Schedule: ${NEWS_GENERATION_SCHEDULE})`);

  scheduler = cron.schedule(NEWS_GENERATION_SCHEDULE, async () => {
    console.log('AI News Generator: Starting automatic news generation...');
    try {
      const result = await generateNewsFromEvents();
      if (result.success) {
        console.log(`AI News Generator: Successfully generated ${result.count} articles`);
      } else {
        console.error(`AI News Generator: Failed - ${result.error}`);
      }
    } catch (error) {
      console.error('AI News Generator: Error -', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'Africa/Windhoek'
  });

  // Lineup checker - runs more frequently to catch lineup uploads
  console.log(`Starting Lineup News Checker (Schedule: ${LINEUP_CHECK_SCHEDULE})`);
  
  lineupScheduler = cron.schedule(LINEUP_CHECK_SCHEDULE, async () => {
    console.log('Lineup Checker: Checking for new lineup uploads...');
    try {
      const lineupNews = await generateLineupNews();
      if (lineupNews.length > 0) {
        console.log(`Lineup Checker: Generated ${lineupNews.length} lineup news articles`);
      }
    } catch (error) {
      console.error('Lineup Checker: Error -', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'Africa/Windhoek'
  });

  // Also run immediately on startup (after 30 seconds delay to let server initialize)
  setTimeout(async () => {
    console.log('AI News Generator: Running initial news generation...');
    try {
      const result = await generateNewsFromEvents();
      if (result.success) {
        console.log(`AI News Generator: Initial generation completed - ${result.count} articles`);
      }
    } catch (error) {
      console.error('AI News Generator: Initial generation error -', error.message);
    }
  }, 30000); // 30 seconds delay

  return { scheduler, lineupScheduler };
};

export const stopNewsScheduler = () => {
  if (scheduler) {
    scheduler.stop();
    scheduler = null;
    console.log('News scheduler stopped');
  }
  if (lineupScheduler) {
    lineupScheduler.stop();
    lineupScheduler = null;
    console.log('Lineup scheduler stopped');
  }
};

