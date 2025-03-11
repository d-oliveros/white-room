import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Footer as FlowbiteFooter,
  FooterBrand,
  FooterCopyright,
  FooterDivider,
  FooterLink,
  FooterLinkGroup,
} from 'flowbite-react';

interface MenuItem {
  title: string;
  path: string;
  onClick?: () => void;
}

interface FooterProps {
  logoUrl: string;
  logoLabel?: string;
  menu?: MenuItem[];
}

const Footer = ({ logoUrl, logoLabel, menu }: FooterProps) => {
  const navigate = useNavigate();

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

  return (
    <FlowbiteFooter
      container
      theme={{
        root: {
          container: 'w-full p-6',
        },
      }}
    >
      <div className="w-full text-center">
        <div className="w-full justify-between sm:flex sm:items-center sm:justify-between">
          <FooterBrand href="/" src={logoUrl} alt="Logo" name={logoLabel || ''} />
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
        {logoLabel && <FooterCopyright href="#" by={logoLabel} year={2024} />}
      </div>
    </FlowbiteFooter>
  );
};

export default Footer;
