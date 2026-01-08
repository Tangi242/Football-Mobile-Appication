import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  fetchFixtures,
  fetchResults,
  fetchReports,
  fetchAnnouncements,
  fetchUsers,
  fetchLeagues,
  fetchLeaders
} from '../api/client.js';
import { initSocket } from '../api/socket.js';
// All data now comes from database - no example data fallbacks

const DataContext = createContext();

const initialState = {
  fixtures: [],
  results: [],
  reports: [],
  announcements: [],
  users: [],
  leagues: [],
  leaders: {
    goals: [],
    assists: [],
    yellows: [],
    reds: []
  },
  liveEvents: {}
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fixturesRes, resultsRes, reportsRes, announcementsRes, usersRes, leaguesRes, leadersRes] =
        await Promise.allSettled([
          fetchFixtures(),
          fetchResults(),
          fetchReports(),
          fetchAnnouncements(),
          fetchUsers(),
          fetchLeagues(),
          fetchLeaders()
        ]);
      
      // Use API data only - no fallbacks to example data
      setData((prev) => ({
        ...prev,
        fixtures: fixturesRes.status === 'fulfilled' ? (fixturesRes.value?.data?.fixtures || []) : [],
        results: resultsRes.status === 'fulfilled' ? (resultsRes.value?.data?.results || []) : [],
        reports: reportsRes.status === 'fulfilled' ? (reportsRes.value?.data?.reports || []) : [],
        announcements: announcementsRes.status === 'fulfilled' ? (announcementsRes.value?.data?.announcements || []) : [],
        users: usersRes.status === 'fulfilled' ? (usersRes.value?.data?.users || []) : [],
        leagues: leaguesRes.status === 'fulfilled' ? (leaguesRes.value?.data?.leagues || []) : [],
        leaders: leadersRes.status === 'fulfilled' ? (leadersRes.value?.data?.leaders || { goals: [], assists: [], yellows: [], reds: [] }) : { goals: [], assists: [], yellows: [], reds: [] },
      }));
      setError(null);
    } catch (err) {
      console.error('Failed to load data', err);
      // On complete failure, set empty arrays - no example data
      setData((prev) => ({
        ...prev,
        fixtures: [],
        results: [],
        reports: [],
        announcements: [],
        users: [],
        leagues: [],
        leaders: { goals: [], assists: [], yellows: [], reds: [] },
      }));
      // Use user-friendly error message if available
      const errorMessage = err?.userMessage || err?.message || 'Failed to load data from database.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const socket = initSocket();
    if (!socket) return;
    socket.on('connect', () => console.log('Realtime connected'));
    socket.on('live-events:update', (event) => {
      setData((prev) => {
        const existingEvent = prev.liveEvents[event.matchId] || {};
        return {
          ...prev,
          liveEvents: {
            ...prev.liveEvents,
            [event.matchId]: {
              ...existingEvent,
              ...event.payload,
              lastUpdate: new Date().toISOString()
            }
          }
        };
      });
    });
    return () => {
      socket.off('live-events:update');
    };
  }, []);

  const value = useMemo(
    () => ({
      ...data,
      loading,
      error,
      refresh: loadData
    }),
    [data, loading, error, loadData]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

