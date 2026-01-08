/**
 * Example dataset for production-ready app experience
 * Used as fallback when backend data is not available
 * All data is realistic and relevant to Namibia Football Association
 */

import dayjs from '../lib/dayjs.js';

// Example fixtures (upcoming matches)
export const exampleFixtures = [
  {
    id: 1,
    match_id: 1,
    home_team: 'Black Africa FC',
    away_team: 'African Stars',
    match_date: dayjs().add(3, 'days').format('YYYY-MM-DD'),
    match_time: '15:00',
    venue: 'Independence Stadium',
    competition: 'Namibia Premier League',
    league_id: 1,
    status: 'scheduled',
  },
  {
    id: 2,
    match_id: 2,
    home_team: 'Tura Magic',
    away_team: 'Blue Waters',
    match_date: dayjs().add(5, 'days').format('YYYY-MM-DD'),
    match_time: '18:00',
    venue: 'Sam Nujoma Stadium',
    competition: 'Namibia Premier League',
    league_id: 1,
    status: 'scheduled',
  },
  {
    id: 3,
    match_id: 3,
    home_team: 'Namibia',
    away_team: 'Ghana',
    match_date: dayjs().add(7, 'days').format('YYYY-MM-DD'),
    match_time: '20:00',
    venue: 'Hage Geingob Stadium',
    competition: 'AFCON Qualifier',
    league_id: 2,
    status: 'scheduled',
  },
  {
    id: 4,
    match_id: 4,
    home_team: 'Life Fighters',
    away_team: 'Citizens',
    match_date: dayjs().add(10, 'days').format('YYYY-MM-DD'),
    match_time: '16:00',
    venue: 'Independence Stadium',
    competition: 'Namibia Premier League',
    league_id: 1,
    status: 'scheduled',
  },
];

// Example results (completed matches)
export const exampleResults = [
  {
    id: 101,
    match_id: 101,
    home_team: 'Black Africa FC',
    away_team: 'Tura Magic',
    home_score: 2,
    away_score: 1,
    match_date: dayjs().subtract(2, 'days').format('YYYY-MM-DD'),
    match_time: '15:00',
    venue: 'Independence Stadium',
    competition: 'Namibia Premier League',
    league_id: 1,
    status: 'finished',
  },
  {
    id: 102,
    match_id: 102,
    home_team: 'African Stars',
    away_team: 'Blue Waters',
    home_score: 3,
    away_score: 0,
    match_date: dayjs().subtract(5, 'days').format('YYYY-MM-DD'),
    match_time: '18:00',
    venue: 'Sam Nujoma Stadium',
    competition: 'Namibia Premier League',
    league_id: 1,
    status: 'finished',
  },
  {
    id: 103,
    match_id: 103,
    home_team: 'Life Fighters',
    away_team: 'Citizens',
    home_score: 1,
    away_score: 1,
    match_date: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
    match_time: '16:00',
    venue: 'Independence Stadium',
    competition: 'Namibia Premier League',
    league_id: 1,
    status: 'finished',
  },
  {
    id: 104,
    match_id: 104,
    home_team: 'Namibia',
    away_team: 'Zambia',
    home_score: 2,
    away_score: 2,
    match_date: dayjs().subtract(10, 'days').format('YYYY-MM-DD'),
    match_time: '20:00',
    venue: 'Hage Geingob Stadium',
    competition: 'AFCON Qualifier',
    league_id: 2,
    status: 'finished',
  },
];

