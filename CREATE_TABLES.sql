-- Real Estate Database Schema for PostgreSQL/Supabase
-- Run this entire script in Supabase SQL Editor

-- Create Users table
CREATE TABLE "Users" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "role" VARCHAR(10) DEFAULT 'user' CHECK ("role" IN ('user', 'agent', 'admin')),
  "profileImage" VARCHAR(255),
  "isActive" BOOLEAN DEFAULT true,
  "emailVerified" BOOLEAN DEFAULT false,
  "lastLogin" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Developers table
CREATE TABLE "Developers" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "description" TEXT,
  "logo" VARCHAR(255),
  "website" VARCHAR(255),
  "email" VARCHAR(255),
  "phone" VARCHAR(20),
  "address" VARCHAR(255),
  "city" VARCHAR(255),
  "country" VARCHAR(255),
  "established" INTEGER,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Properties table
CREATE TABLE "Properties" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "location" VARCHAR(255) NOT NULL,
  "address" VARCHAR(255) NOT NULL,
  "city" VARCHAR(255) NOT NULL,
  "state" VARCHAR(255) NOT NULL,
  "zipCode" VARCHAR(255) NOT NULL,
  "propertyType" VARCHAR(20) NOT NULL CHECK ("propertyType" IN ('house', 'apartment', 'condo', 'townhouse', 'villa', 'penthouse', 'land', 'commercial', 'other')),
  "status" VARCHAR(20) DEFAULT 'for-sale' CHECK ("status" IN ('for-sale', 'for-rent', 'sold', 'rented')),
  "isOffplan" BOOLEAN DEFAULT false,
  "developerId" INTEGER REFERENCES "Developers"("id"),
  "bedrooms" INTEGER NOT NULL,
  "bathrooms" DECIMAL(3,1) NOT NULL,
  "area" DECIMAL(10,2) NOT NULL,
  "bedroomRange" VARCHAR(255),
  "yearBuilt" INTEGER,
  "features" JSONB DEFAULT '[]',
  "images" JSONB DEFAULT '[]',
  "mainImage" VARCHAR(255),
  "headerImage" VARCHAR(255),
  "paymentPlan" VARCHAR(255),
  "featured" BOOLEAN DEFAULT false,
  "agentId" INTEGER NOT NULL REFERENCES "Users"("id"),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Inquiries table
CREATE TABLE "Inquiries" (
  "id" SERIAL PRIMARY KEY,
  "propertyId" INTEGER NOT NULL REFERENCES "Properties"("id"),
  "userId" INTEGER REFERENCES "Users"("id"),
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "message" TEXT NOT NULL,
  "inquiryType" VARCHAR(20) DEFAULT 'general' CHECK ("inquiryType" IN ('general', 'viewing', 'purchase', 'rent', 'investment')),
  "status" VARCHAR(20) DEFAULT 'new' CHECK ("status" IN ('new', 'contacted', 'qualified', 'closed', 'spam')),
  "priority" VARCHAR(10) DEFAULT 'medium' CHECK ("priority" IN ('low', 'medium', 'high', 'urgent')),
  "source" VARCHAR(255) DEFAULT 'website',
  "notes" TEXT,
  "followUpDate" TIMESTAMP,
  "respondedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Messages table
CREATE TABLE "Messages" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "subject" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "status" VARCHAR(20) DEFAULT 'new' CHECK ("status" IN ('new', 'read', 'replied', 'closed', 'spam')),
  "source" VARCHAR(255) DEFAULT 'contact_form',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create BlogPosts table
CREATE TABLE "BlogPosts" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) UNIQUE NOT NULL,
  "content" TEXT NOT NULL,
  "excerpt" TEXT,
  "featuredImage" VARCHAR(255),
  "authorId" INTEGER NOT NULL REFERENCES "Users"("id"),
  "status" VARCHAR(20) DEFAULT 'draft' CHECK ("status" IN ('draft', 'published', 'archived')),
  "featured" BOOLEAN DEFAULT false,
  "publishedAt" TIMESTAMP,
  "tags" JSONB DEFAULT '[]',
  "viewCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create BlogComments table
