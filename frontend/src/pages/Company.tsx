import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  PresentationChartLineIcon,
  ClockIcon,
  ChartPieIcon,
  CubeTransparentIcon,
  ScaleIcon,
  LightBulbIcon,
  UsersIcon,
  ArrowLongRightIcon,
} from '@heroicons/react/24/outline';
import Partners from '../components/Partners';

const problems = [
  {
    title: 'Fragmented Processes',
    description: 'Leases, payments, maintenance, and legal issues happen across multiple disconnected channels.',
    icon: ChartBarIcon,
  },
  {
    title: 'Lack of Transparency',
    description: 'Limited visibility into rental processes and decision-making, no clear system of evaluation or trust before signing.',
    icon: DocumentTextIcon,
  },
  {
    title: 'Inefficient Financial Management',
    description: 'Heavy deposits, cash flow uncertainty, and missed tax reporting make the system hard to manage.',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'Dispute Resolution Challenges',
    description: 'Time-consuming and costly conflict resolution processes, When issues arise, there is no streamlined way to mediate or support legal clarity',
    icon: UserGroupIcon,
  },
  {
    title: 'Limited Data Insights',
    description: 'Lack of actionable data for informed decision-making, Landlords guess. Tenants hope.',
    icon: ChartPieIcon,
  },
];

const solutions = [
  {
    title: 'All-in-One Platform',
    description: 'Unified platform for listing, leasing, payments, documentation, and support',
    icon: PresentationChartLineIcon,
  },
  {
    title: 'AI-Powered Matching',
    description: 'Intelligent tenant and property matching for optimal relationships',
    icon: ChartBarIcon,
  },
  {
    title: 'Flexible Financial Model',
    description: 'Replace large deposits with affordable monthly premiums',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'Automated Tools',
    description: 'Streamlined tax reporting and documentation processes',
    icon: ClockIcon,
  },
  {
    title: 'Real-Time Analytics',
    description: 'Comprehensive dashboards for all platform users',
    icon: ChartPieIcon,
  },
];

const values = [
  {
    title: 'Trust through Technology',
    description: 'We leverage AI and data to create transparent, reliable rental experiences.',
    icon: CubeTransparentIcon,
  },
  {
    title: 'Financial Fairness',
    description: 'We eliminate unnecessary financial burdens for tenants while securing income for landlords.',
    icon: ScaleIcon,
  },
  {
    title: 'Empowerment through Simplicity',
    description: 'We make complex processes intuitive so everyone can make confident decisions.',
    icon: LightBulbIcon,
  },
  {
    title: 'Partnership, Not Gatekeeping',
    description: 'We connect stakeholders as partners rather than adversaries in the rental ecosystem.',
    icon: UsersIcon,
  },
];

const valueProps = {
  landlords: [
    'Guaranteed Rent Payments',
    'Verified Tenant Pool',
    'Automated Management Tools',
    'Property Protection Coverage',
    'Tax & Legal Support',
  ],
  tenants: [
    'No Large Deposits',
    'Flexible Monthly Payments',
    'Quick Application Process',
    'Full Rental Protection',
    'Transparent Terms',
  ],
  agents: [
    'Monthly Commission',
    'CRM Tools Included',
    'Lead Generation',
    'Transaction Management',
    'Performance Analytics',
  ],
};

const plans = [
  {
    name: 'Basic',
    price: 'Free',
    features: [
      '2 properties',
      'Digital Leasing',
      'Rent Collection',
      'Basic Dashboard',
    ],
  },
  {
    name: 'Premium',
    price: '$19/mo',
    features: [
      'Up to 10 properties',
      'All Basic features',
      'Advance Analytics',
      'Tax reports',
      'Legal support',
      '24/7 Customer support (AI Agent)',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Unlimited properties',
      'Everything in Premium',
      'Extended coverage',
      'Custom solutions & services',
      'Dedicated account manager',
      'Personalized support',
    ],
  },
];

const steps = [
  {
    title: 'Property Listing',
    description: 'Landlord or agent lists a property with detailed information',
  },
  {
    title: 'Tenant Application',
    description: 'Tenant applies and verifies their data through our platform',
  },
  {
    title: 'AI Matching',
    description: 'Our AI suggests optimal matches and pricing',
  },
  {
    title: 'Digital Lease',
    description: 'All parties sign the digital lease agreement',
  },
  {
    title: 'Active Protection',
    description: 'Payments are automated and insurance is activated',
  },
];

