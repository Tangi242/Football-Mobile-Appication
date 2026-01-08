import axios from 'axios';
import { API_BASE_URL } from '../config/constants.js';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

// File upload utility for React Native
export const uploadFile = async (fileUri, uploadType = 'general', fileName = null) => {
  try {
    // Create FormData
    const formData = new FormData();
    
    // Get file name from URI
    const uriParts = fileUri.split('/');
    const defaultFileName = fileName || uriParts[uriParts.length - 1];
    
    // Determine file type from URI extension or fileName
    let fileType = 'image/jpeg'; // default
    const checkName = fileName || fileUri;
    const extension = checkName.toLowerCase().split('.').pop();
    
    if (extension === 'png') {
      fileType = 'image/png';
    } else if (extension === 'gif') {
      fileType = 'image/gif';
    } else if (extension === 'webp') {
      fileType = 'image/webp';
    } else if (extension === 'pdf') {
      fileType = 'application/pdf';
    } else if (['mp4', 'mov', 'mpeg'].includes(extension)) {
      fileType = `video/${extension === 'mov' ? 'quicktime' : extension}`;
    }
    
    // Append file to FormData (React Native format)
    formData.append('file', {
      uri: fileUri,
      type: fileType,
      name: defaultFileName,
    });
    
    // Append upload type
    formData.append('type', uploadType);
    
    // Upload file
    const response = await apiClient.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
    });
    
    return response.data;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling with user-friendly messages
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message;
    
    // Only log non-404 errors to reduce noise
    if (status !== 404) {
      console.error('API error', error?.response?.data || error.message);
    }
    
    // Enhance error object with user-friendly message
    error.userMessage = getErrorMessage(status, message, error);
    
    return Promise.reject(error);
  }
);

// Helper function to generate user-friendly error messages
const getErrorMessage = (status, message, error) => {
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Request timed out. Please check your connection and try again.';
  }
  
  if (error?.message?.includes('Network Error') || error?.code === 'ERR_NETWORK') {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  switch (status) {
    case 400:
      return message || 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in and try again.';
    case 403:
      return 'Access denied. You don\'t have permission to perform this action.';
    case 404:
      return 'Resource not found. The requested item may have been removed.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service unavailable. The server is temporarily down. Please try again later.';
    default:
      return message || 'An unexpected error occurred. Please try again.';
  }
};

export const fetchFixtures = () => apiClient.get('/fixtures');
export const fetchResults = () => apiClient.get('/results');
export const fetchReports = () => apiClient.get('/reports');
export const fetchAnnouncements = () => apiClient.get('/announcements');
export const fetchProducts = () => apiClient.get('/products');
export const fetchUsers = (params) => apiClient.get('/users', { params });
export const fetchLeagues = () => apiClient.get('/meta/leagues');
export const fetchLeaders = () => apiClient.get('/meta/leaders');
export const fetchPlayerById = (id) => apiClient.get(`/players/${id}`);
export const fetchPlayerByName = (name) => apiClient.get(`/players/search/${encodeURIComponent(name)}`);
export const sendNotificationToken = (tokenPayload) =>
  apiClient.post('/users/notification-token', tokenPayload);
export const fetchMatchEvents = (matchId) => 
  apiClient.get(`/matches/${matchId}/events`).catch(error => {
    // Return empty array if endpoint doesn't exist (404)
    if (error?.response?.status === 404) {
      return { data: { events: [] } };
    }
    throw error;
  });
export const fetchMatchDetails = (matchId) => apiClient.get(`/matches/${matchId}`);

// Team management
export const fetchTeams = () => apiClient.get('/teams');
export const fetchTeamById = (id) => apiClient.get(`/teams/${id}`);
export const createTeam = (teamData) => apiClient.post('/teams', teamData);
export const updateTeam = (id, teamData) => apiClient.put(`/teams/${id}`, teamData);
export const deleteTeam = (id) => apiClient.delete(`/teams/${id}`);

