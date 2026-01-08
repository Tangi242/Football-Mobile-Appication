# NFA Mobile App - Project Structure

## Overview
This project is organized by user roles (Fan, Admin, Referee, Coach) to support multi-role functionality. Currently, only the Fan role is fully implemented.

## Directory Structure

```
NFA/
├── App.js                          # Root app component with navigation
├── package.json                    # Dependencies
├── database/                       # Database migration files
│   └── migration.sql              # Main database migration script
│
├── backend/                        # Node.js/Express API server
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── index.js                # Server entry point
│   │   ├── config/
│   │   │   └── db.js              # MySQL database configuration
│   │   ├── routes/                 # API routes (to be organized by role)
│   │   │   ├── fixtures.js
│   │   │   ├── results.js
│   │   │   ├── announcements.js
│   │   │   ├── users.js
│   │   │   ├── webhooks.js
│   │   │   └── aiNews.js
│   │   └── services/              # Business logic
│   │       ├── aiNewsService.js
│   │       ├── dataService.js
│   │       └── newsScheduler.js
│   └── package.json
│
└── src/                            # React Native mobile app
    ├── api/                        # API client & socket
    │   ├── client.js
    │   └── socket.js
    │
    ├── screens/                    # Screen components organized by role
    │   ├── fan/                    # Fan-specific screens
    │   │   ├── NewsScreen.js
    │   │   ├── NewsDetailScreen.js
    │   │   ├── MatchesScreen.js
    │   │   ├── MatchDetailsScreen.js
    │   │   ├── StatsScreen.js
    │   │   ├── TicketsScreen.js
    │   │   ├── TicketCheckoutScreen.js
    │   │   ├── TicketViewScreen.js
    │   │   ├── MyTicketsScreen.js
    │   │   ├── MerchandiseScreen.js
    │   │   ├── CartScreen.js
    │   │   ├── FanEngagementScreen.js
    │   │   ├── VenueScreen.js
    │   │   ├── NationalTeamsScreen.js
    │   │   ├── TeamListScreen.js
    │   │   ├── TeamProfileScreen.js
    │   │   └── PlayerDetailScreen.js
    │   │
    │   ├── admin/                  # Admin screens (to be implemented)
    │   ├── referee/                # Referee screens (to be implemented)
    │   ├── coach/                  # Coach screens (to be implemented)
    │   └── shared/                  # Shared screens (auth, settings, etc.)
    │       ├── AuthScreen.js
    │       ├── LoginScreen.js
    │       ├── SignUpScreen.js
    │       ├── SettingsScreen.js
    │       ├── ProfileScreen.js
    │       ├── OfflineScreen.js
    │       ├── DashboardScreen.js
    │       ├── AlertsScreen.js
    │       ├── AnalyticsScreen.js
    │       └── PeopleScreen.js
    │
    ├── components/                 # Reusable components organized by category
    │   ├── common/                  # Common/shared components
    │   │   ├── LeagueTable.js
    │   │   ├── LeagueDropdown.js
    │   │   ├── LeagueFilter.js
    │   │   ├── LeagueDrawer.js
    │   │   ├── FilterDrawer.js
    │   │   ├── SeasonDropdown.js
    │   │   ├── Leaderboards.js
    │   │   ├── LeaderList.js
    │   │   ├── StandingsPanel.js
    │   │   ├── Poll.js
    │   │   ├── Quiz.js
    │   │   ├── ScoutingFilters.js
    │   │   ├── MediaGallery.js
    │   │   └── VideoHighlights.js
    │   │
    │   ├── match/                  # Match-related components
    │   │   ├── MatchCard.js
    │   │   ├── MatchCardDetailed.js
    │   │   ├── MatchCenter.js
    │   │   ├── MatchHero.js
    │   │   ├── MatchListCard.js
    │   │   ├── MatchPrediction.js
    │   │   └── MatchPreview.js
    │   │
    │   ├── news/                   # News-related components
    │   │   ├── NewsArticleCard.js
    │   │   └── AnnouncementCard.js
    │   │
    │   ├── ticket/                 # Ticket-related components (if any)
    │   │
    │   └── ui/                     # UI/utility components
    │       ├── LoadingButton.js
    │       ├── LoadingSkeleton.js
    │       ├── Toast.js
    │       ├── EmptyState.js
    │       ├── ScreenWrapper.js
    │       ├── SearchBar.js
    │       ├── MenuButton.js
    │       ├── DrawerPanel.js
    │       ├── ChipTabs.js
    │       ├── SectionHeader.js
    │       ├── SegmentedControl.js
    │       └── StatPill.js
    │
    ├── context/                    # React Context providers
    │   ├── AuthContext.js
    │   ├── CartContext.js
    │   ├── DataContext.js
    │   ├── DrawerContext.js
    │   ├── FilterDrawerContext.js
    │   ├── LanguageContext.js
    │   ├── LeagueDrawerContext.js
    │   ├── NavigationContext.js
    │   └── ThemeContext.js
    │
    ├── database/                   # Local database (SQLite)
    │   └── ticketDatabase.js
    │
    ├── hooks/                      # Custom React hooks
    │   ├── useCountdown.js
    │   ├── useNotifications.js
    │   └── useToast.js
    │
    ├── services/                   # Service modules
    │   └── notificationService.js
    │
    ├── theme/                      # Theme & design system
    │   ├── colors.js
    │   └── designSystem.js
    │
    ├── utils/                      # Utility functions
    │   ├── accessibility.js
    │   ├── flags.js
    │   ├── notifications.js
    │   └── share.js
    │
    ├── assets/                     # Static assets
    │   ├── onlineImages.js
    │   └── placeholders.js
    │
    ├── config/                     # Configuration
    │   └── constants.js
    │
    ├── constants/                  # Constants
    │   └── media.js
    │
    ├── i18n/                       # Internationalization
    │   └── locales.js
    │
    └── lib/                        # Libraries
        └── dayjs.js
```

## User Roles

### Fan (Implemented)
- View news, matches, stats
- Purchase tickets
- Buy merchandise
- View teams and players
- Fan engagement (polls, quizzes, predictions)

### Admin (Implemented in Database)
- Manage users, teams, leagues
- Manage matches and results
- Manage news and announcements
- System configuration

### Referee (Implemented in Database)
- Manage match events
- View assigned matches
- Submit match reports

### Coach (Implemented in Database)
- Manage team squad
- View team statistics
- Submit team lineups
- Manage player information

### Journalist (Implemented in Database)
- Create and publish news articles
- Manage announcements
- Access press releases
- Submit match reports

### Club Manager (Implemented in Database)
- Manage club information
- Manage team rosters
- View club statistics
- Manage club finances
- Record match results
- Submit match reports

### Coach (To be implemented)
- Manage team lineups
- View team statistics
- Manage player information

## Notes

- All screens are organized by role in `src/screens/`
- Shared screens (auth, settings) are in `src/screens/shared/`
- Components are organized by category for better maintainability
- Database migrations are in the `database/` folder
- The backend API routes will be organized by role in future updates

