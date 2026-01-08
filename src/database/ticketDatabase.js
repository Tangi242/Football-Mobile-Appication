import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db = null;
let isInitialized = false;

// Check if SQLite is available (not on web)
const isSQLiteAvailable = () => {
  return Platform.OS !== 'web' && SQLite;
};

export const initDatabase = async () => {
  // Skip on web platform
  if (!isSQLiteAvailable()) {
    console.log('SQLite not available on web platform');
    return null;
  }

  if (isInitialized && db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync('nfa_tickets.db');
    
    // Create tickets table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        ticket_number TEXT UNIQUE NOT NULL,
        seat TEXT,
        purchase_date TEXT NOT NULL,
        match_name TEXT NOT NULL,
        match_date TEXT NOT NULL,
        match_time TEXT NOT NULL,
        venue TEXT NOT NULL,
        ticket_type TEXT NOT NULL,
        price REAL NOT NULL,
        status TEXT DEFAULT 'upcoming',
        added_to_calendar INTEGER DEFAULT 0
      );
    `);

    // Check if columns exist, if not add them (for existing tables)
    try {
      await db.execAsync('ALTER TABLE tickets ADD COLUMN match_name TEXT');
    } catch (e) {
      // Column already exists, ignore
    }

    try {
      await db.execAsync('ALTER TABLE tickets ADD COLUMN match_date TEXT');
    } catch (e) {
      // Column already exists, ignore
    }

    try {
      await db.execAsync('ALTER TABLE tickets ADD COLUMN match_time TEXT');
    } catch (e) {
      // Column already exists, ignore
    }

    try {
      await db.execAsync('ALTER TABLE tickets ADD COLUMN venue TEXT');
    } catch (e) {
      // Column already exists, ignore
    }

    try {
      await db.execAsync('ALTER TABLE tickets ADD COLUMN ticket_type TEXT');
    } catch (e) {
      // Column already exists, ignore
    }

    try {
      await db.execAsync('ALTER TABLE tickets ADD COLUMN price REAL');
    } catch (e) {
      // Column already exists, ignore
    }

    try {
      await db.execAsync('ALTER TABLE tickets ADD COLUMN status TEXT DEFAULT "upcoming"');
    } catch (e) {
      // Column already exists, ignore
    }

    try {
      await db.execAsync('ALTER TABLE tickets ADD COLUMN added_to_calendar INTEGER DEFAULT 0');
    } catch (e) {
      // Column already exists, ignore
    }

    isInitialized = true;
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    isInitialized = false;
    db = null;
    // Don't throw on web or if it's a non-critical error
    if (Platform.OS === 'web') {
      return null;
    }
    // On native platforms, log but don't crash the app
    console.warn('Database initialization failed, ticket features will be unavailable');
    return null;
  }
};

export const getDatabase = async () => {
  if (!isSQLiteAvailable()) {
    return null;
  }
  if (!db && !isInitialized) {
    await initDatabase();
  }
  return db;
};

// Generate unique ticket number
const generateTicketNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `NFA-${timestamp}-${random}`;
};

// Insert a new ticket
export const insertTicket = async (ticketData) => {
  try {
    const database = await getDatabase();
    if (!database) {
      throw new Error('Database not available. Ticket features require a native platform.');
    }
    const ticketNumber = generateTicketNumber();
    const purchaseDate = new Date().toISOString();

    // Determine initial status based on match date
    const matchDateTime = new Date(`${ticketData.match_date}T${ticketData.match_time}`);
    const now = new Date();
    let initialStatus = 'upcoming';
    if (matchDateTime < now) {
      initialStatus = 'expired';
    }

    const result = await database.runAsync(
      `INSERT INTO tickets (
        match_id, user_id, ticket_number, seat, purchase_date,
        match_name, match_date, match_time, venue, ticket_type, price, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticketData.match_id,
        ticketData.user_id,
        ticketNumber,
        ticketData.seat || null,
        purchaseDate,
        ticketData.match_name,
        ticketData.match_date,
        ticketData.match_time,
        ticketData.venue,
        ticketData.ticket_type,
        ticketData.price,
        initialStatus
      ]
    );

    // Fetch the inserted ticket
    const ticket = await getTicketById(result.lastInsertRowId);
    return ticket;
  } catch (error) {
    console.error('Error inserting ticket:', error);
    throw error;
  }
};

// Get ticket by ID
export const getTicketById = async (ticketId) => {
  try {
    const database = await getDatabase();
    if (!database) {
      return null;
    }
    const result = await database.getFirstAsync(
      'SELECT * FROM tickets WHERE id = ?',
      [ticketId]
    );
    return result;
  } catch (error) {
    console.error('Error getting ticket by ID:', error);
    throw error;
  }
};

// Get all tickets for a user
export const getUserTickets = async (userId) => {
  try {
    const database = await getDatabase();
    if (!database) {
      return [];
    }
    const result = await database.getAllAsync(
      'SELECT * FROM tickets WHERE user_id = ? ORDER BY purchase_date DESC',
      [userId]
    );
    return result;
  } catch (error) {
    console.error('Error getting user tickets:', error);
    throw error;
  }
};

// Get ticket by ticket number
export const getTicketByNumber = async (ticketNumber) => {
  try {
    const database = await getDatabase();
    if (!database) {
      return null;
    }
    const result = await database.getFirstAsync(
      'SELECT * FROM tickets WHERE ticket_number = ?',
      [ticketNumber]
    );
    return result;
  } catch (error) {
    console.error('Error getting ticket by number:', error);
    throw error;
  }
};

// Delete a ticket (if needed)
export const deleteTicket = async (ticketId) => {
  try {
    const database = await getDatabase();
    if (!database) {
      return false;
    }
    await database.runAsync('DELETE FROM tickets WHERE id = ?', [ticketId]);
    return true;
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
};

