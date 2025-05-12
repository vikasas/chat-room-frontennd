// utils/avatar.ts
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

export const getAvatarSvg = (name: string) => {
  const avatar = createAvatar(avataaars, {
    seed: name,
  });
  return avatar.toString(); // returns a base64 SVG image URI
};
