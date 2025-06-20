
export const ROLES = {
  ROOT: 'ROOT',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const ROOT_EMAIL = "nifaduzzaman2005@gmail.com";
