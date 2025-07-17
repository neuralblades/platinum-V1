// Import database functions from supabase
import { db } from './supabase';

// Initialize models (if needed for your app)
export const initializeModels = async () => {
  try {
    // Any initialization logic you need
    console.log('Models initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize models:', error);
    throw error;
  }
};

// Export database operations
export const models = {
  Developer: db.developers,
  Property: db.properties,
  User: db.users,
  Blog: db.blogs,
  Testimonial: db.testimonials,
  Inquiry: db.inquiries,
  Team: db.team
};

// Export individual models for convenience
export const {
  Developer,
  Property,
  User,
  Blog,
  Testimonial,
  Inquiry,
  Team
} = models;