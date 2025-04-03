import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

const partners = [
  {
    name: 'Property Management Co.',
    logo: (
      <svg className="h-12 w-auto text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    name: 'Real Estate Agency',
    logo: (
      <svg className="h-12 w-auto text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Insurance Provider',
    logo: (
      <svg className="h-12 w-auto text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    name: 'Legal Services',
    logo: (
      <svg className="h-12 w-auto text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    name: 'Banking Partner',
    logo: (
      <svg className="h-12 w-auto text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
        <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 6.75a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75H8.25zm4.498 0a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-.008zm4.752 0a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-.008z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Payment Processing',
    logo: (
      <svg className="h-12 w-auto text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
      </svg>
    ),
  },
  {
    name: 'Accounting Software',
    logo: (
      <svg className="h-12 w-auto text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
      </svg>
    ),
  },
];

export default function Partners() {
  const controls = useAnimation();

  useEffect(() => {
    let isMounted = true;
    
    const animate = async () => {
      if (!isMounted) return;
      
      try {
        await controls.start({
          x: [-2400, 0],
          transition: {
            duration: 60,
            ease: "linear",
            repeat: Infinity,
          },
        });
      } catch (err) {
        console.error("Animation error:", err);
      }
    };
    
    // Slight delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      animate();
    }, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      controls.stop();
    };
  }, [controls]);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by Industry Leaders
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              We work with the best in the business to provide you with the most comprehensive rental solution.
            </p>
          </div>
          <div className="relative mt-16 overflow-hidden">
            <motion.div
              animate={controls}
              className="flex gap-x-8"
            >
              {[...partners, ...partners, ...partners].map((partner, index) => (
                <div key={`${partner.name}-${index}`} className="flex-none w-48 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    {partner.logo}
                    <span className="mt-4 text-sm text-gray-500">{partner.name}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 