// Coach management
export const fetchCoaches = () => apiClient.get('/coaches');
export const fetchCoachById = (id) => apiClient.get(`/coaches/${id}`);
export const createCoach = (coachData) => apiClient.post('/coaches', coachData);
export const updateCoach = (id, coachData) => apiClient.put(`/coaches/${id}`, coachData);
export const deleteCoach = (id) => apiClient.delete(`/coaches/${id}`);

// User management
export const fetchUserById = (id) => apiClient.get(`/users/${id}`);
export const updateUserStatus = (id, status) => apiClient.put(`/users/${id}/status`, { status });

// Authentication
export const login = (email, password) => apiClient.post('/auth/login', { email, password });
export const register = (userData) => apiClient.post('/auth/register', userData);

// Registration management (admin)
export const getPendingRegistrations = () => apiClient.get('/registrations/pending');
export const approveRegistration = (id, adminId) => apiClient.post(`/registrations/${id}/approve`, { admin_id: adminId });
export const rejectRegistration = (id, adminId, reason) => apiClient.post(`/registrations/${id}/reject`, { admin_id: adminId, reason });

// League management (admin CRUD)
export const fetchLeaguesAdmin = () => apiClient.get('/leagues');
export const fetchLeagueById = (id) => apiClient.get(`/leagues/${id}`);
export const createLeague = (leagueData) => apiClient.post('/leagues', leagueData);
export const updateLeague = (id, leagueData) => apiClient.put(`/leagues/${id}`, leagueData);
export const deleteLeague = (id) => apiClient.delete(`/leagues/${id}`);

// Stadium management
export const fetchStadiums = () => apiClient.get('/stadiums');
export const fetchStadiumById = (id) => apiClient.get(`/stadiums/${id}`);
export const createStadium = (stadiumData) => apiClient.post('/stadiums', stadiumData);
export const updateStadium = (id, stadiumData) => apiClient.put(`/stadiums/${id}`, stadiumData);
export const deleteStadium = (id) => apiClient.delete(`/stadiums/${id}`);

// News management
export const fetchNews = (authorId = null) => {
  if (authorId) {
    return apiClient.get('/news', { params: { author_id: authorId } });
  }
  return apiClient.get('/news');
};
export const fetchNewsById = (id) => apiClient.get(`/news/${id}`);
export const createNews = (newsData) => apiClient.post('/news', newsData);
export const updateNews = (id, newsData) => apiClient.put(`/news/${id}`, newsData);
export const deleteNews = (id) => apiClient.delete(`/news/${id}`);

// Ticket management
export const createTicket = (ticketData) => apiClient.post('/tickets', ticketData);

// Coach-specific functions
export const getCoachTeam = (coachId) => apiClient.get(`/coach/team/${coachId}`);
export const getCoachPlayers = (coachId) => apiClient.get(`/coach/players/${coachId}`);
export const createCoachPlayer = (coachId, playerData) => apiClient.post(`/coach/players/${coachId}`, playerData);
export const updateCoachPlayer = (playerId, coachId, playerData) => apiClient.put(`/coach/players/${playerId}/${coachId}`, playerData);
export const deleteCoachPlayer = (playerId, coachId) => apiClient.delete(`/coach/players/${playerId}/${coachId}`);
export const getCoachMatches = (coachId) => apiClient.get(`/coach/matches/${coachId}`);
export const getLineup = (matchId, coachId) => apiClient.get(`/coach/lineups/${matchId}/${coachId}`);
export const createLineup = (coachId, lineupData) => apiClient.post(`/coach/lineups/${coachId}`, lineupData);
export const submitLineup = (lineupId, coachId) => apiClient.post(`/coach/lineups/${lineupId}/submit/${coachId}`);
export const getCoachNews = (coachId) => apiClient.get(`/coach/news/${coachId}`);
export const createCoachNews = (coachId, newsData) => apiClient.post(`/coach/news/${coachId}`, newsData);

// Standings functions
export const getStandings = (leagueId) => apiClient.get(`/standings/league/${leagueId}`);
export const getAllStandings = () => apiClient.get('/standings');
export const recalculateStandings = (leagueId) => apiClient.post(`/standings/recalculate/${leagueId}`);
export const fetchLeaderboards = () => apiClient.get('/meta/leaders');

