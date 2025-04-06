import { useState, useEffect, useRef, memo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon,
  BellIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

// Move navigation outside component to prevent recreation on each render
const navigation = [
  { name: 'Company', href: '/company' },
  { name: 'Features', href: '/features' },
  { name: 'Plans', href: '/plans' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Partners', href: '/partners' },
  { name: 'Contact', href: '/contact' },
];

const Header = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = isAuthenticated && !!currentUser;
  
  // Detect scroll to add shadow when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle click outside dropdown menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Handle logout
  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <header className={`fixed w-full top-0 z-50 bg-white ${scrolled ? 'shadow-md' : ''}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center">
            <Logo className="h-8 w-auto text-primary mr-2" />
            <span className="text-2xl font-bold text-primary">Reenter</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => 
                isActive 
                  ? "text-primary font-semibold border-b-2 border-primary" 
                  : "text-gray-700 hover:text-primary font-semibold hover:border-b-2 hover:border-primary transition-all duration-200"
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center text-gray-700 hover:text-primary"
              >
                <UserCircleIcon className="h-6 w-6 mr-1" />
                <span>{currentUser?.name || 'User'}</span>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <Link 
                    to="/dashboard" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <ChartBarSquareIcon className="h-5 w-5 mr-2" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserCircleIcon className="h-5 w-5 mr-2" />
                    Profile
                  </Link>
                  <Link 
                    to="/leases" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                    Leases
                  </Link>
                  <Link 
                    to="/payments" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    Payments
                  </Link>
                  <Link 
                    to="/messages" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Messages
                  </Link>
                  <Link 
                    to="/notifications" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <BellIcon className="h-5 w-5 mr-2" />
                    Notifications
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary font-semibold hover:border-b-2 hover:border-primary px-1">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>

      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center" onClick={() => setMobileMenuOpen(false)}>
              <Logo className="h-8 w-auto text-primary mr-2" />
              <span className="text-2xl font-bold text-primary">Reenter</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <ChartBarSquareIcon className="h-6 w-6 mr-3" />
                        Dashboard
                      </div>
                    </Link>
                    <Link
                      to="/profile"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <UserCircleIcon className="h-6 w-6 mr-3" />
                        Profile
                      </div>
                    </Link>
                    <Link
                      to="/leases"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-6 w-6 mr-3" />
                        Leases
                      </div>
                    </Link>
                    <Link
                      to="/payments"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <CreditCardIcon className="h-6 w-6 mr-3" />
                        Payments
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-red-600 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <ArrowRightOnRectangleIcon className="h-6 w-6 mr-3" />
                        Sign out
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default memo(Header);