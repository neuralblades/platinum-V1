-- Add missing columns to existing tables
-- Run this in Supabase SQL Editor

-- Add missing columns to BlogPosts table
ALTER TABLE "BlogPosts" 
ADD COLUMN IF NOT EXISTS "metaTitle" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;

-- Add missing columns to Inquiries table
ALTER TABLE "Inquiries" 
ADD COLUMN IF NOT EXISTS "assignedTo" VARCHAR(255);

-- Add missing columns to OffplanInquiries table
ALTER TABLE "OffplanInquiries" 
ADD COLUMN IF NOT EXISTS "projectInterest" VARCHAR(255) NOT NULL DEFAULT 'General Interest',
ADD COLUMN IF NOT EXISTS "budgetRange" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "additionalInfo" TEXT,
ADD COLUMN IF NOT EXISTS "source" VARCHAR(255) DEFAULT 'website',
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "assignedTo" VARCHAR(255);

-- Update OffplanInquiries status enum to include new values
ALTER TABLE "OffplanInquiries" 
DROP CONSTRAINT IF EXISTS "OffplanInquiries_status_check";

ALTER TABLE "OffplanInquiries" 
ADD CONSTRAINT "OffplanInquiries_status_check" 
CHECK ("status" IN ('new', 'in_progress', 'completed', 'closed'));

-- Add missing columns to DocumentRequests table
ALTER TABLE "DocumentRequests" 
ADD COLUMN IF NOT EXISTS "propertyReference" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "additionalInfo" TEXT,
ADD COLUMN IF NOT EXISTS "source" VARCHAR(255) DEFAULT 'website',
ADD COLUMN IF NOT EXISTS "assignedTo" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;

-- Update DocumentRequests status enum
ALTER TABLE "DocumentRequests" 
DROP CONSTRAINT IF EXISTS "DocumentRequests_status_check";

ALTER TABLE "DocumentRequests" 
ADD CONSTRAINT "DocumentRequests_status_check" 
CHECK ("status" IN ('pending', 'completed', 'failed'));

-- Add missing columns to Messages table
ALTER TABLE "Messages" 
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "assignedTo" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "repliedAt" TIMESTAMP;

-- Update Inquiries status enum to include new values
ALTER TABLE "Inquiries" 
DROP CONSTRAINT IF EXISTS "Inquiries_status_check";

ALTER TABLE "Inquiries" 
ADD CONSTRAINT "Inquiries_status_check" 
CHECK ("status" IN ('new', 'in_progress', 'completed', 'closed', 'spam'));

-- Make propertyId optional in various tables
ALTER TABLE "Inquiries" 
ALTER COLUMN "propertyId" DROP NOT NULL;

ALTER TABLE "OffplanInquiries" 
ALTER COLUMN "propertyId" DROP NOT NULL;

ALTER TABLE "DocumentRequests" 
ALTER COLUMN "propertyId" DROP NOT NULL;

-- Make phone required in DocumentRequests
ALTER TABLE "DocumentRequests" 
ALTER COLUMN "phone" SET NOT NULL;

-- Update indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_inquiries_status" ON "Inquiries"("status");
CREATE INDEX IF NOT EXISTS "idx_inquiries_assignedTo" ON "Inquiries"("assignedTo");
CREATE INDEX IF NOT EXISTS "idx_offplan_inquiries_status" ON "OffplanInquiries"("status");
CREATE INDEX IF NOT EXISTS "idx_document_requests_status" ON "DocumentRequests"("status");
CREATE INDEX IF NOT EXISTS "idx_messages_status" ON "Messages"("status");

-- Success message
SELECT 'Database schema updated successfully with missing columns!' as message;