import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../api/auth.service";
import type {
  LoginCredentials,
  AuthState,
  User,
  SignupCredentials,
} from "../../types/auth";

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isLoggedIn: false,
  isAuthChecked: false,
};

export const checkIfAuthenticated = createAsyncThunk<{}, void>(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.isAuthorized();
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const signup = createAsyncThunk<
  { user: User; token: string },
  SignupCredentials,
  { rejectValue: string }
>(
  "auth/signup",
  async (credentials: SignupCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.register(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data.message || "Signup failed");
    }
  },
);

export const login = createAsyncThunk<
  { user: User; token: string }, // Return type
  LoginCredentials, // Input type
  { rejectValue: string } // Reject value type
>("auth/login", async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message || "Login failed");
  }
});

// Async thunk for logout (optional, adjust based on your auth.service)
export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || "Logout failed");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Synchronous action to clear errors
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login pending
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    // Login fulfilled
    builder.addCase(
      login.fulfilled,
      (
        state,
        { payload: { user } }: PayloadAction<{ user: User; token: string }>,
      ) => {
        state.isLoading = false;
        state.user = user;
        state.isLoggedIn = true;
        state.error = null;
        state.isAuthChecked = true;
      },
    );
    // Login rejected
    builder.addCase(
      login.rejected,
      (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
        state.isAuthChecked = true;
      },
    );
    // Logout fulfilled
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isLoading = false;
      state.isLoggedIn = false;
      state.error = null;
    });
    // Logout rejected
    builder.addCase(
      logout.rejected,
      (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || "Logout failed";
      },
    );

    // Signup pending
    builder.addCase(signup.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    // Signup fulfilled
    builder.addCase(
      signup.fulfilled,
      (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
      },
    );
    // Signup rejected
    builder.addCase(
      signup.rejected,
      (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || "Signup failed";
      },
    );

    // IsLoggedIn fulfilled
    builder.addCase(
      checkIfAuthenticated.fulfilled,
      (state, { payload: { user } }: PayloadAction<{ user: User }>) => {
        state.isLoggedIn = true;
        state.user = user;
        state.isAuthChecked = true;
      },
    );
    // IsLoggedIn rejected
    builder.addCase(checkIfAuthenticated.rejected, (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.isAuthChecked = true;
    });
  },
});

// Export actions
export const { clearError } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