// Example leaders (top scorers, assists, etc.)
export const exampleLeaders = {
  goals: [
    { id: 1, player: 'Peter Shalulile', team: 'Mamelodi Sundowns', value: 18, goals: 18 },
    { id: 2, player: 'Benson Shilongo', team: 'Pyramids FC', value: 15, goals: 15 },
    { id: 3, player: 'Deon Hotto', team: 'Orlando Pirates', value: 12, goals: 12 },
    { id: 4, player: 'Absalom Iimbondi', team: 'African Stars', value: 11, goals: 11 },
    { id: 5, player: 'Willy Stephanus', team: 'Black Africa FC', value: 10, goals: 10 },
    { id: 6, player: 'Itamunua Keimuine', team: 'Tura Magic', value: 9, goals: 9 },
    { id: 7, player: 'Panduleni Nekundi', team: 'Blue Waters', value: 8, goals: 8 },
    { id: 8, player: 'Llewellyn Stanley', team: 'Life Fighters', value: 7, goals: 7 },
  ],
  assists: [
    { id: 1, player: 'Deon Hotto', team: 'Orlando Pirates', value: 14, assists: 14 },
    { id: 2, player: 'Willy Stephanus', team: 'Black Africa FC', value: 12, assists: 12 },
    { id: 3, player: 'Benson Shilongo', team: 'Pyramids FC', value: 10, assists: 10 },
    { id: 4, player: 'Absalom Iimbondi', team: 'African Stars', value: 9, assists: 9 },
    { id: 5, player: 'Itamunua Keimuine', team: 'Tura Magic', value: 8, assists: 8 },
    { id: 6, player: 'Panduleni Nekundi', team: 'Blue Waters', value: 7, assists: 7 },
    { id: 7, player: 'Llewellyn Stanley', team: 'Life Fighters', value: 6, assists: 6 },
    { id: 8, player: 'Petrus Shitembi', team: 'African Stars', value: 5, assists: 5 },
  ],
  yellows: [
    { id: 1, player: 'Ananias Gebhardt', team: 'Black Africa FC', value: 5, yellows: 5 },
    { id: 2, player: 'Larry Horaeb', team: 'Tura Magic', value: 4, yellows: 4 },
    { id: 3, player: 'Ronald Ketjijere', team: 'African Stars', value: 4, yellows: 4 },
  ],
  reds: [
    { id: 1, player: 'Denis Ngueza', team: 'Blue Waters', value: 2, reds: 2 },
    { id: 2, player: 'Charles Hambira', team: 'Life Fighters', value: 1, reds: 1 },
  ],
};

// Example leagues
export const exampleLeagues = [
  {
    id: 1,
    name: 'Namibia Premier League',
    season: '2025/2026',
    country: 'Namibia',
  },
  {
    id: 2,
    name: 'AFCON Qualifiers',
    season: '2025',
    country: 'Africa',
  },
  {
    id: 3,
    name: 'COSAFA Cup',
    season: '2025',
    country: 'Southern Africa',
  },
];

