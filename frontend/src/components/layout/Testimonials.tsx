"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getFullImageUrl } from '@/utils/imageUtils';
import { getTestimonials, Testimonial } from '@/services/testimonialService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef<boolean>(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await getTestimonials();
        setTestimonials(response.testimonials);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Add CSS styles to the document
  useEffect(() => {
    // Create a style element for testimonial styles
    const styleElement = document.createElement('style');
    styleElement.id = 'testimonial-styles';
    styleElement.innerHTML = `
      .testimonial-text-truncate {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.6;
        max-height: 4.8em; /* 3 lines × 1.6 line-height */
      }
      
      @keyframes testimonialMarquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(styleElement);

    // Clean up
    return () => {
      const existingStyle = document.getElementById('testimonial-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Handle pause on hover
  const handleMouseEnter = () => {
    isPaused.current = true;
    if (marqueeRef.current) {
      marqueeRef.current.style.animationPlayState = 'paused';
    }
  };

  // Handle resume on mouse leave
  const handleMouseLeave = () => {
    isPaused.current = false;
    if (marqueeRef.current) {
      marqueeRef.current.style.animationPlayState = 'running';
    }
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Render testimonial card
  const renderTestimonialCard = (testimonial: Testimonial, index: number, isDuplicate = false) => (
    <div
      key={isDuplicate ? `duplicate-${testimonial.id}-${index}` : `original-${testimonial.id}`}
      className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col mx-4 min-w-[300px] md:min-w-[350px] transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="flex items-center mb-4">
        <div
          className="relative h-12 w-12 rounded-full overflow-hidden mr-4 transition-transform duration-200 hover:scale-110"
        >
          {testimonial.image ? (
            <Image
              src={getFullImageUrl(testimonial.image)}
              alt={testimonial.name}
              fill
              sizes="(max-width: 768px) 100vw, 48px"
              className="object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 font-medium">
                {testimonial.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{testimonial.name}</h3>
          <p className="text-gray-600">{testimonial.role}</p>
        </div>
      </div>

      <p className="text-gray-700 italic flex-grow testimonial-text-truncate">
        &quot;{testimonial.quote}&quot;
      </p>

      <div className="mt-4">
        {renderStars(testimonial.rating)}
      </div>
    </div>
  );

  // No need for allTestimonials array since we're mapping separately

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="animate-fade-in-up text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what our satisfied clients have to say about their experience with Platinum Square.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="animate-fade-in-up text-center text-red-500 py-8">{error}</div>
        ) : testimonials.length === 0 ? (
          <div className="animate-fade-in-up text-center text-gray-500 py-8">No testimonials available at the moment.</div>
        ) : testimonials.length <= 3 ? (
          // If we have 3 or fewer testimonials, just show them in a grid
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={`grid-${testimonial.id}`}>
                {renderTestimonialCard(testimonial, index, false)}
              </div>
            ))}
          </div>
        ) : (
          // If we have more than 3 testimonials, show them in a marquee
          <div className="relative overflow-hidden">
            <div
              ref={marqueeRef}
              className="flex"
              style={{
                width: 'fit-content',
                animation: 'testimonialMarquee 30s linear infinite'
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* First set of testimonials */}
              {testimonials.map((testimonial, index) => (
                <div key={`original-${testimonial.id}`}>
                  {renderTestimonialCard(testimonial, index, false)}
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {testimonials.map((testimonial, index) => (
                <div key={`duplicate-${testimonial.id}`}>
                  {renderTestimonialCard(testimonial, index, true)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;