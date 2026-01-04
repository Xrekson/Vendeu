import { createReducer, on } from '@ngrx/store';
import { 
    updateSession, 
    loginSuccess, 
    logout, 
    clearSession, 
    restoreSession, 
    updateToken,
    loginFailure 
} from './session.actions';
import { Session, createInitialSession } from './session.model';

export const initialState: Session = createInitialSession();

export const sessionReducer = createReducer(
  initialState,
  
  on(updateSession, (state, { session }) => ({
    ...state,
    ...session,
    isAuthenticated: !!session.token
  })),
  
  on(loginSuccess, (state, { session }) => ({
    ...session,
    isAuthenticated: true
  })),
  
  on(loginFailure, (state) => ({
    ...createInitialSession(),
    isAuthenticated: false
  })),
  
  on(logout, () => createInitialSession()),
  
  on(clearSession, () => createInitialSession()),
  
  on(restoreSession, (state, { session }) => ({
    ...session,
    isAuthenticated: !!session.token
  })),
  
  on(updateToken, (state, { token }) => ({
    ...state,
    token,
    // Optionally update expiresAt if token refresh changes expiry
    expiresAt: state.expiresAt // Keep existing or recalculate if needed
  }))
);