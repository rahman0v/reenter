import { useState } from 'react';

interface Partner {
  id: number;
  name: string;
  logo: string;
  description: string;
  website: string;
}

export default function Partners() {
  const [partners] = useState<Partner[]>([
    {
      id: 1,
      name: 'Property Management Co.',
      logo: '/logos/partner1.png',
      description: 'Leading property management solutions for landlords and tenants.',
      website: 'https://example.com/partner1'
    },
    {
      id: 2,
      name: 'Real Estate Services',
      logo: '/logos/partner2.png',
      description: 'Comprehensive real estate services for all your needs.',
      website: 'https://example.com/partner2'
    },
    // Add more partners as needed
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          Our Partners
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          We work with industry leaders to provide you with the best property management experience.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="relative group bg-white rounded-xl shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-emerald-200 transition duration-300"
          >
            <div className="p-6">
              <div className="aspect-[3/2] overflow-hidden rounded-lg bg-gray-100 mb-6">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-full w-full object-contain object-center"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {partner.name}
                </h3>
                <p className="mt-3 text-sm text-gray-500">
                  {partner.description}
                </p>
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Visit Website
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 