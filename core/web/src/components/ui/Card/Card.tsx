import type { ReactNode } from 'react';
import { Card as FlowbiteCard } from 'flowbite-react';

interface CardProps {
  href?: string;
  children: ReactNode;
}

const Card = ({ href, children }: CardProps) => {
  return (
    <FlowbiteCard href={href} className="max-w-sm">
      {children}
    </FlowbiteCard>
  );
};

export default Card;
