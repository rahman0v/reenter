import { Link } from 'react-router-dom';

const navigation = {
  about: [
    { name: 'About Us', href: '/about' },
    { name: 'Mission', href: '/mission' },
    { name: 'Team', href: '/team' },
  ],
  product: [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/plans' },
    { name: 'Partners', href: '/partners' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'User Agreement', href: '/agreement' },
  ],
  contact: [
    { name: 'Email', href: 'mailto:contact@reenter.com' },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/reenter' },
    { name: 'Twitter', href: 'https://twitter.com/reenter' },
    { name: 'Instagram', href: 'https://instagram.com/reenter' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              Reenter
            </Link>
            <p className="text-sm leading-6 text-gray-600">
              Making leasing easier and safer for everyone. Join us in revolutionizing the rental experience.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900">About</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.about.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm leading-6 text-gray-600 hover:text-primary-600">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm leading-6 text-gray-600 hover:text-primary-600">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm leading-6 text-gray-600 hover:text-primary-600">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Get in Touch</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.contact.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-600 hover:text-primary-600">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} Reenter. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 