export interface User {
  id: string;
  username: string;
  email: string;
  image: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}
