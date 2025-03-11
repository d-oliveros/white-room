import Modal from '@web/components/ui/Modal/Modal';
import Link from '@web/components/ui/Link/Link';

interface PageModalProps {
  title?: string;
  backgroundUrl?: string;
  footerLinkUrl?: string;
  footerLinkLabel?: string;
  children?: React.ReactNode;
  showLogo?: boolean;
}

const PageModal = ({
  title,
  backgroundUrl,
  footerLinkUrl,
  footerLinkLabel,
  children,
  showLogo = false,
}: PageModalProps) => {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat"
      style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : undefined}
    >
      <div className="w-full">
        <Modal
          isOpen
          header={title}
          rounded="custom"
          shadow="custom"
          marginTop="34px"
          className="rounded-[14px]"
          logoEnabled
          showLogo={showLogo}
        >
          {children}
          {footerLinkUrl && footerLinkLabel && (
            <div className="mt-4 text-center">
              <Link to={footerLinkUrl}>{footerLinkLabel}</Link>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PageModal;
