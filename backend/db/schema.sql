-- ===================================================
-- Alby by Design Graphics — Database Schema
-- Run this once against your PostgreSQL database:
--   psql $DATABASE_URL -f db/schema.sql
-- ===================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    category    VARCHAR(100),
    description TEXT,
    image_url   TEXT,
    video_url   TEXT,
    project_url TEXT,
    featured    BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact inquiries table
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255),
    email      VARCHAR(255),
    company    VARCHAR(255),
    subject    VARCHAR(255),
    budget     VARCHAR(100),
    message    TEXT,
    status     VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_projects_category   ON projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_featured   ON projects (featured);
CREATE INDEX IF NOT EXISTS idx_inquiries_status    ON contact_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_admin_email         ON admin_users (email);
