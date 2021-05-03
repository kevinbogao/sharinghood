export interface UserContext {
  userId: string;
  userName: string;
  email: string;
  isAdmin?: boolean;
  iat: number;
  exp: number;
}
