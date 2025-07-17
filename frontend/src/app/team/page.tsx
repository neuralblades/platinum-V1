'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { getTeamMembers, TeamMember } from '@/services/teamService';
import Breadcrumb from '@/components/ui/Breadcrumb';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Single team member card component used for both leadership and regular team
const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 group relative mx-[2rem]">
      {/* Image with overlay on hover */}
      <div className="relative h-84 overflow-hidden">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Social icons that appear on hover */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4 translate-y-10 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-800 hover:bg-gray-700 hover:text-white transition-colors"
              title="Email"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          )}

          {member.phone && (
            <a
              href={`tel:${member.phone}`}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-800 hover:bg-gray-700 hover:text-white transition-colors"
              title="Call"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
          )}

          {member.whatsapp && (
            <a
              href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, '')}`}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-800 hover:bg-green-600 hover:text-white transition-colors"
              title="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
        <p className="text-gray-700 text-sm font-medium mb-2">{member.role}</p>

        {/* Languages */}
        {member.languages && member.languages.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Languages:</span> {member.languages.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const response = await getTeamMembers();
        if (response.success) {
          setTeamMembers(response.teamMembers);
        } else {
          setError(response.message || 'Failed to fetch team members');
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('An error occurred while fetching team members');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Filter for leadership team
  const leadershipTeam = teamMembers.filter(member => member.isLeadership);

  // Filter for other team members
  const otherTeamMembers = teamMembers.filter(member => !member.isLeadership);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && teamMembers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button href="/" variant="primary" gradient={true}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-500 to-gray-900 text-white py-32">
        <Image src="/images/banner.webp" alt="About Us" fill className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Meet Our Team</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-gray-700 to-gray-900 mx-auto mb-8"></div>
            <p className="text-xl text-gray-100 mb-8 leading-relaxed">
              Our experienced professionals are dedicated to providing exceptional service and finding the perfect property for you.
            </p>
          </div>
        </div>
      </div>

      {/* Leadership Team Section */}
      {leadershipTeam.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Our Team' }
                ]}
              />
            </div>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-block px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-200 rounded-full mb-4">Our Leaders</div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Leadership Team</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gray-700 to-gray-900 mx-auto mb-8"></div>
              <p className="text-gray-700 leading-relaxed">
                Meet the experienced professionals who lead our company to success and ensure we deliver exceptional service to our clients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {leadershipTeam.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Quote Section */}
      {leadershipTeam.length > 0 && (
        <section className="py-20 bg-gradient-to-r from-gray-700 to-gray-900 text-white relative">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <svg className="w-12 h-12 text-white mx-auto mb-6 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-2xl md:text-3xl font-light italic mb-8 leading-relaxed">
                &quot;Our team is committed to understanding each client&apos;s unique needs and preferences, ensuring a personalized and seamless real estate experience.&quot;
              </p>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={leadershipTeam[0].image}
                    alt={leadershipTeam[0].name}
                    width={48}
                    height={48}
                    className="object-cover"
                    style={{ width: 'auto', height: 'auto', maxWidth: '48px', maxHeight: '48px' }}
                  />
                </div>
                <div className="text-left">
                  <p className="font-bold">{leadershipTeam[0].name}</p>
                  <p className="text-gray-300 text-sm">{leadershipTeam[0].role}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Other Team Members Section */}
      {otherTeamMembers.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-block px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-200 rounded-full mb-4">Our Experts</div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Specialists</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gray-700 to-gray-900 mx-auto mb-8"></div>
              <p className="text-gray-700 leading-relaxed">
                Our team of specialists brings diverse expertise to ensure all your real estate needs are met with excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {otherTeamMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Join Our Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-block px-3 py-1 text-sm font-semibold text-gray-800 bg-white rounded-full mb-4">Careers</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Our Team</h2>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  We&apos;re always looking for talented individuals who are passionate about real estate and committed to providing exceptional service to clients.
                </p>
                <Button
                  href="/careers"
                  variant="primary"
                  size="lg"
                  gradient={true}
                  className="font-medium"
                >
                  View Open Positions
                </Button>
              </div>
              <div className="relative h-64 md:h-full rounded-xl overflow-hidden">
                <Image
                  src="/images/team.jpg"
                  alt="Team collaboration"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-800/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}