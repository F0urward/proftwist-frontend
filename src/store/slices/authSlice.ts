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
};

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
    } catch (error: any) {
      return rejectWithValue(error.message || "Signup failed");
    }
  },
);

export const login = createAsyncThunk<
  { user: User; token: string }, // Return type
  LoginCredentials, // Input type
  { rejectValue: string } // Reject value type
>("auth/login", async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials); // Call API
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message || "Login failed");
  }
});

// Async thunk for logout (optional, adjust based on your auth.service)
export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Optionally call logoutUser from auth.service if it exists
      localStorage.removeItem("token");
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
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
      (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
      },
    );
    // Login rejected
    builder.addCase(
      login.rejected,
      (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
      },
    );
    // Logout fulfilled
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isLoading = false;
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
  },
});

// Export actions
export const { clearError } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
