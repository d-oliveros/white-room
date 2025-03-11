import { useCallback, useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Navbar as FlowbiteNavbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from 'flowbite-react';

import Avatar from '@web/components/ui/Avatar/Avatar';
import Link from '@web/components/ui/Link/Link';

// Import CSS for hover behavior
import './NavbarStyles.css';

interface MenuItem {
  title: string;
  path: string;
  onClick?: () => void;
}

interface DropdownMenuItem extends MenuItem {
  divider?: boolean;
  danger?: boolean;
}

interface NavbarProps {
  logoUrl: string;
  logoLabel?: string;
  logoLinkTo?: string;
  avatarImageUrl?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  menu?: MenuItem[];
  dropdownMenu?: DropdownMenuItem[];
}

// Downward arrow icon component
const ChevronDownIcon = () => (
  <svg
    className="ml-1 size-4"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d={[
        'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4',
        'a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z',
      ].join(' ')}
      clipRule="evenodd"
    />
  </svg>
);

const Navbar = ({
  logoUrl,
  logoLabel,
  logoLinkTo,
  avatarImageUrl,
  userName,
  userEmail,
  menu,
  dropdownMenu,
}: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const onMenuItemClick = useCallback(
    ({ path, onClick }: { path: string; onClick?: () => void }) => {
      return (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        if (onClick) {
          onClick();
        }
        navigate(path);
      };
    },
    [navigate],
  );

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Manually open the dropdown when the button is clicked
  const handleDropdownClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMouseEnter = () => {
    // Clear any existing timeout to prevent the dropdown from closing
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // Set a timeout to close the dropdown after a short delay
    // This gives the user time to move the mouse to the dropdown menu
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsDropdownOpen(false);
      closeTimeoutRef.current = null;
    }, 300); // 300ms delay before closing
  };

  return (
    <FlowbiteNavbar fluid rounded className="px-4 py-2">
      <NavbarBrand className="pl-4">
        {logoLinkTo ? (
          <Link to={logoLinkTo} onClick={onMenuItemClick({ path: logoLinkTo })}>
            <img src={logoUrl} className="mr-3 h-6 sm:h-9" alt="Logo" />
          </Link>
        ) : (
          <img src={logoUrl} className="mr-3 h-6 sm:h-9" alt="Logo" />
        )}
        {logoLabel && (
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            {logoLabel}
          </span>
        )}
      </NavbarBrand>
      <NavbarCollapse>
        {(menu || []).map(({ title, path, onClick }) => (
          <NavbarLink
            key={`${title}-${path}`}
            active={location.pathname === path}
            href={path}
            onClick={onMenuItemClick({ path, onClick })}
          >
            {title}
          </NavbarLink>
        ))}
      </NavbarCollapse>
      <div className="flex items-center gap-3 pr-4 md:order-2">
        <div
          ref={dropdownRef}
          className="custom-dropdown-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={handleDropdownClick}
            className="custom-dropdown-button flex items-center gap-3"
          >
            <Avatar alt="User settings" img={avatarImageUrl || undefined} rounded />
            {userName && (
              <div className="hidden flex-col text-left md:flex">
                <span className="text-sm font-medium">{userName}</span>
                <span className="flex items-center text-sm text-gray-500">
                  Account Settings
                  <ChevronDownIcon />
                </span>
              </div>
            )}
            {!userName && <ChevronDownIcon />}
          </button>

          {isDropdownOpen && (
            <div
              className="custom-dropdown-menu"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {(userName || userEmail) && (
                <div className="px-4 py-3">
                  <span className="block text-sm">{userName}</span>
                  <span className="block truncate text-sm font-medium">{userEmail}</span>
                </div>
              )}

              {(dropdownMenu || []).map(({ title, path, onClick, divider, danger }) => {
                if (divider) {
                  return (
                    <hr
                      key={`divider-${path}`}
                      className="my-2 border-gray-200 dark:border-gray-600"
                    />
                  );
                }

                return (
                  <button
                    key={`${title}-${path}`}
                    type="button"
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
                      danger ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'
                    }`}
                    onClick={() => {
                      if (onClick) onClick();
                      navigate(path);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <NavbarToggle />
      </div>
    </FlowbiteNavbar>
  );
};

export default Navbar;
