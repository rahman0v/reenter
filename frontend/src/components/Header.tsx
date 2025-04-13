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
import NotificationDropdown from './NotificationDropdown';

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
    <header className="fixed w-full top-0 z-50">
      <nav 
        className={`mx-auto transition-all duration-300`}
        aria-label="Global"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <Logo className="h-8 w-auto text-primary" />
                <span className="text-xl font-semibold text-gray-900">Reenter</span>
              </Link>
            </div>

            {/* Main Navigation */}
            <div className="hidden lg:flex lg:items-center lg:gap-x-6 bg-white/30 hover:bg-white/40 px-6 py-2 rounded-full backdrop-blur-sm shadow-sm transition-all duration-200">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) => 
                    `relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "text-primary" 
                        : "text-gray-600 hover:text-gray-900"
                    } after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100 ${
                      isActive ? "after:scale-x-100" : ""
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* User Section */}
            <div className="hidden lg:flex lg:items-center lg:gap-x-6 bg-white/30 hover:bg-white/40 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm transition-all duration-200">
              {isLoggedIn ? (
                <div className="relative flex items-center space-x-4" ref={dropdownRef}>
                  <NotificationDropdown />
                  <div className="h-8 w-px bg-gray-200/50" aria-hidden="true" />
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center justify-center w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {currentUser?.photo_url ? (
                      <img
                        className="h-8 w-8 rounded-full ring-2 ring-white"
                        src={currentUser.photo_url}
                        alt=""
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-medium text-sm ring-2 ring-white">
                        {currentUser?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg py-2 z-10 border border-white/20 top-full">
                      {/* Dashboard - Primary Action */}
                      <Link 
                        to="/dashboard" 
                        className="block px-5 py-3 text-base font-semibold text-gray-900 hover:bg-gray-50 flex items-center"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ChartBarSquareIcon className="h-5 w-5 mr-3 text-primary" />
                        Dashboard
                      </Link>

                      <div className="my-2 border-t border-gray-100" />

                      {/* Core Features Group */}
                      <Link 
                        to="/profile" 
                        className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserCircleIcon className="h-5 w-5 mr-3" />
                        Profile
                      </Link>
                      <Link 
                        to="/leases" 
                        className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <BuildingOfficeIcon className="h-5 w-5 mr-3" />
                        Leases
                      </Link>
                      <Link 
                        to="/payments" 
                        className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <CreditCardIcon className="h-5 w-5 mr-3" />
                        Payments
                      </Link>
                      <Link 
                        to="/messages" 
                        className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <EnvelopeIcon className="h-5 w-5 mr-3" />
                        Messages
                      </Link>

                      <div className="my-2 border-t border-gray-100" />

                      {/* Settings Group */}
                      <Link 
                        to="/settings" 
                        className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Cog6ToothIcon className="h-5 w-5 mr-3" />
                        Settings
                      </Link>

                      <div className="my-2 border-t border-gray-100" />

                      {/* Sign Out */}
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-gray-50 flex items-center"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-x-4">
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-gray-700 hover:text-primary relative after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
                  >
                    Log in
                  </Link>
                  <div className="h-4 w-px bg-gray-200/50" aria-hidden="true" />
                  <Link
                    to="/signup"
                    className="rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-primary-dark transition-all duration-200"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-2.5 text-gray-700 bg-white/30 hover:bg-white/40 backdrop-blur-sm shadow-sm transition-all duration-200"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white/80 backdrop-blur-md px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
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