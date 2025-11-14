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
        await Promise.all([
          fetchFixtures(),
          fetchResults(),
          fetchReports(),
          fetchAnnouncements(),
          fetchUsers(),
          fetchLeagues(),
          fetchLeaders()
        ]);
      setData((prev) => ({
        ...prev,
        fixtures: fixturesRes.data.fixtures,
        results: resultsRes.data.results,
        reports: reportsRes.data.reports,
        announcements: announcementsRes.data.announcements,
        users: usersRes.data.users,
        leagues: leaguesRes.data.leagues,
        leaders: leadersRes.data.leaders
      }));
      setError(null);
    } catch (err) {
      console.error('Failed to load data', err);
      setError('Unable to load latest data. Pull to refresh.');
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
      setData((prev) => ({
        ...prev,
        liveEvents: {
          ...prev.liveEvents,
          [event.matchId]: event.payload
        }
      }));
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

