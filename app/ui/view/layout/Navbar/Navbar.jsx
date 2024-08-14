import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import Avatar from '#ui/view/components/Avatar/Avatar.jsx';
import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar as FlowbiteNavbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from 'flowbite-react';

const Navbar = ({
  logoUrl,
  logoLabel,
  avatarImageUrl,
  userName,
  userEmail,
  menu,
  dropdownMenu,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const onMenuItemClick = useCallback(({ path, onClick }) => {
    return (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (onClick) {
        onClick();
      }
      navigate(path);
    };
  }, [navigate]);

  return (
    // TODO: Implement 'active' state
    <FlowbiteNavbar fluid rounded>
      <NavbarBrand>
        <img src={logoUrl} className="mr-3 h-6 sm:h-9" alt="Logo" />
        {logoLabel &&
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            {logoLabel}
          </span>
        }
      </NavbarBrand>
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar
              alt="User settings"
              img={avatarImageUrl}
              rounded
            />
          }
        >
          <DropdownHeader>
            <span className="block text-sm">{userName}</span>
            <span className="block truncate text-sm font-medium">{userEmail}</span>
          </DropdownHeader>
          {(dropdownMenu || []).map(({ title, path, onClick, divider }) => {
            const DropdownComponent = divider ? DropdownDivider : DropdownItem;
            return (
              <DropdownComponent
                key={`${title}-${path}`}
                onClick={onMenuItemClick({ path, onClick })}
                href={path}
              >
                {title}
              </DropdownComponent>
            );
          })}
        </Dropdown>
        <NavbarToggle />
      </div>
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
    </FlowbiteNavbar>
  );
};

Navbar.propTypes = {
  logoUrl: PropTypes.string.isRequired,
  logoLabel: PropTypes.string,
  avatarImageUrl: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  userEmail: PropTypes.string.isRequired,
  withSignOut: PropTypes.bool,
  menu: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  })),
  dropdownMenu: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    path: PropTypes.string,
    divider: PropTypes.bool,
    onClick: PropTypes.func,
  })),
};

export default Navbar;
