'use client';

import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/components/chatbot/ChatbotMessage';
import { createInquiry } from './inquiryService';
import { Property } from './propertyService';

// Enhanced predefined responses
const GREETING_RESPONSES = [
  "Hello! Welcome to Luxury Estates. I'm here to help you find your perfect property. Are you looking to buy, sell, or just browse?",
  "Hi there! I'm your AI real estate assistant. How can I help you today - are you interested in buying, selling, or viewing properties?",
  "Welcome to Luxury Estates! I can help you find your dream property, connect you with agents, or answer any questions. What interests you most?"
];

const FALLBACK_RESPONSES = [
  "I want to make sure I understand you correctly. Are you looking to buy, sell, or view properties? Or would you like to speak with an agent?",
  "I'm here to help! Could you tell me if you're interested in buying, selling, or browsing properties?",
  "Let me help you better - are you looking for properties to buy, wanting to sell, or need to speak with one of our agents?"
];

// Enhanced keywords for better intent recognition
const INTENTS = {
  PROPERTY_SEARCH: [
    'find', 'search', 'looking for', 'property', 'house', 'apartment', 'condo', 'buy', 'rent', 'purchase', 
    'want to buy', 'interested in buying', 'looking to buy', 'show me', 'browse', 'explore'
  ],
  PRICE_INQUIRY: [
    'price', 'cost', 'how much', 'afford', 'budget', 'expensive', 'cheap', 'pricing', 'worth', 'value',
    'what does it cost', 'price range', 'affordable', 'within budget'
  ],
  LOCATION_INQUIRY: [
    'where', 'location', 'area', 'neighborhood', 'city', 'near', 'close to', 'address', 'located',
    // Dubai Areas - Premium/Luxury
    'downtown dubai', 'downtown', 'business bay', 'dubai marina', 'marina', 'jbr', 'jumeirah beach residence',
    'palm jumeirah', 'palm', 'jumeirah', 'jumeirah 1', 'jumeirah 2', 'jumeirah 3', 'umm suqeim',
    'difc', 'dubai international financial centre', 'city walk', 'la mer', 'graywaters island',
    'dubai hills estate', 'dubai hills', 'emirates hills', 'meadows', 'springs', 'lakes', 'greens',
    'views', 'jlt', 'jumeirah lake towers', 'tecom', 'barsha heights', 'sheikh zayed road',
    // Dubai Areas - Traditional/Cultural
    'deira', 'bur dubai', 'karama', 'satwa', 'al fahidi', 'bastakiya', 'creek', 'dubai creek',
    'festival city', 'healthcare city', 'academic city', 'knowledge village', 'media city',
    'internet city', 'dubai south', 'al barsha', 'mall of emirates', 'ibn battuta',
    // Dubai Areas - Residential
    'mirdif', 'rashidiya', 'garhoud', 'oud metha', 'bur dubai', 'mankhool', 'al qusais',
    'muhaisnah', 'al mizhar', 'nad al sheba', 'zabeel', 'al wasl', 'al safa', 'al manara',
    'villa', 'townhouse area', 'family area', 'residential area',
    // Dubai Areas - Emerging/New
    'mohammed bin rashid city', 'mbr city', 'meydan', 'nad al sheba', 'sobha hartland',
    'dubai water canal', 'dubai design district', 'd3', 'al jadaf', 'culture village',
    'sports city', 'motor city', 'studio city', 'production city', 'discovery gardens',
    'jvc', 'jumeirah village circle', 'jvt', 'jumeirah village triangle', 'arabian ranches',
    'town square', 'nshama', 'tilal al ghaf', 'dubai land', 'remraam', 'the villa',
    // Dubai Areas - Investment/Affordable
    'international city', 'dragon mart', 'warsan', 'silicon oasis', 'dubiotech', 'impz',
    'dubai investment park', 'dip', 'green community', 'living legends', 'the sustainable city',
    // Dubai Areas - Waterfront/Beach
    'marina walk', 'marina promenade', 'the beach', 'kite beach', 'sunset beach', 'black palace beach',
    'la mer beach', 'jumeirah open beach', 'marina beach', 'jbr beach', 'palm beach',
    // Dubai Transportation Hubs
    'dubai mall', 'mall of emirates', 'ibn battuta mall', 'city centre', 'airport', 'metro station',
    'metro', 'tram', 'near metro', 'walking distance metro'
  ],
  AGENT_CONTACT: [
    'agent', 'speak', 'talk', 'contact', 'call', 'message', 'human', 'person', 'representative', 'sales',
    'speak to someone', 'talk to agent', 'real person', 'contact agent', 'speak with agent'
  ],
  VIEWING_REQUEST: [
    'view', 'visit', 'tour', 'see', 'schedule', 'appointment', 'showing', 'look at', 'check out', 'inspect',
    'visit property', 'schedule viewing', 'book tour', 'arrange visit'
  ],
  GREETING: [
    'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy',
    'what\'s up', 'how are you'
  ],
  HELP: [
    'help', 'assist', 'support', 'guide', 'information', 'info', 'what can you do', 'how does this work',
    'can you help', 'need help', 'assist me'
  ],
  THANKS: ['thanks', 'thank you', 'appreciate', 'grateful', 'thx', 'ty', 'cheers'],
  BUY_INTENT: [
    'want to buy', 'interested in buying', 'looking to buy', 'purchase', 'make an offer', 'buy this', 
    'buy it', 'get this property', 'interested in this', 'i want this'
  ],
  SELL_INTENT: [
    'want to sell', 'interested in selling', 'looking to sell', 'sell my', 'sell a property', 
    'list my home', 'put my house on the market', 'property valuation', 'how much is my house worth'
  ],
  VIEW_LISTINGS: [
    'show listings', 'available listings', 'show available', 'view listings', 'see properties', 
    'show properties', 'show me properties', 'what do you have', 'browse properties', 'available properties'
  ],
  AMENITIES_INQUIRY: [
    'amenities', 'facilities', 'features', 'gym', 'pool', 'parking', 'balcony', 'kitchen', 'furnished',
    'what does it include', 'what features', 'amenities available'
  ],
  FINANCING_INQUIRY: [
    'mortgage', 'loan', 'financing', 'payment plan', 'installment', 'down payment', 'can i finance',
    'payment options', 'bank loan', 'mortgage options'
  ]
};

