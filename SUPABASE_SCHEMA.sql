-- Real Estate Database Schema for Supabase (lowercase table names)
-- Run this entire script in Supabase SQL Editor

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_properties_status_type_featured CASCADE;
DROP INDEX IF EXISTS idx_properties_offplan_developer CASCADE;
DROP INDEX IF EXISTS idx_properties_agent CASCADE;
DROP INDEX IF EXISTS idx_properties_location_city CASCADE;
DROP INDEX IF EXISTS idx_properties_price_area CASCADE;
DROP INDEX IF EXISTS idx_properties_bedrooms_bathrooms CASCADE;
DROP INDEX IF EXISTS idx_properties_created CASCADE;
DROP INDEX IF EXISTS idx_users_email CASCADE;
DROP INDEX IF EXISTS idx_users_role CASCADE;
DROP INDEX IF EXISTS idx_developers_slug CASCADE;
DROP INDEX IF EXISTS idx_inquiries_property CASCADE;
DROP INDEX IF EXISTS idx_inquiries_status CASCADE;
DROP INDEX IF EXISTS idx_blog_posts_slug CASCADE;
DROP INDEX IF EXISTS idx_blog_posts_status CASCADE;
DROP INDEX IF EXISTS idx_blogposts_slug CASCADE;
DROP INDEX IF EXISTS idx_blogposts_status CASCADE;

-- Drop existing tables if they exist (in reverse order due to foreign key constraints)
DROP TABLE IF EXISTS saved_properties CASCADE;
DROP TABLE IF EXISTS offplan_inquiries CASCADE;
DROP TABLE IF EXISTS document_requests CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS blog_comments CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS developers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin')),
  profile_image VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create developers table
CREATE TABLE developers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo VARCHAR(255),
  background_image VARCHAR(255),
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(255),
  country VARCHAR(255),
  established INTEGER,
  headquarters VARCHAR(255),
  featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create properties table
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  zip_code VARCHAR(255),
  property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'villa', 'penthouse', 'land', 'commercial', 'other')),
  status VARCHAR(20) DEFAULT 'for-sale' CHECK (status IN ('for-sale', 'for-rent', 'sold', 'rented', 'available', 'active')),
  is_offplan BOOLEAN DEFAULT false,
  developer_id INTEGER REFERENCES developers(id),
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  area DECIMAL(10,2),
  bedroom_range VARCHAR(255),
  year_built INTEGER,
  features JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  main_image VARCHAR(255),
  header_image VARCHAR(255),
  payment_plan VARCHAR(255),
  featured BOOLEAN DEFAULT false,
  agent_id INTEGER REFERENCES users(id),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inquiries table
CREATE TABLE inquiries (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  inquiry_type VARCHAR(20) DEFAULT 'general' CHECK (inquiry_type IN ('general', 'viewing', 'purchase', 'rent', 'investment')),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'spam')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  source VARCHAR(255) DEFAULT 'website',
  notes TEXT,
  follow_up_date TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed', 'spam')),
  source VARCHAR(255) DEFAULT 'contact_form',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blog_posts table
CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image VARCHAR(255),
  author_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  tags JSONB DEFAULT '[]',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blog_comments table
CREATE TABLE blog_comments (
  id SERIAL PRIMARY KEY,
  blog_post_id INTEGER REFERENCES blog_posts(id),
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create team_members table
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  bio TEXT,
  image VARCHAR(255),
  social_links JSONB DEFAULT '{}',
  is_leadership BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create testimonials table
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  image VARCHAR(255),
  position VARCHAR(255),
  company VARCHAR(255),
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document_requests table
CREATE TABLE document_requests (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('brochure', 'floor_plan', 'payment_plan', 'noc', 'other')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create offplan_inquiries table
CREATE TABLE offplan_inquiries (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT,
  project_interest VARCHAR(255),
  investment_amount DECIMAL(12,2),
  timeframe VARCHAR(20) DEFAULT 'flexible' CHECK (timeframe IN ('immediate', '3_months', '6_months', '1_year', 'flexible')),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_properties table (junction table)
CREATE TABLE saved_properties (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  property_id INTEGER REFERENCES properties(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, property_id)
);

-- Create Performance Indexes
CREATE INDEX idx_properties_status_type_featured ON properties(status, property_type, featured);
CREATE INDEX idx_properties_offplan_developer ON properties(is_offplan, developer_id);
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_location_city ON properties(location, city);
CREATE INDEX idx_properties_price_area ON properties(price, area);
CREATE INDEX idx_properties_bedrooms_bathrooms ON properties(bedrooms, bathrooms);
CREATE INDEX idx_properties_created ON properties(created_at);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_developers_slug ON developers(slug);
CREATE INDEX idx_inquiries_property ON inquiries(property_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);

-- Insert sample admin user (you'll need to hash the password properly)
INSERT INTO users (name, email, password, role, is_active, email_verified) 
VALUES ('Admin User', 'admin@platinumsquare.com', '$2a$12$temp_password_hash', 'admin', true, true);

-- Insert sample developer
INSERT INTO developers (name, slug, description, is_active) 
VALUES ('Platinum Developer', 'platinum-developer', 'A sample real estate developer for testing', true);

-- Insert sample properties
INSERT INTO properties (title, description, price, location, property_type, status, bedrooms, bathrooms, area, featured, agent_id, developer_id)
SELECT 
  'Luxury ' || (ARRAY['Villa', 'Apartment', 'Penthouse', 'Townhouse'])[floor(random() * 4 + 1)],
  'A beautiful property in the heart of Dubai with stunning views and modern amenities.',
  (random() * 2000000 + 500000)::DECIMAL(12,2),
  (ARRAY['Downtown Dubai', 'Dubai Marina', 'Business Bay', 'Jumeirah', 'Palm Jumeirah'])[floor(random() * 5 + 1)],
  (ARRAY['villa', 'apartment', 'penthouse', 'townhouse'])[floor(random() * 4 + 1)],
  'for-sale',
  floor(random() * 4 + 1)::INTEGER,
  (random() * 3 + 1)::DECIMAL(3,1),
  (random() * 2000 + 500)::DECIMAL(10,2),
  random() < 0.3,
  1,
  1
FROM generate_series(1, 20);

-- Success message
SELECT 'Supabase database schema created successfully! 🎉' as message;