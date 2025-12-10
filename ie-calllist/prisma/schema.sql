-- Turso Database Schema
-- Run this in Turso Dashboard SQL Console or via: turso db shell ie-calllist < schema.sql

-- User table
CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    pinHash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'producer',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Station table
CREATE TABLE IF NOT EXISTS Station (
    id TEXT PRIMARY KEY NOT NULL,
    marketNumber INTEGER NOT NULL,
    marketName TEXT NOT NULL,
    callLetters TEXT NOT NULL,
    feed TEXT NOT NULL,
    broadcastStatus TEXT,
    airTimeLocal TEXT NOT NULL,
    airTimeET TEXT NOT NULL,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(marketNumber, feed)
);

-- PhoneNumber table
CREATE TABLE IF NOT EXISTS PhoneNumber (
    id TEXT PRIMARY KEY NOT NULL,
    stationId TEXT NOT NULL,
    label TEXT NOT NULL,
    number TEXT NOT NULL,
    sortOrder INTEGER NOT NULL DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stationId) REFERENCES Station(id) ON DELETE CASCADE
);

-- CallLog table
CREATE TABLE IF NOT EXISTS CallLog (
    id TEXT PRIMARY KEY NOT NULL,
    stationId TEXT NOT NULL,
    phoneId TEXT NOT NULL,
    phoneNumber TEXT NOT NULL,
    calledBy TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stationId) REFERENCES Station(id) ON DELETE CASCADE,
    FOREIGN KEY (phoneId) REFERENCES PhoneNumber(id) ON DELETE CASCADE,
    FOREIGN KEY (calledBy) REFERENCES User(id) ON DELETE CASCADE
);

-- EditLog table
CREATE TABLE IF NOT EXISTS EditLog (
    id TEXT PRIMARY KEY NOT NULL,
    stationId TEXT NOT NULL,
    field TEXT NOT NULL,
    oldValue TEXT NOT NULL,
    newValue TEXT NOT NULL,
    editedBy TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stationId) REFERENCES Station(id) ON DELETE CASCADE,
    FOREIGN KEY (editedBy) REFERENCES User(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_station_market_feed ON Station(marketNumber, feed);
CREATE INDEX IF NOT EXISTS idx_phonenumber_station ON PhoneNumber(stationId);
CREATE INDEX IF NOT EXISTS idx_calllog_station ON CallLog(stationId);
CREATE INDEX IF NOT EXISTS idx_calllog_user ON CallLog(calledBy);
CREATE INDEX IF NOT EXISTS idx_editlog_station ON EditLog(stationId);
CREATE INDEX IF NOT EXISTS idx_editlog_user ON EditLog(editedBy);

-- Insert default admin user (PIN: 123456)
-- Password hash for "123456" using bcrypt
INSERT OR IGNORE INTO User (id, name, pinHash, role, createdAt)
VALUES (
    'admin-default',
    'Admin',
    '$2a$10$YPaBWxrEGnX6jF8vQZ9fKOqKp5vY5h0qN5vY5h0qN5vY5h0qN5vY5u',
    'admin',
    CURRENT_TIMESTAMP
);

-- Insert test producer user (PIN: 111111)
INSERT OR IGNORE INTO User (id, name, pinHash, role, createdAt)
VALUES (
    'producer-test',
    'Producer',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'producer',
    CURRENT_TIMESTAMP
);

