import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { fetchWithCsrf, clearCsrfToken } from '@/lib/fetch-with-csrf'

export interface User {
  id: string
  nome: string
  email: string
  theme: string
  locale: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      if (!response.ok) {
        return rejectWithValue('Não autenticado')
      }

      const data = await response.json()
      return data.usuario as User
    } catch (error) {
      return rejectWithValue('Erro ao buscar usuário')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await fetchWithCsrf('/api/auth/logout', {
        method: 'POST'
      })
      clearCsrfToken()
      return null
    } catch (error) {
      return rejectWithValue('Erro ao fazer logout')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    })
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
    })

    builder.addCase(logout.fulfilled, (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
    })
  }
})

export const { setUser, clearUser, setLoading } = authSlice.actions
export default authSlice.reducer
