-- Sample Testimonials Data
-- Run this in Supabase SQL Editor

INSERT INTO "Testimonials" (
  "name", "email", "rating", "content", "image", "position", "company", "status", "featured"
) VALUES 
(
  'Sarah Johnson',
  'sarah.johnson@email.com',
  5,
  'Platinum Square helped me find my dream home in Dubai Marina. Their professional service and attention to detail made the entire process smooth and stress-free. I couldn''t be happier with my new waterfront apartment!',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
  'Marketing Director',
  'Tech Solutions Inc',
  'approved',
  true
),
(
  'Ahmed Al-Rashid',
  'ahmed.alrashid@email.com',
  5,
  'Exceptional service from start to finish! The team at Platinum Square went above and beyond to find the perfect villa for my family. Their knowledge of the Dubai real estate market is unmatched.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'CEO',
  'Al-Rashid Holdings',
  'approved',
  true
),
(
  'Elena Rodriguez',
  'elena.rodriguez@email.com',
  5,
  'As a first-time buyer in Dubai, I was nervous about the process. Platinum Square made everything clear and simple. They found me a beautiful apartment in Downtown Dubai within my budget. Highly recommended!',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  'Software Engineer',
  'Global Tech Corp',
  'approved',
  true
),
(
  'Michael Chen',
  'michael.chen@email.com',
  4,
  'Great investment opportunity identified by the Platinum Square team. Their market analysis was spot-on, and the property has already appreciated significantly. Professional and reliable service.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  'Investment Manager',
  'Chen Capital',
  'approved',
  false
),
(
  'Fatima Al-Zahra',
  'fatima.alzahra@email.com',
  5,
  'Selling my property was made effortless by Platinum Square. They handled all the marketing, viewings, and negotiations professionally. Achieved a great price in record time!',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  'Business Owner',
  'Al-Zahra Enterprises',
  'approved',
  false
),
(
  'James Thompson',
  'james.thompson@email.com',
  5,
  'Outstanding customer service and deep market knowledge. Platinum Square helped me navigate the Dubai off-plan market and secure an excellent investment property. Very satisfied with the results.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'Financial Advisor',
  'Thompson & Associates',
  'approved',
  false
);

-- Success message
SELECT 'Sample testimonials added successfully! Your testimonials component should now work.' as message;