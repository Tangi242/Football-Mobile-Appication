export const translations = {
  en: {
    // Navigation
    news: 'News',
    matches: 'Matches',
    stats: 'Stats',
    teams: 'Teams',
    nationalTeams: 'National Teams',
    fanEngagement: 'Fan Engagement',
    
    // Common
    all: 'All',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    save: 'Save',
    share: 'Share',
    back: 'Back',
    
    // Matches
    fixtures: 'Fixtures',
    results: 'Results',
    reports: 'Reports',
    upcoming: 'Upcoming',
    live: 'Live',
    finished: 'Finished',
    venue: 'Venue',
    referee: 'Referee',
    
    // Teams
    squad: 'Squad',
    statistics: 'Statistics',
    standings: 'Standings',
    points: 'Points',
    wins: 'Wins',
    draws: 'Draws',
    losses: 'Losses',
    goals: 'Goals',
    
    // User
    login: 'Login',
    logout: 'Logout',
    profile: 'Profile',
    favorites: 'Favorites',
    tickets: 'Tickets',
    merchandise: 'Merchandise',
    settings: 'Settings',
    
    // Actions
    buyTicket: 'Buy Ticket',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    saveForOffline: 'Save for Offline',
    
    // Empty states
    noData: 'No data available',
    noMatches: 'No matches found',
    noTeams: 'No teams found'
  },
  af: {
    // Navigation
    news: 'Nuus',
    matches: 'Wedstryde',
    stats: 'Statistieke',
    teams: 'Spanne',
    nationalTeams: 'Nasionale Spanne',
    fanEngagement: 'Aanhanger Betrokkenheid',
    
    // Common
    all: 'Almal',
    search: 'Soek',
    loading: 'Laai...',
    error: 'Fout',
    retry: 'Probeer Weer',
    save: 'Stoor',
    share: 'Deel',
    back: 'Terug',
    
    // Matches
    fixtures: 'Vasgestelde Wedstryde',
    results: 'Resultate',
    reports: 'Verslae',
    upcoming: 'Komende',
    live: 'Lewend',
    finished: 'Voltooi',
    venue: 'Lokaal',
    referee: 'Skeidsregter',
    
    // Teams
    squad: 'Span',
    statistics: 'Statistieke',
    standings: 'Posisies',
    points: 'Punte',
    wins: 'Wen',
    draws: 'Gelykop',
    losses: 'Verloor',
    goals: 'Doele',
    
    // User
    login: 'Teken In',
    logout: 'Teken Uit',
    profile: 'Profiel',
    favorites: 'Gunstelinge',
    tickets: 'Kaartjies',
    merchandise: 'Handelsware',
    settings: 'Instellings',
    
    // Actions
    buyTicket: 'Koop Kaartjie',
    addToFavorites: 'Voeg by Gunstelinge',
    removeFromFavorites: 'Verwyder van Gunstelinge',
    saveForOffline: 'Stoor vir Offlyn',
    
    // Empty states
    noData: 'Geen data beskikbaar nie',
    noMatches: 'Geen wedstryde gevind nie',
    noTeams: 'Geen spanne gevind nie'
  },
  ng: {
    // Navigation
    news: 'Omaimbidhidho',
    matches: 'Omapambatho',
    stats: 'Omaimbidhidho',
    teams: 'Oongundu',
    nationalTeams: 'Oongundu dOmutumba',
    fanEngagement: 'Okuyambidhidha Aakuthimbwa',
    
    // Common
    all: 'Aayehe',
    search: 'Konga',
    loading: 'Okuyambidhidha...',
    error: 'Oshikukuta',
    retry: 'Eta Okuyelele',
    save: 'Humbata',
    share: 'Gandja',
    back: 'Manga',
    
    // Matches
    fixtures: 'Omapambatho gaNakulongwa',
    results: 'Omaimbidhidho',
    reports: 'Omaimbidhidho',
    upcoming: 'Okuza',
    live: 'Okuyela',
    finished: 'Omanu',
    venue: 'Onduda',
    referee: 'Omukalelipo',
    
    // Teams
    squad: 'Oongundu',
    statistics: 'Omaimbidhidho',
    standings: 'Omaposi',
    points: 'Omapointe',
    wins: 'Okuwina',
    draws: 'Okuyambathana',
    losses: 'Okuyona',
    goals: 'Omaigoli',
    
    // User
    login: 'Ingila',
    logout: 'Humana',
    profile: 'Omukundu',
    favorites: 'Oongundu dOndjifa',
    tickets: 'Omatikete',
    merchandise: 'Oshinima',
    settings: 'Omaitho',
    
    // Actions
    buyTicket: 'Landula Tikete',
    addToFavorites: 'Ekela moGunstelinge',
    removeFromFavorites: 'Kutha moGunstelinge',
    saveForOffline: 'Humbata moOffline',
    
    // Empty states
    noData: 'Omaimbidhidho kaashi na',
    noMatches: 'Omapambatho kaashi monika',
    noTeams: 'Oongundu kaashi monika'
  }
};

export const getTranslation = (key, language = 'en') => {
  return translations[language]?.[key] || translations.en[key] || key;
};

export const t = (key, language = 'en') => getTranslation(key, language);