// Helper function to extract specific information
const extractInfo = (text: string, type: 'phone' | 'email' | 'bedrooms' | 'name'): string | null => {
  const cleanText = text.trim();
  
  switch (type) {
    case 'phone':
      // Enhanced phone detection for UAE numbers
      const phonePatterns = [
        /(\+971|971|0)?[\s-]?5[0-9][\s-]?[0-9]{3}[\s-]?[0-9]{4}/g, // UAE mobile
        /(\+971|971|0)?[\s-]?[2-9][\s-]?[0-9]{3}[\s-]?[0-9]{4}/g, // UAE landline
        /(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,6}/g // International
      ];
      for (const pattern of phonePatterns) {
        const match = cleanText.match(pattern);
        if (match) return match[0].replace(/\s+/g, ' ').trim();
      }
      return null;
      
    case 'email':
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const emailMatch = cleanText.match(emailPattern);
      return emailMatch ? emailMatch[0] : null;
      
    case 'bedrooms':
      // Enhanced bedroom extraction
      const bedroomPatterns = [
        /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|studio)\s*(bed|bedroom|br)s?\b/i,
        /^(\d+|one|two|three|four|five|six|seven|eight|nine|ten|studio)$/i
      ];
      
      for (const pattern of bedroomPatterns) {
        const match = cleanText.match(pattern);
        if (match) {
          const num = match[1].toLowerCase();
          const numberMap: { [key: string]: string } = {
            'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 
            'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10', 'studio': '0'
          };
          return numberMap[num] || num;
        }
      }
      return null;
      
    case 'name':
      // Enhanced name detection with better filtering
      const nameStopWords = [
        'i', 'am', 'is', 'my', 'name', 'the', 'a', 'an', 'and', 'or', 'but', 'call', 'me', 'yes', 'no', 
        'ok', 'okay', 'sure', 'thanks', 'thank', 'you', 'hi', 'hello', 'hey', 'greetings', 'good', 
        'morning', 'afternoon', 'evening', 'buy', 'sell', 'property', 'house', 'apartment'
      ];
      
      // Look for "my name is", "i'm", "call me" patterns first
      const namePatterns = [
        /(?:my name is|i'm|i am|call me|this is)\s+([a-zA-Z\s]{2,30})/i,
        /^([a-zA-Z]{2,15}\s+[a-zA-Z]{2,15})$/i // First Last name pattern
      ];
      
      for (const pattern of namePatterns) {
        const match = cleanText.match(pattern);
        if (match) {
          const extractedName = match[1].trim();
          const words = extractedName.split(/\s+/);
          const validWords = words.filter(word => 
            word.length > 1 && 
            !nameStopWords.includes(word.toLowerCase()) &&
            /^[A-Za-z]+$/.test(word)
          );
          if (validWords.length > 0) {
            return validWords.join(' ');
          }
        }
      }
      
      // Fallback: if input is short and doesn't contain common words
      if (cleanText.length > 1 && cleanText.length < 25 && 
          !nameStopWords.some(word => cleanText.toLowerCase().includes(word)) &&
          !/\d/.test(cleanText) && /^[a-zA-Z\s]+$/.test(cleanText)) {
        return cleanText;
      }
      
      return null;
  }
};

