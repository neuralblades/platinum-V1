'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ChatbotMessage, { ChatMessage } from './ChatbotMessage';
import ChatbotInput from './ChatbotInput';
import {
  generateBotMessage,
  generateUserMessage,
  generateAgentMessage,
  getGreetingResponse,
  detectIntent,
  generateResponse,
  submitInquiry,
  ChatbotConversationState
} from '@/services/chatbotService';
import { createGeneralInquiry } from '@/services/inquiryService';
import { Property } from '@/services/propertyService';
import { useAuth } from '@/contexts/AuthContext';

interface ChatbotProps {
  currentProperty?: Property;
  onRequestAgent?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ currentProperty, onRequestAgent }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [conversationState, setConversationState] = useState<ChatbotConversationState>({
    collectingUserInfo: false,
    stage: 'greeting',
    explicitlyAskedForName: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Initialize chatbot with greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = generateBotMessage(getGreetingResponse());
      setMessages([greeting]);
    }
  }, [messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle user message
  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage = generateUserMessage(content);
    setMessages(prev => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);

    // Detect intent and generate response
    const intent = detectIntent(content, conversationState);
    console.log('Detected intent:', intent, 'for input:', content); // Debug log

    // Update conversation state based on intent
    const updatedState = { ...conversationState };

    // Set collecting user info for intents that should lead to agent contact
    if (intent === 'AGENT_CONTACT' || intent === 'BUY_INTENT' || intent === 'SELL_INTENT' || 
        intent === 'VIEW_LISTINGS' || intent === 'BEDROOM_COUNT' || intent === 'LOCATION_INQUIRY' ||
        intent === 'PROPERTY_TYPE' || intent === 'PROPERTY_SEARCH') {
      updatedState.collectingUserInfo = true;
      updatedState.stage = 'collecting_info';
      updatedState.explicitlyAskedForName = true;
      if (intent === 'BUY_INTENT' && currentProperty) {
        updatedState.propertyInterest = currentProperty.title;
      }
    }

    // Process name if we're explicitly collecting user info and asked for name
    else if (intent === 'NAME_PROVIDED' && updatedState.collectingUserInfo && updatedState.explicitlyAskedForName && !updatedState.userName) {
      // Extract name from user input - use the content directly or try to clean it
      const cleanName = content.trim();
      updatedState.userName = cleanName;
      updatedState.explicitlyAskedForName = false;
      console.log('Name saved:', cleanName); // Debug log
    }

    // Process phone numbers only if we're collecting info and have a name
    else if (intent === 'PHONE_PROVIDED' && updatedState.collectingUserInfo && updatedState.userName && !updatedState.userPhone) {
      updatedState.userPhone = content;
      updatedState.collectingUserInfo = false; // Stop collecting info
      updatedState.stage = 'inquiry_submitted';

      // Submit inquiry immediately after getting phone number
      if (updatedState.userName && updatedState.userPhone) {
        // If we have a specific property, submit inquiry for that property
        if (currentProperty) {
          submitInquiry(
            currentProperty.id,
            updatedState.userName,
            'email_not_provided@placeholder.com',
            `Chatbot inquiry for ${currentProperty.title || 'property'}. Phone: ${content}. Interest: ${updatedState.propertyInterest || 'General inquiry'}`
          ).catch(err => console.error('Error submitting inquiry:', err));
        }
        // Otherwise submit a general inquiry
        else {
          createGeneralInquiry({
            name: updatedState.userName,
            phone: content,
            propertyType: updatedState.propertyType,
            bedroomCount: updatedState.bedroomCount,
            propertyInterest: updatedState.propertyInterest || 'General inquiry',
            message: `Client interested in: ${updatedState.propertyInterest || updatedState.propertyType || (updatedState.bedroomCount ? updatedState.bedroomCount + ' bedroom property' : '') || 'real estate'}`
          }).catch(err => console.error('Error submitting general inquiry:', err));
        }
      }
    }

    // Process emails only if we're collecting info and have a name and phone
    else if (intent === 'EMAIL_PROVIDED' && updatedState.collectingUserInfo && updatedState.userName && updatedState.userPhone && !updatedState.userEmail) {
      updatedState.userEmail = content;

      // If we have name, phone, and email, submit inquiry
      if (updatedState.userName && updatedState.userPhone && currentProperty) {
        submitInquiry(
          currentProperty.id,
          updatedState.userName,
          content,
          `Chatbot inquiry for ${currentProperty.title}. Phone: ${updatedState.userPhone}`
        ).catch(err => console.error('Error submitting inquiry:', err));

        updatedState.stage = 'inquiry_submitted';
      }
    }

    // Store property type and bedroom count
    if (intent === 'PROPERTY_TYPE') {
      updatedState.propertyType = content.trim();
    } else if (intent === 'BEDROOM_COUNT') {
      // Extract bedroom count from content
      const bedroomMatch = content.match(/\b(\d+|one|two|three|four|five|six|studio)\b/i);
      if (bedroomMatch) {
        const num = bedroomMatch[1].toLowerCase();
        const numberMap: { [key: string]: string } = {
          'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'studio': '0'
        };
        updatedState.bedroomCount = numberMap[num] || num;
      } else {
        updatedState.bedroomCount = content.trim();
      }
    }

    setConversationState(updatedState);

    // Simulate typing delay
    setTimeout(() => {
      const responseContent = generateResponse(intent, content, updatedState, currentProperty);
      const botResponse = generateBotMessage(responseContent);

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

      // If inquiry was submitted, add agent message
      if (updatedState.stage === 'inquiry_submitted' && currentProperty?.agent) {
        setTimeout(() => {
          setIsTyping(true);

          setTimeout(() => {
            const agentName = `${currentProperty.agent?.firstName || ''} ${currentProperty.agent?.lastName || ''}`.trim();
            const agentMessage = generateAgentMessage(
              `Hello ${updatedState.userName}, I'm ${agentName}, the listing agent for this property. I'll contact you shortly at ${updatedState.userPhone} to discuss your interest in ${currentProperty.title}.`,
              agentName,
              currentProperty.agent?.avatar
            );

            setMessages(prev => [...prev, agentMessage]);
            setIsTyping(false);
          }, 1500);
        }, 1000);
      }

      // If agent contact is requested and we have a callback
      if (intent === 'AGENT_CONTACT' && onRequestAgent) {
        setTimeout(() => {
          onRequestAgent();
        }, 1000);
      }
    }, 1000 + Math.random() * 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chatbot button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-gray-500 to-gray-900 text-white rounded-full p-3 shadow-lg flex items-center justify-center hover:from-gray-600 hover:to-black transition-all duration-200"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chatbot window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-500 to-gray-900 text-white p-4">
            <h3 className="font-bold">Luxury Estates Assistant</h3>
            <p className="text-xs text-gray-300">
              {currentProperty ? `Helping you with ${currentProperty.title}` : 'Ask me anything about properties'}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <ChatbotMessage key={message.id} message={message} />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="flex-shrink-0 mr-3">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden">
                    <Image
                      src="/images/ai-agent.jpg"
                      alt="Chatbot"
                      className="h-full w-full object-cover"
                      width={32}
                      height={32}
                    />
                  </div>
                </div>
                <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 rounded-tl-none">
                  <div className="flex space-x-1">
                    <div className="bg-gray-500 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="bg-gray-500 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="bg-gray-500 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatbotInput
            onSendMessage={handleSendMessage}
            disabled={isTyping || conversationState.stage === 'inquiry_submitted'}
            placeholder={
              conversationState.stage === 'inquiry_submitted' 
                ? "Thank you! Our agent will contact you soon."
                : conversationState.collectingUserInfo 
                  ? (conversationState.explicitlyAskedForName ? "Please enter your name..." : "Please enter your phone number...")
                  : user ? "Type your message..." : "Type your message or log in to contact an agent"
            }
          />
        </div>
      )}
    </div>
  );
};

export default Chatbot;