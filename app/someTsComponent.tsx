import React, { ReactNode } from 'react';
import { Card as FlowbiteCard } from 'flowbite-react';
import someTsFile from './someTsFile.ts';

// import styles from '../whiteroom/client/style/tailwind.css';

interface CardProps {
  href?: string;
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ href, children }) => {
  return (
    <FlowbiteCard href={href} className="max-w-sm">
      {children}
    </FlowbiteCard>
  );
};

console.log('TESTING TS FILE: (should be 6)');
console.log(someTsFile(5));

export default Card;
