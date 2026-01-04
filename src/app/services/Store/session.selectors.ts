import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Session, isSessionValid } from './session.model';

// Use createFeatureSelector for better modularity
export const selectSession = createFeatureSelector<Session>('session');

// Select entire session state
export const selectMAIN = createSelector(
    selectSession,
    (state) => state
);

// Select specific properties
export const selectUserId = createSelector(
    selectSession,
    (state) => state.id
);

export const selectUsername = createSelector(
    selectSession,
    (state) => state.username
);

export const selectToken = createSelector(
    selectSession,
    (state) => state.token
);

export const selectUserType = createSelector(
    selectSession,
    (state) => state.type
);

export const selectIsAuthenticated = createSelector(
    selectSession,
    (state) => state.isAuthenticated
);

export const selectIsSessionValid = createSelector(
    selectSession,
    (state) => isSessionValid(state)
);

export const selectExpiresAt = createSelector(
    selectSession,
    (state) => state.expiresAt
);

export const selectLastLogin = createSelector(
    selectSession,
    (state) => state.lastLogin
);

// Derived selectors
export const selectIsAdmin = createSelector(
    selectUserType,
    (type) => type === 'admin'
);

export const selectIsBuyer = createSelector(
    selectUserType,
    (type) => type === 'buyer'
);

export const selectIsSeller = createSelector(
    selectUserType,
    (type) => type === 'seller'
);

// Time remaining until token expiry (in seconds)
export const selectTimeUntilExpiry = createSelector(
    selectExpiresAt,
    (expiresAt) => {
        if (!expiresAt) return 0;
        const now = Math.floor(Date.now() / 1000);
        return Math.max(0, expiresAt - now);
    }
);

// Check if token is about to expire (less than 5 minutes)
export const selectIsTokenExpiringSoon = createSelector(
    selectTimeUntilExpiry,
    (timeRemaining) => timeRemaining > 0 && timeRemaining < 300 // 5 minutes
);