// Generate message functions
export const generateBotMessage = (content: string): ChatMessage => {
  return {
    id: uuidv4(),
    type: 'bot',
    content,
    timestamp: new Date(),
  };
};

export const generateUserMessage = (content: string): ChatMessage => {
  return {
    id: uuidv4(),
    type: 'user',
    content,
    timestamp: new Date(),
  };
};

export const generateAgentMessage = (content: string, agentName: string, agentAvatar?: string): ChatMessage => {
  return {
    id: uuidv4(),
    type: 'agent',
    content,
    timestamp: new Date(),
    sender: {
      name: agentName,
      avatar: agentAvatar,
    },
  };
};

export const getGreetingResponse = (): string => {
  const randomIndex = Math.floor(Math.random() * GREETING_RESPONSES.length);
  return GREETING_RESPONSES[randomIndex];
};

export const getFallbackResponse = (): string => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[randomIndex];
};

// Enhanced intent detection
export const detectIntent = (message: string, conversationState?: ChatbotConversationState): string | null => {
  const lowerMessage = message.toLowerCase().trim();
  
  // Priority 1: Check for specific data patterns FIRST (before name collection)
  if (extractInfo(message, 'phone')) return 'PHONE_PROVIDED';
  if (extractInfo(message, 'email')) return 'EMAIL_PROVIDED';
  if (extractInfo(message, 'bedrooms')) return 'BEDROOM_COUNT';
  
  // Priority 2: Check for property types (before name detection)
  if (/^(apartment|house|condo|villa|penthouse|studio|townhouse|flat|loft|duplex)$/i.test(lowerMessage)) {
    return 'PROPERTY_TYPE';
  }
  
  // Priority 3: Check for simple greetings (exact matches)
  if (/^(hi|hello|hey|hi there|hello there|greetings|good morning|good afternoon|good evening)$/i.test(lowerMessage)) {
    return 'GREETING';
  }
  
  // Priority 4: Check for high-intent phrases (exact or near-exact matches)
  const highIntentPatterns = [
    { pattern: /^(want to buy|interested in buying|looking to buy|buy this|purchase this)$/i, intent: 'BUY_INTENT' },
    { pattern: /^(want to sell|interested in selling|looking to sell|sell my)$/i, intent: 'SELL_INTENT' },
    { pattern: /^(show|view|see)\s+(listings|properties|available)$/i, intent: 'VIEW_LISTINGS' },
    { pattern: /^(speak|talk)\s+(to|with)\s+(agent|someone)$/i, intent: 'AGENT_CONTACT' }
  ];
  
  for (const { pattern, intent } of highIntentPatterns) {
    if (pattern.test(lowerMessage)) return intent;
  }
  
  // Priority 5: Check if we're collecting user info (name detection)
  if (conversationState?.collectingUserInfo) {
    // Only check for name if we explicitly asked for it AND it's not a property type
    if (conversationState.explicitlyAskedForName && !conversationState.userName) {
      // Make sure it's not a property type or other keyword first
      const isPropertyType = /^(apartment|house|condo|villa|penthouse|studio|townhouse|flat|loft|duplex)$/i.test(lowerMessage);
      const isCommonWord = /^(yes|no|maybe|ok|okay|sure|thanks|thank you|hi|hello|hey|buy|sell|rent)$/i.test(lowerMessage);
      
      if (!isPropertyType && !isCommonWord) {
        const extractedName = extractInfo(message, 'name');
        if (extractedName) {
          console.log('Name detected:', extractedName); // Debug log
          return 'NAME_PROVIDED';
        }
        
        // Fallback: if it's a simple text response and we're asking for name
        if (message.trim().length > 1 && message.trim().length < 30 && 
            !/[@#$%^&*(),.?":{}|<>]/.test(message) &&
            !/\d/.test(message)) { // No numbers
          console.log('Fallback name detection:', message.trim()); // Debug log
          return 'NAME_PROVIDED';
        }
      }
    }
  }
  
  // Priority 6: Check for keyword-based intents
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return intent;
      }
    }
  }
  
  return null;
};

