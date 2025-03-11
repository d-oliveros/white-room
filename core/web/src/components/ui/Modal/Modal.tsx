import type { ReactNode } from 'react';
import { Modal as FlowbiteModal, type ModalProps as FlowbiteModalProps } from 'flowbite-react';
import { useEffect, useRef } from 'react';

interface ModalProps extends Omit<FlowbiteModalProps, 'show'> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  isOpen?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  marginTop?: string;
  showLogo?: boolean;
  logoEnabled?: boolean;
  dismissOnClickOutside?: boolean;
  stickyFooter?: boolean;
}

const Modal = ({
  size = 'md',
  isOpen = true,
  header,
  footer,
  children,
  shadow = 'lg',
  rounded = 'lg',
  marginTop,
  showLogo = false,
  logoEnabled = false,
  dismissOnClickOutside = true,
  stickyFooter = false,
  onClose,
  ...props
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key press to close the modal
  useEffect(() => {
    if (!onClose) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Hide the close button if no onClose function is provided.
  const theme = {
    header: {
      base: 'flex flex-col p-0 border-none',
      close: {
        base: 'hidden',
      },
    },
    content: {
      base: `min-w-[416px] p-0 overflow-hidden ${
        rounded === 'custom' ? 'rounded-[24px]' : rounded === 'none' ? '' : `rounded-${rounded}`
      } ${
        shadow === 'custom'
          ? 'shadow-[0_15px_35px_rgba(4,15,29,0.1)]'
          : shadow === 'none'
            ? ''
            : `shadow-${shadow}`
      } ${marginTop ? `mt-[${marginTop}]` : ''}`,
    },
    root: {
      base: 'fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full',
      show: {
        on: 'flex bg-[rgb(210,220,231)] bg-opacity-80 dark:bg-opacity-80',
        off: 'hidden',
      },
    },
    body: {
      base: 'p-0 overflow-y-auto max-h-[calc(100vh-200px)]',
    },
    footer: {
      base: 'p-0',
    },
  };

  const wrappedHeader = header ? (
    <div>
      <div className="flex flex-col">
        {logoEnabled && showLogo && (
          <div className="flex justify-center pt-2">
            <img src="/images/logo.svg" alt="Logo" className="h-[71px] w-[142px]" />
          </div>
        )}
        <div
          className={[
            'flex-1 px-4 pb-2 text-center text-[25px] font-semibold',
            logoEnabled && showLogo ? 'pt-0' : 'pt-2',
          ].join(' ')}
        >
          {header}
        </div>
        <div className="h-px w-full bg-[#7B8488] opacity-[0.16]"></div>
      </div>
    </div>
  ) : null;

  // Determine if we need to add padding to the bottom of the body for sticky footer
  const bodyPaddingClass = stickyFooter && footer ? 'pb-[120px]' : '';

  // Handle clicks on modal content to prevent closing the modal when clicking inside
  const handleModalContentClick = (e: React.MouseEvent) => {
    // Stop the event from propagating to parent modal
    e.stopPropagation();
  };

  // Handle clicks on modal backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if click target is the backdrop itself (not modal content)
    if (onClose && dismissOnClickOutside && modalRef.current) {
      // Check if the click target is the modal content or a child of it
      if (!modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
  };

  return (
    <div onClick={handleBackdropClick}>
      <FlowbiteModal
        show={isOpen}
        popup={!header}
        size={size}
        theme={theme}
        dismissible={false} // Disable Flowbite's built-in dismissible behavior
        onClose={onClose}
        {...props}
      >
        <div ref={modalRef} onClick={handleModalContentClick}>
          {wrappedHeader}
          <FlowbiteModal.Body
            className={`max-h-[calc(100vh-200px)] overflow-y-auto px-[45px] py-4 ${bodyPaddingClass} `}
          >
            {children}
          </FlowbiteModal.Body>
          {footer && (
            <FlowbiteModal.Footer
              className={`pb-4 ${
                stickyFooter
                  ? 'absolute inset-x-0 bottom-0 z-50 overflow-hidden border-t border-gray-200 bg-white'
                  : ''
              } ${
                stickyFooter && rounded === 'custom'
                  ? 'rounded-b-[24px]'
                  : stickyFooter && rounded === 'xl'
                    ? 'rounded-b-xl'
                    : stickyFooter && rounded !== 'none'
                      ? 'rounded-b-lg'
                      : ''
              }`}
            >
              {footer}
            </FlowbiteModal.Footer>
          )}
          {!footer && <div className="pb-4" />}
        </div>
      </FlowbiteModal>
    </div>
  );
};

export default Modal;