CREATE TABLE "BlogComments" (
  "id" SERIAL PRIMARY KEY,
  "blogPostId" INTEGER NOT NULL REFERENCES "BlogPosts"("id"),
  "userId" INTEGER REFERENCES "Users"("id"),
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "status" VARCHAR(20) DEFAULT 'pending' CHECK ("status" IN ('pending', 'approved', 'spam')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create TeamMembers table
CREATE TABLE "TeamMembers" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "position" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(20),
  "bio" TEXT,
  "image" VARCHAR(255),
  "socialLinks" JSONB DEFAULT '{}',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Testimonials table
CREATE TABLE "Testimonials" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
  "content" TEXT NOT NULL,
  "image" VARCHAR(255),
  "position" VARCHAR(255),
  "company" VARCHAR(255),
  "status" VARCHAR(20) DEFAULT 'pending' CHECK ("status" IN ('pending', 'approved', 'rejected')),
  "featured" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create DocumentRequests table
CREATE TABLE "DocumentRequests" (
  "id" SERIAL PRIMARY KEY,
  "propertyId" INTEGER NOT NULL REFERENCES "Properties"("id"),
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "documentType" VARCHAR(20) NOT NULL CHECK ("documentType" IN ('brochure', 'floor_plan', 'payment_plan', 'noc', 'other')),
  "status" VARCHAR(20) DEFAULT 'pending' CHECK ("status" IN ('pending', 'sent', 'failed')),
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create OffplanInquiries table
CREATE TABLE "OffplanInquiries" (
  "id" SERIAL PRIMARY KEY,
  "propertyId" INTEGER NOT NULL REFERENCES "Properties"("id"),
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "message" TEXT,
  "investmentAmount" DECIMAL(12,2),
  "timeframe" VARCHAR(20) DEFAULT 'flexible' CHECK ("timeframe" IN ('immediate', '3_months', '6_months', '1_year', 'flexible')),
  "status" VARCHAR(20) DEFAULT 'new' CHECK ("status" IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create SavedProperties table (junction table)
CREATE TABLE "SavedProperties" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"("id"),
  "propertyId" INTEGER NOT NULL REFERENCES "Properties"("id"),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "propertyId")
);

-- Create Performance Indexes
CREATE INDEX idx_properties_status_type_featured ON "Properties"("status", "propertyType", "featured");
CREATE INDEX idx_properties_offplan_developer ON "Properties"("isOffplan", "developerId");
CREATE INDEX idx_properties_agent ON "Properties"("agentId");
CREATE INDEX idx_properties_location_city ON "Properties"("location", "city");
CREATE INDEX idx_properties_price_area ON "Properties"("price", "area");
CREATE INDEX idx_properties_bedrooms_bathrooms ON "Properties"("bedrooms", "bathrooms");
CREATE INDEX idx_properties_created ON "Properties"("createdAt");

CREATE INDEX idx_users_email ON "Users"("email");
CREATE INDEX idx_users_role ON "Users"("role");
CREATE INDEX idx_developers_slug ON "Developers"("slug");
CREATE INDEX idx_inquiries_property ON "Inquiries"("propertyId");
CREATE INDEX idx_inquiries_status ON "Inquiries"("status");
CREATE INDEX idx_blogposts_slug ON "BlogPosts"("slug");
CREATE INDEX idx_blogposts_status ON "BlogPosts"("status");

-- Insert sample admin user (password will need to be hashed in real application)
INSERT INTO "Users" ("name", "email", "password", "role", "isActive", "emailVerified") 
VALUES ('Admin User', 'admin@platinumsquare.com', 'temp_password_to_change', 'admin', true, true);

-- Insert sample developer
INSERT INTO "Developers" ("name", "slug", "description", "isActive") 
VALUES ('Sample Developer', 'sample-developer', 'A sample real estate developer for testing', true);

-- Success message
SELECT 'Database tables created successfully! You can now test your API endpoints.' as message;