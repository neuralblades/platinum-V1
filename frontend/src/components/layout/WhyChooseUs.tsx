"use client";

const WhyChooseUs = () => {
  const features = [
    {
      icon: (
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-300">
          <svg className="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      ),
      title: 'Trusted by Thousands',
      description: 'With over 10 years of experience and thousands of satisfied clients, we are your trusted partner in real estate.',
    },
    {
      icon: (
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-300">
          <svg className="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      ),
      title: 'Exclusive Properties',
      description: 'Access to exclusive properties not available on the open market, giving you an edge in finding your dream home.',
    },
    {
      icon: (
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-300">
          <svg className="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      title: 'Fast & Efficient',
      description: 'Our streamlined process ensures quick responses and efficient handling of all your real estate needs.',
    },
    {
      icon: (
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-300">
          <svg className="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      ),
      title: 'Expert Agents',
      description: 'Our team of experienced agents provides personalized service and expert advice throughout your real estate journey.',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-gray-700 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="animate-fade-in-up text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">Why Choose Us</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            At Platinum Square, we are committed to providing exceptional service and finding the perfect property for our clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="relative bg-gray-50 hover:bg-white cursor-pointer p-6 text-gray-900 rounded-lg text-center transition-all duration-300 group overflow-hidden border border-black hover:scale-105 hover:shadow-2xl">
              {/* Inner shadow overlay that appears on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[inset_0_2px_15px_rgba(0,0,0,0.1),inset_0_-2px_15px_rgba(0,0,0,0.2)]"></div>

              {/* Content */}
              <div className="relative z-10">
                <div
                  className="flex justify-center mb-4 text-gray-700 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
