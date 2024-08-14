import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Footer as FlowbiteFooter,
  FooterBrand, FooterCopyright,
  FooterDivider,
  FooterLink,
  FooterLinkGroup,
} from 'flowbite-react';

const Footer = ({ logoUrl, logoLabel, menu }) => {
  const navigate = useNavigate();

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
    <FlowbiteFooter container>
      <div className="w-full text-center">
        <div className="w-full justify-between sm:flex sm:items-center sm:justify-between">
          <FooterBrand
            href="https://flowbite.com"
            src={logoUrl}
            alt="Logo"
            name={logoLabel || ''}
          />
          <FooterLinkGroup>
            {(menu || []).map(({ title, path, onClick }) => (
              <FooterLink
                key={`${title}-${path}`}
                href={path}
                onClick={onMenuItemClick({ path, onClick })}
              >
                {title}
              </FooterLink>
            ))}
          </FooterLinkGroup>
        </div>
        <FooterDivider />
        {logoLabel &&
          <FooterCopyright href="#" by={logoLabel} year={2024} />
        }
      </div>
    </FlowbiteFooter>
  );
}

Footer.propTypes = {
  logoUrl: PropTypes.string.isRequired,
  logoLabel: PropTypes.string,
  menu: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  })),
};

export default Footer;