// Conversation state interface
export interface ChatbotConversationState {
  collectingUserInfo: boolean;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  propertyInterest?: string;
  propertyType?: string;
  bedroomCount?: string;
  stage: 'greeting' | 'collecting_info' | 'inquiry_submitted' | 'general';
  explicitlyAskedForName?: boolean;
}

// Enhanced response generation
export const generateResponse = (intent: string | null, message: string, conversationState?: ChatbotConversationState, currentProperty?: Property): string => {
  if (!intent) {
    return getFallbackResponse();
  }

  // Handle user information collection flow
  if (conversationState?.collectingUserInfo) {
    if (intent === 'NAME_PROVIDED' && !conversationState.userName) {
      const extractedName = extractInfo(message, 'name');
      if (extractedName) {
        return `Nice to meet you, ${extractedName}! Could you please share your phone number so our agent can reach you?`;
      }
    }

    if (intent === 'PHONE_PROVIDED' && conversationState.userName && !conversationState.userPhone) {
      const phone = extractInfo(message, 'phone');
      if (phone) {
        return `Perfect! I have your details. Our team will contact you at ${phone} shortly. Is there anything specific you'd like them to know about your requirements?`;
      }
    }

    if (intent === 'EMAIL_PROVIDED' && conversationState.userName && conversationState.userPhone && !conversationState.userEmail) {
      return `Excellent! Our agent will reach out to you soon with detailed property information and to schedule a viewing.`;
    }
  }

  switch (intent) {
    case 'GREETING':
      if (currentProperty) {
        return `Welcome! You're viewing ${currentProperty.title} - a beautiful property in ${currentProperty.location} priced at AED ${currentProperty.price.toLocaleString()}. How can I help you with this property today?`;
      }
      return getGreetingResponse();

    case 'HELP':
      if (currentProperty) {
        return `I can help you with information about this property, pricing details, neighborhood info, schedule a viewing, or connect you with the listing agent. What interests you most?`;
      }
      return "I can help you search for properties, get pricing information, learn about locations, schedule viewings, or connect you with our expert agents. What would you like to explore?";

    case 'THANKS':
      const thankResponses = [
        "You're very welcome! Is there anything else I can help you with?",
        "Happy to help! Any other questions about properties or our services?",
        "My pleasure! Feel free to ask if you need anything else."
      ];
      return thankResponses[Math.floor(Math.random() * thankResponses.length)];

    case 'PROPERTY_SEARCH':
      const bedroomCount = extractInfo(message, 'bedrooms');
      if (bedroomCount) {
        return `Great! I can help you find ${bedroomCount === '0' ? 'studio' : bedroomCount + '-bedroom'} properties. What type of property interests you most - apartment, villa, or townhouse?`;
      }
      return "Perfect! I can help you find your ideal property. What type are you looking for (apartment, villa, townhouse), and how many bedrooms do you need?";

    case 'BUY_INTENT':
      if (currentProperty) {
        return `Excellent choice! This ${currentProperty.title} is a fantastic property. To help you with the purchase process, may I get your name so an agent can contact you?`;
      }
      return "Wonderful! I'd love to help you find the perfect property to buy. Could you please share your name so one of our agents can assist you personally?";

    case 'SELL_INTENT':
      return "Great! Our agents provide free property valuations and expert selling advice. Could you share your name so a specialist can contact you about selling your property?";

    case 'PROPERTY_TYPE':
      const propertyType = message.match(/\b(apartment|house|condo|villa|penthouse|studio|townhouse)\b/i)?.[1];
      if (propertyType) {
        return `Excellent choice! ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}s are very popular in Dubai. How many bedrooms are you looking for?`;
      }
      return "Could you tell me more about the specific type of property you're interested in?";

    case 'BEDROOM_COUNT':
      const bedrooms = extractInfo(message, 'bedrooms');
      if (bedrooms) {
        const bedroomText = bedrooms === '0' ? 'Studio' : `${bedrooms}-bedroom`;
        // Set collecting user info state
        if (conversationState) {
          conversationState.collectingUserInfo = true;
          conversationState.explicitlyAskedForName = true;
          conversationState.bedroomCount = bedrooms;
        }
        return `Perfect! ${bedroomText} properties are excellent choices. I can connect you with an agent who specializes in these properties. Could you share your name so they can help you find the best options?`;
      }
      return "How many bedrooms are you looking for in your ideal property?";

    case 'VIEW_LISTINGS':
      // Always try to collect user details instead of just showing listings
      if (conversationState?.bedroomCount && conversationState?.propertyType) {
        return `Perfect! I can help you find ${conversationState.bedroomCount}-bedroom ${conversationState.propertyType} properties. Let me connect you with an agent who can show you the best options. Could you share your name?`;
      } else if (conversationState?.bedroomCount) {
        return `Great! I can help you find ${conversationState.bedroomCount === '0' ? 'studio' : conversationState.bedroomCount + '-bedroom'} properties. Let me connect you with an agent for personalized assistance. Could you share your name?`;
      } else if (conversationState?.propertyType) {
        return `Excellent! I can help you find ${conversationState.propertyType} properties. Let me connect you with an agent who specializes in this type. Could you share your name?`;
      }
      return "I'd love to help you find the perfect property! Let me connect you with one of our expert agents who can show you the best available options. Could you share your name so they can assist you personally?";

    case 'PRICE_INQUIRY':
      if (currentProperty) {
        return `This beautiful property is priced at AED ${currentProperty.price.toLocaleString()}. It offers excellent value in ${currentProperty.location}. Would you like to know about financing options or schedule a viewing?`;
      }
      return "Our properties range from affordable to luxury options. What's your budget range so I can show you suitable properties?";

    case 'LOCATION_INQUIRY':
      if (currentProperty) {
        return `This property is located in ${currentProperty.location} - one of Dubai's most desirable areas with excellent amenities, dining, and transportation links. Would you like me to connect you with an agent for more details?`;
      }
      
      // Check if user mentioned a specific area
      const mentionedArea = message.toLowerCase();
      const popularAreas = {
        'downtown': 'Downtown Dubai offers iconic landmarks like Burj Khalifa and Dubai Mall, with excellent connectivity.',
        'marina': 'Dubai Marina is a stunning waterfront community with high-rise living and marina views.',
        'jbr': 'JBR offers beachfront living with The Beach and The Walk shopping and dining.',
        'business bay': 'Business Bay is Dubai\'s business district with canal views and modern towers.',
        'palm jumeirah': 'Palm Jumeirah is an exclusive man-made island with luxury beachfront properties.',
        'jumeirah': 'Jumeirah areas offer proximity to beaches, parks, and family-friendly communities.',
        'difc': 'DIFC is the financial hub with premium apartments and easy business district access.',
        'dubai hills': 'Dubai Hills Estate offers family villas with golf course views and green spaces.',
        'arabian ranches': 'Arabian Ranches provides luxury villas in a gated golf community.',
        'jlt': 'Jumeirah Lake Towers offers affordable apartments with lake and marina proximity.'
      };
      
      for (const [area, description] of Object.entries(popularAreas)) {
        if (mentionedArea.includes(area)) {
          return `Great choice! ${description} I can connect you with an agent who specializes in ${area.toUpperCase()} properties. Could you share your name so they can assist you?`;
        }
      }
      
      return "Dubai has amazing areas! I can connect you with an agent who knows the best properties in your preferred location. Could you share your name so they can help you find the perfect property?";

    case 'AMENITIES_INQUIRY':
      if (currentProperty) {
        return `This property features premium amenities and modern finishes. Would you like me to schedule a viewing so you can experience all the features firsthand?`;
      }
      return "Our properties feature world-class amenities like swimming pools, gyms, concierge services, and more. What specific amenities are most important to you?";

    case 'FINANCING_INQUIRY':
      return "We work with leading banks in the UAE to offer competitive mortgage rates. Typically, you'll need 20-25% down payment for residents, 30-40% for non-residents. Would you like me to connect you with our mortgage specialist?";

    case 'AGENT_CONTACT':
      if (currentProperty?.agent) {
        return `I'd be happy to connect you with ${currentProperty.agent.firstName || 'our listing agent'} who specializes in this property. Could you please share your name so they can contact you?`;
      }
      return "I'll connect you with one of our experienced agents right away. Could you please provide your name so they can assist you personally?";

    case 'NAME_PROVIDED':
      return `Thank you! Could you please share your phone number so our agent can reach you directly?`;

    case 'PHONE_PROVIDED':
      return `Perfect! Thank you for providing your details. Our expert agent will contact you shortly to assist with your property needs. We appreciate your interest in Luxury Estates!`;

    case 'EMAIL_PROVIDED':
      return `Excellent! Our agent will send you detailed property information and contact you soon. Thank you for your interest!`;

    case 'VIEWING_REQUEST':
      if (currentProperty) {
        return `I'd be happy to arrange a viewing of ${currentProperty.title}! Our agents are available 7 days a week. Could you share your name and preferred time so we can schedule this for you?`;
      }
      return "I can definitely arrange a property viewing for you! Which property interests you, and when would be convenient for you?";

    default:
      return getFallbackResponse();
  }
};

// Submit an inquiry from the chatbot
export const submitInquiry = async (propertyId: string, name: string, email: string, message: string) => {
  try {
    const response = await createInquiry({
      property: propertyId,
      name,
      email,
      message,
    });

    return response;
  } catch (error) {
    console.error('Error submitting inquiry from chatbot:', error);
    throw error;
  }
};