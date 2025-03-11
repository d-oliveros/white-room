import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
  return <div className="mx-auto max-w-6xl px-6 pb-12">{children}</div>;
};

export default PageContainer;