// Example announcements (news articles)
export const exampleAnnouncements = [
  {
    id: 1,
    title: 'Premier League Fixtures Released for 2025/2026 Season',
    content: 'The Namibia Football Association has officially released the complete fixture list for the 2025/2026 Namibia Premier League season. The schedule includes 240 matches to be played across 16 teams, with matches scheduled at various stadiums throughout the country including Independence Stadium in Windhoek, Sam Nujoma Stadium, and regional venues. The season kicks off on March 15th with defending champions Black Africa FC hosting African Stars in the opening match. All teams will play each other twice in a home-and-away format, with the season concluding in December 2025. The NFA has also confirmed that all matches will be broadcast live on national television and streamed online for international viewers.',
    body: 'The Namibia Football Association has officially released the complete fixture list for the 2025/2026 Namibia Premier League season. The schedule includes 240 matches to be played across 16 teams, with matches scheduled at various stadiums throughout the country including Independence Stadium in Windhoek, Sam Nujoma Stadium, and regional venues. The season kicks off on March 15th with defending champions Black Africa FC hosting African Stars in the opening match. All teams will play each other twice in a home-and-away format, with the season concluding in December 2025. The NFA has also confirmed that all matches will be broadcast live on national television and streamed online for international viewers.',
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    published_at: dayjs().subtract(1, 'day').format('MMMM D, YYYY'),
    category: 'League',
  },
  {
    id: 2,
    title: 'Namibia Squad Announced for AFCON Qualifier',
    content: 'National team coach Collin Benjamin has announced his 23-man squad for the upcoming Africa Cup of Nations qualifier against Ghana. The squad features a mix of local and international-based players, including star striker Peter Shalulile from Mamelodi Sundowns and winger Deon Hotto from Orlando Pirates. The team will assemble in Windhoek next week for a training camp before traveling to Accra for the crucial qualifier match. This match is vital for Namibia\'s hopes of qualifying for the 2025 AFCON tournament. The coach expressed confidence in the squad\'s ability to secure a positive result.',
    body: 'National team coach Collin Benjamin has announced his 23-man squad for the upcoming Africa Cup of Nations qualifier against Ghana. The squad features a mix of local and international-based players, including star striker Peter Shalulile from Mamelodi Sundowns and winger Deon Hotto from Orlando Pirates. The team will assemble in Windhoek next week for a training camp before traveling to Accra for the crucial qualifier match. This match is vital for Namibia\'s hopes of qualifying for the 2025 AFCON tournament. The coach expressed confidence in the squad\'s ability to secure a positive result. Several players from the domestic league have also been included, showcasing the depth of talent in Namibian football.',
    date: dayjs().subtract(3, 'days').format('YYYY-MM-DD'),
    published_at: dayjs().subtract(3, 'days').format('MMMM D, YYYY'),
    category: 'National Team',
  },
  {
    id: 3,
    title: 'NFA Launches Comprehensive Youth Development Program',
    content: 'The Namibia Football Association has launched an ambitious new youth development program aimed at identifying and nurturing young football talent across all 14 regions of Namibia. The program will establish regional academies, provide coaching education, and create pathways for talented young players to progress to professional football. The initiative is part of NFA\'s long-term strategy to strengthen the national team and improve the overall standard of football in the country. Funding has been secured through partnerships with government and private sector sponsors.',
    body: 'The Namibia Football Association has launched an ambitious new youth development program aimed at identifying and nurturing young football talent across all 14 regions of Namibia. The program will establish regional academies, provide coaching education, and create pathways for talented young players to progress to professional football. The initiative is part of NFA\'s long-term strategy to strengthen the national team and improve the overall standard of football in the country. Funding has been secured through partnerships with government and private sector sponsors. The program will focus on players aged 8-18 and will include regular training sessions, competitive matches, and educational support to ensure holistic development.',
    date: dayjs().subtract(5, 'days').format('YYYY-MM-DD'),
    published_at: dayjs().subtract(5, 'days').format('MMMM D, YYYY'),
    category: 'Development',
  },
  {
    id: 4,
    title: 'African Stars Sign Promising Midfielder from Youth Academy',
    content: 'African Stars FC has completed the signing of 19-year-old midfielder David Kambonde from their youth academy. The talented youngster has been promoted to the first team after impressing in the reserve league, where he scored 8 goals and provided 12 assists in 20 appearances. Club manager expressed excitement about Kambonde\'s potential and confirmed he will be part of the squad for the upcoming season. This signing represents the club\'s commitment to developing local talent and providing opportunities for young Namibian players.',
    body: 'African Stars FC has completed the signing of 19-year-old midfielder David Kambonde from their youth academy. The talented youngster has been promoted to the first team after impressing in the reserve league, where he scored 8 goals and provided 12 assists in 20 appearances. Club manager expressed excitement about Kambonde\'s potential and confirmed he will be part of the squad for the upcoming season. This signing represents the club\'s commitment to developing local talent and providing opportunities for young Namibian players. Kambonde has signed a three-year contract and will wear the number 15 jersey.',
    date: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
    published_at: dayjs().subtract(7, 'days').format('MMMM D, YYYY'),
    category: 'Transfer',
  },
  {
    id: 5,
    title: 'Black Africa FC Complete Signing of Experienced Defender',
    content: 'Black Africa FC has announced the signing of experienced defender Ananias Gebhardt on a two-year contract. The 28-year-old defender brings valuable experience from his time with several Premier League clubs and is expected to strengthen the team\'s defensive line. Club officials expressed their delight at securing the services of such a proven player.',
    body: 'Black Africa FC has announced the signing of experienced defender Ananias Gebhardt on a two-year contract. The 28-year-old defender brings valuable experience from his time with several Premier League clubs and is expected to strengthen the team\'s defensive line. Club officials expressed their delight at securing the services of such a proven player. Gebhardt will join the squad immediately and is expected to make his debut in the upcoming match.',
    date: dayjs().subtract(9, 'days').format('YYYY-MM-DD'),
    published_at: dayjs().subtract(9, 'days').format('MMMM D, YYYY'),
    category: 'Transfer',
  },
  {
    id: 6,
    title: 'Tura Magic Secure Loan Deal for Young Striker',
    content: 'Tura Magic FC has completed a season-long loan deal for promising young striker Itamunua Keimuine from a top-tier club. The 21-year-old forward is known for his pace and finishing ability, and the club hopes he will add firepower to their attack. The loan agreement includes an option to make the move permanent at the end of the season.',
    body: 'Tura Magic FC has completed a season-long loan deal for promising young striker Itamunua Keimuine from a top-tier club. The 21-year-old forward is known for his pace and finishing ability, and the club hopes he will add firepower to their attack. The loan agreement includes an option to make the move permanent at the end of the season. Keimuine expressed his excitement about joining the club and is eager to contribute to their success.',
    date: dayjs().subtract(11, 'days').format('YYYY-MM-DD'),
    published_at: dayjs().subtract(11, 'days').format('MMMM D, YYYY'),
    category: 'Transfer',
  },
];