// Poll management (for journalists)
export const fetchPolls = (authorId = null) => apiClient.get('/polls', { params: { author_id: authorId } });
export const createPoll = (pollData) => apiClient.post('/polls', pollData);
export const updatePoll = (id, pollData) => apiClient.put(`/polls/${id}`, pollData);
export const deletePoll = (id) => apiClient.delete(`/polls/${id}`);

// Quiz management (for journalists)
export const fetchQuizzes = (authorId = null) => apiClient.get('/quizzes', { params: { author_id: authorId } });
export const createQuiz = (quizData) => apiClient.post('/quizzes', quizData);
export const updateQuiz = (id, quizData) => apiClient.put(`/quizzes/${id}`, quizData);
export const deleteQuiz = (id) => apiClient.delete(`/quizzes/${id}`);

// Interview management (for journalists)
export const fetchInterviews = (authorId = null) => apiClient.get('/interviews', { params: { author_id: authorId } });
export const createInterview = (interviewData) => apiClient.post('/interviews', interviewData);
export const updateInterview = (id, interviewData) => apiClient.put(`/interviews/${id}`, interviewData);
export const deleteInterview = (id) => apiClient.delete(`/interviews/${id}`);

// Comment moderation (for journalists)
export const fetchComments = (newsId = null, status = null) => apiClient.get('/comments', { params: { news_id: newsId, status } });
export const moderateComment = (id, status) => apiClient.put(`/comments/${id}/moderate`, { status });
export const deleteComment = (id) => apiClient.delete(`/comments/${id}`);

// Match events (for journalists) - fetchMatchEvents already declared above
export const createMatchEvent = (matchId, eventData) => apiClient.post(`/matches/${matchId}/events`, eventData);
export const updateMatchEvent = (matchId, eventId, eventData) => apiClient.put(`/matches/${matchId}/events/${eventId}`, eventData);
export const deleteMatchEvent = (matchId, eventId) => apiClient.delete(`/matches/${matchId}/events/${eventId}`);

// Player ratings (for journalists)
export const fetchPlayerRatings = (matchId) => apiClient.get(`/matches/${matchId}/ratings`);
export const createPlayerRating = (matchId, ratingData) => apiClient.post(`/matches/${matchId}/ratings`, ratingData);
export const updatePlayerRating = (matchId, playerId, ratingData) => apiClient.put(`/matches/${matchId}/ratings/${playerId}`, ratingData);

// Breaking news notifications
export const triggerBreakingNews = (newsId) => apiClient.post(`/news/${newsId}/breaking`);

// Transfer requests (for coaches)
export const fetchTransferRequests = (coachId) => apiClient.get('/transfers', { params: { coach_id: coachId } });
export const createTransferRequest = (requestData) => apiClient.post('/transfers', requestData);
export const cancelTransferRequest = (requestId, coachId) => apiClient.delete(`/transfers/${requestId}`, { params: { coach_id: coachId } });

// Friendly fixtures (for coaches)
export const fetchFriendlyFixtures = (coachId) => apiClient.get('/friendly-fixtures', { params: { coach_id: coachId } });
export const createFriendlyFixture = (fixtureData) => apiClient.post('/friendly-fixtures', fixtureData);
export const updateFriendlyFixture = (id, fixtureData) => apiClient.put(`/friendly-fixtures/${id}`, fixtureData);
export const deleteFriendlyFixture = (id) => apiClient.delete(`/friendly-fixtures/${id}`);

// Training sessions (for coaches)
export const fetchTrainingSessions = (coachId) => apiClient.get('/training', { params: { coach_id: coachId } });
export const createTrainingSession = (sessionData) => apiClient.post('/training', sessionData);
export const updateTrainingSession = (id, sessionData) => apiClient.put(`/training/${id}`, sessionData);
export const deleteTrainingSession = (id) => apiClient.delete(`/training/${id}`);

// Player statistics (for coaches)
export const fetchPlayerStats = (playerId, season = null) => apiClient.get(`/players/${playerId}/stats`, { params: { season } });
export const fetchTeamPlayerStats = (teamId, season = null) => apiClient.get(`/teams/${teamId}/player-stats`, { params: { season } });

