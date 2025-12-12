-- Migration: Add RecentCall table for shared phone call tracking
-- Run this in Turso Dashboard SQL Console or via: turso db shell ie-calllist < add_recentcall_table.sql

-- RecentCall table (for shared phone call tracking)
CREATE TABLE IF NOT EXISTS RecentCall (
    id TEXT PRIMARY KEY NOT NULL,
    number TEXT NOT NULL UNIQUE,
    calledAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    calledBy TEXT NOT NULL,
    FOREIGN KEY (calledBy) REFERENCES User(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recentcall_number ON RecentCall(number);
CREATE INDEX IF NOT EXISTS idx_recentcall_calledat ON RecentCall(calledAt);

