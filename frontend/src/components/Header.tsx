import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
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

const navigation = [
  { name: 'Company', href: '/company' },
  { name: 'Features', href: '/features' },
  { name: 'Plans', href: '/plans' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Partners', href: '/partners' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isLoggedIn = isAuthenticated && !!currentUser;
  
  // Log authentication state on mount for debugging
  useEffect(() => {
    console.log('Header - Auth state:', { 
      isAuthenticated, 
      currentUser: currentUser ? `${currentUser.name} (${currentUser.email})` : 'none', 
      role: currentUser?.role
    });
  }, [isAuthenticated, currentUser]);

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

  // Close dropdown when clicking outside
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
  }, []);

  // Handle logout
  const handleLogout = () => {
    console.log('Logging out user');
    
    // Clear all authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    
    // Call the context logout function
    logout();
    
    // Close dropdown
    setDropdownOpen(false);
    
    // Force navigation to home page and reset state
    window.location.href = '/';
  };

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2 transition-transform hover:scale-105">
            <HomeIcon className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">Reenter</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
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
                `text-sm font-semibold leading-6 relative px-1 py-2 transition-colors
                ${isActive 
                  ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' 
                  : 'text-gray-900 hover:text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-bottom-left'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center focus:outline-none"
              >
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden">
                  {currentUser.photo_url ? (
                    <img 
                      src={currentUser.photo_url} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium">
                      {currentUser.name.charAt(0)}
                    </span>
                  )}
                </div>
              </button>
              
              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none transform opacity-100 scale-100 transition duration-200 ease-in-out">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                    <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <ChartBarSquareIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Profile
                    </Link>
                    <Link
                      to="/messages"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="relative mr-3">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
                      </div>
                      Messages
                    </Link>
                    <Link
                      to="/notifications"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="relative mr-3">
                        <BellIcon className="h-5 w-5 text-gray-400" />
                        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                      </div>
                      Notifications
                    </Link>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/leases"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <BuildingOfficeIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Leases
                    </Link>
                    <Link
                      to="/payments"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <CreditCardIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Payments
                    </Link>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Settings
                    </Link>
                    <Link
                      to="/"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Log out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary px-4 py-2 rounded-md transition-all hover:bg-gray-50 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:mx-auto after:w-0 hover:after:w-3/4 after:h-0.5 after:bg-primary after:transition-all after:duration-300"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold leading-6 text-white bg-primary hover:bg-primary-600 px-4 py-2 rounded-md transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <HomeIcon className="h-6 w-6 text-primary" />
              <span className="font-semibold text-xl">Reenter</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {isLoggedIn && (
                  <>
                    <div className="px-3 py-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden mr-3">
                          {currentUser.photo_url ? (
                            <img 
                              src={currentUser.photo_url} 
                              alt="Profile" 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium">
                              {currentUser.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-base font-medium text-gray-800">{currentUser.name}</p>
                          <p className="text-sm text-gray-500">{currentUser.email}</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center -mx-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ChartBarSquareIcon className="mr-3 h-6 w-6 text-gray-400" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center -mx-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserCircleIcon className="mr-3 h-6 w-6 text-gray-400" />
                      Profile
                    </Link>
                    <Link
                      to="/messages"
                      className="flex items-center -mx-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="relative mr-3">
                        <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
                      </div>
                      Messages
                    </Link>
                    <Link
                      to="/leases"
                      className="flex items-center -mx-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BuildingOfficeIcon className="mr-3 h-6 w-6 text-gray-400" />
                      Leases
                    </Link>
                    <Link
                      to="/payments"
                      className="flex items-center -mx-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <CreditCardIcon className="mr-3 h-6 w-6 text-gray-400" />
                      Payments
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center -mx-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="mr-3 h-6 w-6 text-gray-400" />
                      Settings
                    </Link>
                  </>
                )}
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `-mx-3 block rounded-lg px-3 py-3 text-base font-semibold leading-7 active:bg-gray-100 
                      ${isActive 
                        ? 'text-primary border-l-4 border-primary pl-2' 
                        : 'text-gray-900 hover:bg-gray-50'
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
              {!isLoggedIn && (
                <div className="py-6 space-y-3">
                  <Link
                    to="/login"
                    className="-mx-3 block rounded-lg px-3 py-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="-mx-3 block rounded-lg px-3 py-3 text-base font-semibold leading-7 text-white bg-primary hover:bg-primary-600 active:bg-primary-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
              {isLoggedIn && (
                <div className="py-6">
                  <Link
                    to="/"
                    className="flex items-center -mx-3 rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 text-gray-400" />
                    Log out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
} 