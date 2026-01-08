# AI News Generator

## Overview
The AI News Generator automatically creates news articles based on match results, upcoming fixtures, and league updates happening in the Namibia Football Association app. It runs in the background and stores generated news in the database, which then appears in the News tab.

## Features
- ✅ Automatic news generation from match results
- ✅ **Lineup news generation when teams upload starting lineups**
- ✅ Upcoming match previews
- ✅ League update articles
- ✅ AI-powered content generation (OpenAI GPT-3.5)
- ✅ Fallback content generation (works without AI API)
- ✅ Automatic image sourcing from Unsplash
- ✅ Scheduled generation (every 6 hours by default)
- ✅ Lineup checker (every hour by default)
- ✅ Real-time generation on match completion
- ✅ Real-time generation on lineup upload

## Setup

### 1. Environment Variables
Add these to your `.env` file:

```env
# Enable/disable AI news generation
ENABLE_AI_NEWS=true

# OpenAI API Key (optional - system works without it using fallback)
OPENAI_API_KEY=your_openai_api_key_here

# Unsplash Access Key (optional - uses fallback images if not provided)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# Cron schedule for automatic generation (default: every 6 hours)
NEWS_GENERATION_SCHEDULE=0 */6 * * *

# Cron schedule for lineup checking (default: every hour)
LINEUP_CHECK_SCHEDULE=0 * * * *
```

### 2. Get API Keys (Optional)

**OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create an account or sign in
3. Create a new API key
4. Add it to your `.env` file

**Unsplash Access Key:**
1. Go to https://unsplash.com/developers
2. Create a developer account
3. Create a new application
4. Copy the Access Key
5. Add it to your `.env` file

**Note:** The system works without these keys using fallback content generation and placeholder images.

## How It Works

### Automatic Generation
1. **Scheduled Generation**: Runs every 6 hours (configurable via `NEWS_GENERATION_SCHEDULE`)
2. **Lineup Checker**: Runs every hour to detect newly uploaded lineups (configurable via `LINEUP_CHECK_SCHEDULE`)
3. **On Match Completion**: When a match status changes to "completed" via webhook
4. **On Lineup Upload**: When lineups are uploaded via webhook (`POST /api/webhooks/lineup-uploaded`)
5. **On Startup**: Generates initial news 30 seconds after server starts

### News Sources
The AI analyzes:
- **Team lineups** when uploaded for upcoming matches
- Recent match results (last 24 hours)
- Upcoming important matches (next 7 days)
- League standings and updates

### Content Generation
1. **With OpenAI**: Uses GPT-3.5 to generate professional, engaging articles
2. **Without OpenAI**: Uses intelligent templates to create news articles
3. **Images**: Fetches relevant football images from Unsplash or uses fallback images

### Database Storage
Generated news is stored in the `news` table with:
- `title`: Article headline
- `summary`: Brief summary
- `content`: Full article content
- `image_path`: Image URL
- `published_at`: Publication timestamp

## Manual Trigger

You can manually trigger news generation via API:

```bash
POST http://localhost:4000/api/ai-news/generate
```

Response:
```json
{
  "success": true,
  "message": "Generated 3 news articles",
  "articles": [
    "Team A 2-1 Team B",
    "Upcoming: Team C vs Team D",
    "League Update: Premier League"
  ]
}
```

## Configuration

### Schedule Format
Both schedules use cron syntax:

**NEWS_GENERATION_SCHEDULE:**
- `0 */6 * * *` - Every 6 hours
- `0 0 * * *` - Daily at midnight
- `0 */3 * * *` - Every 3 hours
- `0 9,15 * * *` - At 9 AM and 3 PM daily

**LINEUP_CHECK_SCHEDULE:**
- `0 * * * *` - Every hour (default)
- `*/30 * * * *` - Every 30 minutes
- `0 */2 * * *` - Every 2 hours

### Disabling AI News
Set `ENABLE_AI_NEWS=false` in your `.env` file to disable automatic generation.

## Troubleshooting

### News Not Appearing
1. Check if `ENABLE_AI_NEWS=true` in `.env`
2. Check server logs for generation errors
3. Verify database connection
4. Ensure `news` table exists in database

### API Errors
- **OpenAI errors**: System falls back to template-based generation
- **Unsplash errors**: System uses fallback placeholder images
- **Database errors**: Check database connection and table structure

### Performance
- Generation runs asynchronously to avoid blocking requests
- Duplicate prevention: Won't generate news for same match twice
- Rate limiting: Respects API rate limits automatically

## Lineup News Generation

When teams upload their starting lineups for a match:
1. The system detects lineup uploads via `player_match_stats` table
2. Generates news articles about the lineups
3. Includes key players, formations, and notable selections
4. Creates engaging articles like "Lineup Revealed: Team A vs Team B"

**Webhook Integration:**
When your PHP system uploads lineups, call:
```
POST /api/webhooks/lineup-uploaded
Headers: x-php-signature: your_secret
Body: { "matchId": 123, "teamId": 456 }
```

This triggers immediate news generation for the lineup.

## Notes
- Generated news appears automatically in the News tab
- No separate page needed - works entirely in the background
- Articles are categorized automatically (Headline/Transfer)
- Images are sourced automatically for each article
- Lineup news is generated automatically when lineups are detected

