import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Basic',
    price: 'Free',
    description: 'Perfect for individual landlords with up to 2 properties',
    features: [
      'Digital Leasing',
      'Rent Collection',
      'Basic Dashboard',
    ],
    cta: 'Get Started',
    href: '/signup',
    featured: false,
  },
  {
    name: 'Premium',
    price: '$29',
    period: '/month',
    description: 'Ideal for growing property managers with up to 10 properties',
    features: [
      'All Basic features',
      'Advance Analytics',
      'Tax reports',
      'Legal support',
      '24/7 Customer support (AI Agent)',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large property management companies with unlimited properties',
    features: [
      'Everything in Premium',
      'Extended coverage',
      'Custom solutions & services',
      'Dedicated account manager',
      'Priority support',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    featured: false,
  },
];

const Plans = () => {
  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2
            className="text-base font-semibold leading-7 text-primary-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Pricing
          </motion.h2>
          <motion.p
            className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Choose the right plan for you
          </motion.p>
          <motion.p
            className="mt-6 text-lg leading-8 text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Start with our free plan and upgrade as you grow. All plans include our core features.
          </motion.p>
        </div>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 ${
                plan.featured ? 'bg-white shadow-xl' : 'bg-white/60'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <h3 className="text-lg font-semibold leading-8 text-gray-900">{plan.name}</h3>
              <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-sm font-semibold leading-6 text-gray-600">{plan.period}</span>}
              </p>
              <Link
                to={plan.href}
                className={`mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  plan.featured
                    ? 'bg-primary-600 text-white hover:bg-primary-500 focus-visible:outline-primary-600'
                    : 'bg-white text-primary-600 ring-1 ring-inset ring-primary-200 hover:ring-primary-300'
                }`}
              >
                {plan.cta}
              </Link>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Plans; 