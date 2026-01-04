import { createAction, props } from '@ngrx/store';
import { Session } from './session.model';

// Update session
export const updateSession = createAction(
    '[Session Component] Update Session',
    props<{ session: Session }>()
);

// Login action (optional, for tracking login in effects)
export const login = createAction(
    '[Auth Service] Login',
    props<{ username: string; password: string }>()
);

// Login success
export const loginSuccess = createAction(
    '[Auth Service] Login Success',
    props<{ session: Session }>()
);

// Login failure
export const loginFailure = createAction(
    '[Auth Service] Login Failure',
    props<{ error: string }>()
);

// Logout action
export const logout = createAction(
    '[Session Component] Logout'
);

// Logout success
export const logoutSuccess = createAction(
    '[Auth Service] Logout Success'
);

// Clear session data (for manual cleanup)
export const clearSession = createAction(
    '[Session Component] Clear Session'
);

// Restore session from storage
export const restoreSession = createAction(
    '[App Init] Restore Session',
    props<{ session: Session }>()
);

// Update token (for token refresh)
export const updateToken = createAction(
    '[Auth Service] Update Token',
    props<{ token: string }>()
);