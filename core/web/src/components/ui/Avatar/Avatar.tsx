import { Avatar as FlowbiteAvatar, type AvatarProps as FlowbiteAvatarProps } from 'flowbite-react';

interface AvatarProps extends Omit<FlowbiteAvatarProps, 'rounded'> {
  rounded?: boolean;
}

const Avatar = ({ img, alt, rounded = true, ...props }: AvatarProps) => {
  return <FlowbiteAvatar img={img} alt={alt} rounded={rounded} {...props} />;
};

export default Avatar;