export default function Company() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 pt-14">
        <div className="absolute inset-0 -z-10 opacity-30">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M0 32V0h32v32H0z" fill="none" stroke="currentColor" strokeOpacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
          <motion.div 
            className="w-full mx-auto max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl text-center">
            Reenter is reimagining how people rent — with smarter risk models, financial ease, and trust at the core of every lease
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-100 text-center mx-auto max-w-3xl">
            Reenter is a rental management platform that brings landlords and tenants together and offers flexible financial solutions to the rental market. It introduces an innovative solution to revolutionize risk assessment, property evaluation, and tenant compatibility by leveraging AI-powered algorithms that ensure landlords mitigate the risk while tenants avoid unnecessary financial burdens. We aim to bring visibility and trust by transforming the conventional rental ecosystem
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/signup"
                className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Get Started
              </Link>
              <Link to="/features" className="text-sm font-semibold leading-6 text-gray-200 hover:text-white">
                Learn More <span aria-hidden="true">→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <motion.div 
          className="mx-auto max-w-4xl lg:text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-base font-semibold leading-7 text-primary text-center">Our Purpose</h2>
          <div className="mt-16 grid gap-16 sm:grid-cols-2">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-4">Mission</h3>
              <p className="text-lg leading-8 text-gray-600">
              To simplify and secure rental relationships by eliminating financial burdens, providing full protection, and connecting the right people to the right properties — through intelligent, automated systems.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-4">Vision</h3>
              <p className="text-lg leading-8 text-gray-600">
              To become the go-to rental ecosystem in Turkey and beyond, where AI-powered leasing replaces outdated processes, and landlords, tenants, and real estate agents interact with transparency, protection, and peace of mind.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Our Values */}
      <div className="bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl lg:text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary">Principles</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Values
            </p>
          </motion.div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              {values.map((value) => (
                <motion.div 
                  key={value.title}
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20 mb-4">
                    <value.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    {value.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{value.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Problems We're Solving */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl lg:text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary">Challenges</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Problems We're Solving
            </p>
          </motion.div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {problems.map((problem) => (
                <motion.div 
                  key={problem.title}
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <problem.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                    {problem.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{problem.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Our Solution */}
      <div className="bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl lg:text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary">Solutions</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How We're Solving It
            </p>
          </motion.div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {solutions.map((solution) => (
                <motion.div 
                  key={solution.title}
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <solution.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                    {solution.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{solution.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl lg:text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary">Value Proposition</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Benefits for Everyone
            </p>
          </motion.div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <motion.div 
                className="rounded-2xl bg-white p-8 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">For Landlords</h3>
                <ul className="space-y-4">
                  {valueProps.landlords.map((prop) => (
                    <li key={prop} className="flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 text-primary mr-2" />
                      <span>{prop}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div 
                className="rounded-2xl bg-white p-8 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">For Tenants</h3>
                <ul className="space-y-4">
                  {valueProps.tenants.map((prop) => (
                    <li key={prop} className="flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 text-primary mr-2" />
                      <span>{prop}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div 
                className="rounded-2xl bg-white p-8 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.8 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">For Agents</h3>
                <ul className="space-y-4">
                  {valueProps.agents.map((prop) => (
                    <li key={prop} className="flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 text-primary mr-2" />
                      <span>{prop}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tiers */}
      <div className="bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl lg:text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Choose Your Plan
            </p>
          </motion.div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.2 }}
              >
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3 className="text-lg font-semibold leading-8 text-gray-900">{plan.name}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    {plan.price}
                  </p>
                  <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <ShieldCheckIcon className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/contact"
                  className={`mt-8 block rounded-md px-3.5 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
                    ${plan.name === 'Premium' 
                      ? 'bg-primary text-white shadow-sm hover:bg-primary-600 focus-visible:outline-primary' 
                      : 'bg-gray-50 text-primary hover:bg-gray-100'}`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works - Flow Diagram */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-2xl lg:text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.4 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary">Process</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </p>
          </motion.div>
          <div className="mx-auto mt-16 max-w-6xl">
            <div className="relative">
              {/* Flow Diagram */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-slate-300 -translate-y-1/2 z-0"></div>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    className="relative z-10 bg-white rounded-xl shadow-md p-6 flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 2.6 + index * 0.1 }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary mb-4">
                      <span className="text-lg font-semibold text-white">{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-semibold leading-8 text-gray-900 text-center">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-base leading-7 text-gray-600 text-center">{step.description}</p>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20">
                        <ArrowLongRightIcon className="h-6 w-12 text-primary" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Partners />
        </div>
      </div>

      {/* Join the Movement CTA */}
      <div className="relative bg-gradient-to-r from-slate-800 to-primary-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]"></div>
        <div className="mx-auto max-w-7xl py-16 px-6 sm:py-24 lg:px-8 relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-8">
              Let's redesign the rental experience — together.
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              <Link
                to="/partners"
                className="rounded-md bg-white px-5 py-3 text-md font-semibold text-slate-800 shadow-sm hover:bg-gray-100"
              >
                Become a Partner
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-primary px-5 py-3 text-md font-semibold text-white shadow-sm hover:bg-primary-600 border border-white"
              >
                Try Reenter
              </Link>
              <Link
                to="/contact"
                className="rounded-md bg-transparent px-5 py-3 text-md font-semibold text-white shadow-sm hover:bg-slate-700/50 border border-white"
              >
                Request Pitch Deck
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 