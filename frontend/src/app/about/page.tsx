"use client";

import Image from 'next/image';
import Button from '@/components/ui/Button';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CounterAnimation from '@/components/animations/CounterAnimation';

export default function AboutPage() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-500 to-gray-900 text-white py-32">
        <Image src="/images/banner.webp" alt="About Us" fill className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center opacity-100 translate-y-0 transition-all duration-800">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">About Our Company</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-gray-700 to-gray-900 mx-auto mb-8"></div>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <p className="text-xl text-gray-100 mb-8 leading-relaxed">
                We are dedicated to providing exceptional service and finding the perfect property for our clients.
              </p>
            </div>
            <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="inline-block transition-transform duration-200 hover:scale-105 active:scale-95">
                <Button
                  href="/team"
                  variant="accent"
                  size="lg"
                  gradient={true}
                  className="font-medium shadow-lg"
                >
                  Meet Our Team
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'About Us' }
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-left order-2 md:order-1">
              <div className="inline-block px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-200 rounded-full mb-4">Our Journey</div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-gray-700 to-gray-900 mb-8"></div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Founded in 2010, our company has established itself as a leader in the luxury real estate market. Our journey began with a simple mission: to provide exceptional service to clients seeking premium properties in the most desirable locations.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Over the years, we have built a reputation for our attention to detail, market knowledge, and commitment to client satisfaction. Our team of experienced professionals is dedicated to understanding the unique needs and preferences of each client, ensuring a personalized and seamless experience.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Today, our company continues to grow and evolve, but our core values remain the same. We are passionate about real estate and committed to helping our clients find their dream properties or make successful investments.
              </p>
            </div>
            <div className="animate-fade-in-right order-1 md:order-2 relative">
              <div className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-800/20 z-10 rounded-lg"></div>
                <Image
                  src="/images/offplan-header.webp"
                  alt="Our Office"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="animate-fade-in-up text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-200 rounded-full mb-4">What We Stand For</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gray-700 to-gray-900 mx-auto mb-8"></div>
            <p className="text-gray-700 leading-relaxed">
              These principles guide everything we do and define how we serve our clients and community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div style={{animationDelay: '0.2s'}}>
              <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-gray-700 transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl">
                <div className="flex justify-center mb-6 transition-transform duration-200 hover:scale-110 hover:rotate-3">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Integrity</h3>
                <p className="text-gray-700 text-center">
                  We conduct our business with honesty, transparency, and ethical practices, building trust with our clients and partners.
                </p>
              </div>
            </div>

            <div style={{animationDelay: '0.4s'}}>
              <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-gray-600 transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl">
                <div className="flex justify-center mb-6 transition-transform duration-200 hover:scale-110 hover:rotate-3">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Excellence</h3>
                <p className="text-gray-700 text-center">
                  We strive for excellence in everything we do, from the properties we represent to the service we provide to our clients.
                </p>
              </div>
            </div>

            <div style={{animationDelay: '0.6s'}}>
              <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-gray-500 transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl">
                <div className="flex justify-center mb-6 transition-transform duration-200 hover:scale-110 hover:rotate-3">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Client-Focused</h3>
                <p className="text-gray-700 text-center">
                  We put our clients' needs first, providing personalized service and tailored solutions to meet their unique requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-gray-500 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="animate-fade-in-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  <CounterAnimation end={500} suffix="+" className="text-4xl md:text-5xl font-bold" />
                </div>
                <p className="text-gray-200 font-medium">Properties Sold</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  <CounterAnimation end={98} suffix="%" className="text-4xl md:text-5xl font-bold" />
                </div>
                <p className="text-gray-200 font-medium">Client Satisfaction</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  <CounterAnimation end={15} suffix="+" className="text-4xl md:text-5xl font-bold" />
                </div>
                <p className="text-gray-200 font-medium">Years Experience</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  <CounterAnimation end={24} className="text-4xl md:text-5xl font-bold" />
                </div>
                <p className="text-gray-200 font-medium">Expert Agents</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Preview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-200 rounded-full mb-4">Our Experts</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Leadership Team</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gray-700 to-gray-900 mx-auto mb-8"></div>
            <p className="text-gray-700 leading-relaxed mb-8">
              Meet the experienced professionals who lead our company to success.
            </p>
          </div>
          {/* You would fetch and display leadership team members here */}
        </div>
      </section>
    </div>
  );
}
