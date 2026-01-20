export type UserRole = 'USER' | 'ADMIN';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRole;
    };
  }
}

export {};
