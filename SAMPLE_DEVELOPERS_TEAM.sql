-- Sample Developers and Team Members Data
-- Run this in Supabase SQL Editor

-- Add more developers to complement the existing Sample Developer
INSERT INTO "Developers" (
  "name", "slug", "description", "logo", "website", "established", "isActive"
) VALUES 
(
  'Emaar Properties',
  'emaar-properties',
  'Emaar Properties is a leading real estate development company based in Dubai, known for iconic projects like Burj Khalifa and Dubai Mall.',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
  'https://www.emaar.com',
  1997,
  true
),
(
  'DAMAC Properties',
  'damac-properties',
  'DAMAC Properties is a luxury real estate developer known for delivering iconic residential, commercial and leisure properties across the Middle East.',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
  'https://www.damacproperties.com',
  2002,
  true
),
(
  'Nakheel',
  'nakheel',
  'Nakheel is a Dubai-based property developer, known for developing some of the most iconic landmarks including Palm Jumeirah.',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
  'https://www.nakheel.com',
  2000,
  true
),
(
  'Dubai Properties',
  'dubai-properties',
  'Dubai Properties is one of the largest real estate developers in Dubai, creating vibrant communities and world-class developments.',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
  'https://www.dubaiproperties.ae',
  2004,
  true
);

-- Add sample team members
INSERT INTO "TeamMembers" (
  "name", "position", "email", "phone", "bio", "image", "socialLinks", "isActive"
) VALUES 
(
  'Mohammed Al-Hassan',
  'Chief Executive Officer',
  'mohammed@platinumsquare.com',
  '+971 50 123 4567',
  'With over 15 years of experience in Dubai real estate, Mohammed leads our team with vision and expertise in luxury property development and investment.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
  '{"linkedin": "https://linkedin.com/in/mohammed-hassan", "twitter": "https://twitter.com/mhhassan"}',
  true
),
(
  'Sarah Johnson',
  'Head of Sales',
  'sarah@platinumsquare.com',
  '+971 50 234 5678',
  'Sarah brings international experience from London and New York markets, specializing in high-end residential properties and client relations.',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300',
  '{"linkedin": "https://linkedin.com/in/sarah-johnson", "instagram": "https://instagram.com/sarahjohnson"}',
  true
),
(
  'Ahmed Rashid',
  'Senior Property Consultant',
  'ahmed@platinumsquare.com',
  '+971 50 345 6789',
  'Ahmed is a Dubai native with deep knowledge of local market trends and regulations. He specializes in off-plan investments and commercial properties.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
  '{"linkedin": "https://linkedin.com/in/ahmed-rashid", "whatsapp": "+971503456789"}',
  true
),
(
  'Elena Rodriguez',
  'Marketing Director',
  'elena@platinumsquare.com',
  '+971 50 456 7890',
  'Elena leads our digital marketing strategies and brand development, with expertise in luxury real estate marketing and international client acquisition.',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
  '{"linkedin": "https://linkedin.com/in/elena-rodriguez", "twitter": "https://twitter.com/elenarod"}',
  true
),
(
  'Raj Patel',
  'Investment Advisor',
  'raj@platinumsquare.com',
  '+971 50 567 8901',
  'Raj provides strategic investment advice to clients, with deep expertise in ROI analysis, market research, and portfolio optimization for real estate investments.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
  '{"linkedin": "https://linkedin.com/in/raj-patel", "email": "raj@platinumsquare.com"}',
  true
),
(
  'Fatima Al-Zahra',
  'Customer Relations Manager',
  'fatima@platinumsquare.com',
  '+971 50 678 9012',
  'Fatima ensures exceptional customer experience throughout the buying process, managing client relationships and coordinating property viewings and transactions.',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
  '{"linkedin": "https://linkedin.com/in/fatima-alzahra", "phone": "+971506789012"}',
  true
);

-- Success message
SELECT 'Sample developers and team members added successfully!' as message;