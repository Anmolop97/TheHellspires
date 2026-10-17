import React from 'react';
import { Avatar } from '@bible-strong/avatar-react';
import novaData from '../data/nova.avatar.json';

export type NovaAnimation = 
  | 'idle' 
  | 'thinking' 
  | 'working' 
  | 'excited' 
  | 'confused' 
  | 'proud' 
  | 'celebrate' 
  | 'curious' 
  | 'searching'
  | 'sleeping';

export type NovaExpression = 
  | 'neutral'
  | 'small-attentive'
  | 'curious-left'
  | 'skeptical-right'
  | 'surprised-left'
  | 'joyful-wide'
  | 'downward-gaze';

interface NovaAvatarProps {
  animation?: NovaAnimation;
  expression?: NovaExpression;
  size?: number | string;
  className?: string;
}

export const NovaAvatar: React.FC<NovaAvatarProps> = ({
  animation = 'idle',
  expression,
  size = 120,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <Avatar
        definition={novaData as any}
        animation={expression ? undefined : (animation as any)}
        expression={expression as any}
        autoplay={true}
        size={size}
      />
    </div>
  );
};