// Example users (players, referees, etc.)
export const exampleUsers = [
  {
    id: 1,
    full_name: 'Peter Shalulile',
    role: 'player',
    team_name: 'Mamelodi Sundowns',
    phone: '+264 81 234 5678',
    email: 'p.shalulile@mamelodisundowns.co.za',
    avatar_url: null,
  },
  {
    id: 2,
    full_name: 'Deon Hotto',
    role: 'player',
    team_name: 'Orlando Pirates',
    phone: '+264 81 345 6789',
    email: 'd.hotto@orlandopirates.co.za',
    avatar_url: null,
  },
  {
    id: 3,
    full_name: 'Benson Shilongo',
    role: 'player',
    team_name: 'Pyramids FC',
    phone: '+264 81 456 7890',
    email: 'b.shilongo@pyramidsfc.com',
    avatar_url: null,
  },
  {
    id: 4,
    full_name: 'Jackson Pavaza',
    role: 'referee',
    team_name: null,
    phone: '+264 81 567 8901',
    email: 'j.pavaza@nfa.na',
    avatar_url: null,
  },
  {
    id: 5,
    full_name: 'Nehemiah Shovaleka',
    role: 'referee',
    team_name: null,
    phone: '+264 81 678 9012',
    email: 'n.shovaleka@nfa.na',
    avatar_url: null,
  },
  {
    id: 6,
    full_name: 'Absalom Iimbondi',
    role: 'player',
    team_name: 'African Stars',
    phone: '+264 81 789 0123',
    email: 'a.iimbondi@africanstars.na',
    avatar_url: null,
  },
];

// Example reports (match reports)
export const exampleReports = [
  {
    id: 1,
    match_id: 101,
    title: 'Black Africa FC Secure Hard-Fought Victory Over Tura Magic',
    content: 'Black Africa FC secured a hard-fought 2-1 victory over Tura Magic in an entertaining Premier League encounter at Independence Stadium. The home side took an early lead in the 12th minute through a well-worked team goal finished by striker Willy Stephanus. Tura Magic equalized just before halftime through a penalty converted by Itamunua Keimuine. The decisive goal came in the 78th minute when Black Africa\'s midfielder Ananias Gebhardt scored directly from a free-kick. Both teams created several chances throughout the match, with Black Africa\'s goalkeeper making crucial saves in the final minutes to preserve the victory.',
    date: dayjs().subtract(2, 'days').format('YYYY-MM-DD'),
  },
  {
    id: 2,
    match_id: 102,
    title: 'African Stars Dominate Blue Waters in Convincing Win',
    content: 'African Stars put on a commanding performance to defeat Blue Waters 3-0 at Sam Nujoma Stadium. The Stars controlled possession throughout the match and created numerous scoring opportunities. Absalom Iimbondi opened the scoring in the 25th minute with a powerful header from a corner kick. Petrus Shitembi doubled the lead in the 52nd minute with a well-placed shot from outside the box. The third goal came in the 78th minute when substitute forward finished a counter-attack. Blue Waters struggled to create clear chances and were unable to break down the Stars\' organized defense.',
    date: dayjs().subtract(5, 'days').format('YYYY-MM-DD'),
  },
  {
    id: 3,
    match_id: 103,
    title: 'Life Fighters and Citizens Share Points in Entertaining Draw',
    content: 'Life Fighters and Citizens played out an entertaining 1-1 draw at Independence Stadium. Citizens took the lead in the 35th minute through a well-taken goal, but Life Fighters equalized in the 67th minute. Both teams had opportunities to win the match in the closing stages, but neither could find the decisive goal. The result leaves both teams in mid-table positions as the season progresses.',
    date: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
  },
];

// Helper function to get example data based on type
export const getExampleData = (type) => {
  switch (type) {
    case 'fixtures':
      return exampleFixtures;
    case 'results':
      return exampleResults;
    case 'leaders':
      return exampleLeaders;
    case 'leagues':
      return exampleLeagues;
    case 'announcements':
      return exampleAnnouncements;
    case 'users':
      return exampleUsers;
    case 'reports':
      return exampleReports;
    default:
      return [];
  }
};

export default {
  exampleFixtures,
  exampleResults,
  exampleLeaders,
  exampleLeagues,
  exampleAnnouncements,
  exampleUsers,
  exampleReports,
  getExampleData,
};

