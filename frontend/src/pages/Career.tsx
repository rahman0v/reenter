import React from 'react';
import { motion } from 'framer-motion';

export default function Career() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Join Our Mission at Reenter
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Help us revolutionize the rental experience in Turkey and beyond
          </p>
        </motion.div>

        {/* Introduction Section */}
        <motion.div
          className="mx-auto max-w-4xl mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-primary-50 rounded-2xl p-8 md:p-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-6">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-8 h-8 text-primary-600"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              We're Transforming Real Estate in Turkey
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Reenter is an ambitious PropTech startup on a mission to revolutionize the rental experience. 
              We're building an integrated platform that brings security, convenience, and trust to the 
              lease management process.
            </p>
            <p className="text-lg text-gray-700">
              As a fast-growing startup, we offer unique opportunities for professional growth, 
              innovation, and impact. Our team members enjoy significant autonomy, diverse challenges, 
              and the chance to help shape the future of property rental in Turkey and beyond.
            </p>
          </div>
        </motion.div>

        {/* Why Join Us Section */}
        <motion.div
          className="mx-auto max-w-4xl mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-center mb-12">Why Join Reenter?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="w-6 h-6 text-primary-600"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Startup Growth</h3>
              <p className="text-gray-600">
                Experience rapid professional development as we scale. Your contributions will have a direct impact on our company's success.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="w-6 h-6 text-primary-600"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Innovative Culture</h3>
              <p className="text-gray-600">
                Work in a creative environment where your ideas matter. We value initiative and fresh perspectives.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="w-6 h-6 text-primary-600"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Collaborative Team</h3>
              <p className="text-gray-600">
                Join a diverse, passionate team united by our mission to transform real estate. We support each other and grow together.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          className="mx-auto max-w-4xl mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-center mb-12">Benefits & Perks</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-5 h-5 text-green-600"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" 
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Competitive Salary & Equity</h3>
                <p className="text-gray-600">We offer attractive compensation packages with potential equity options, allowing you to share in our success.</p>
              </div>
            </div>

            <div className="flex items-start p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-5 h-5 text-blue-600"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Health & Wellness</h3>
                <p className="text-gray-600">Comprehensive health insurance and wellness programs to ensure your physical and mental wellbeing.</p>
              </div>
            </div>

            <div className="flex items-start p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-5 h-5 text-yellow-600"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Flexible Work</h3>
                <p className="text-gray-600">Enjoy a hybrid work model with flexible schedules that prioritize results over rigid hours.</p>
              </div>
            </div>

            <div className="flex items-start p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-5 h-5 text-purple-600"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" 
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Learning & Development</h3>
                <p className="text-gray-600">Continuous learning opportunities through workshops, courses, and conferences to enhance your skills.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Open Positions Section */}
        <motion.div
          className="mx-auto max-w-4xl mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-center mb-12">Open Positions</h2>
          
          <div className="space-y-6">
            {/* Software Engineer Team */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-5 h-5 text-indigo-600"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold">Software Engineer Team</h3>
                  </div>
                  <p className="text-gray-600 max-w-xl">
                    Join our engineering team to build and scale our platform. We're looking for frontend, backend, and fullstack engineers passionate about creating innovative solutions.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    View Openings
                  </button>
                </div>
              </div>
            </div>

            {/* Sales Team */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-5 h-5 text-green-600"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold">Sales Team</h3>
                  </div>
                  <p className="text-gray-600 max-w-xl">
                    Drive our growth by connecting with landlords and property managers. We're seeking relationship-builders who can demonstrate our platform's value.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    View Openings
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Service Team */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-5 h-5 text-blue-600"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold">Customer Service Team</h3>
                  </div>
                  <p className="text-gray-600 max-w-xl">
                    Be the voice of Reenter, providing exceptional support to our users. We're looking for empathetic communicators who can solve problems effectively.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    View Openings
                  </button>
                </div>
              </div>
            </div>

            {/* Finance and Accounting Team */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-5 h-5 text-yellow-600"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 01-.75.75h-.75m0-1.5h.75a.75.75 0 01.75.75v.75m0 0H18.75m.75.75H18a.75.75 0 01-.75-.75v-.75m0 0H4.5m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m0 0v-.375c0-.621.504-1.125 1.125-1.125H4.5m0-4.5v.75A.75.75 0 013 11.25h-.75" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold">Finance & Accounting Team</h3>
                  </div>
                  <p className="text-gray-600 max-w-xl">
                    Manage our financial operations and help guide strategic decisions. We need detail-oriented professionals who can build scalable financial systems.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    View Openings
                  </button>
                </div>
              </div>
            </div>

            {/* HR & Legal Team */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-5 h-5 text-purple-600"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold">HR & Legal Team</h3>
                  </div>
                  <p className="text-gray-600 max-w-xl">
                    Support our growth while maintaining compliance in the complex real estate and financial sectors. We're seeking HR and legal experts who can navigate regulatory environments.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    View Openings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mx-auto max-w-4xl mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-primary-600 text-white rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-6">Can't Find the Right Role?</h2>
            <p className="text-lg mb-8">
              We're always looking for talented individuals who share our vision. Submit your resume for future consideration.
            </p>
            <button className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-md transition-colors">
              Send Your CV
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 