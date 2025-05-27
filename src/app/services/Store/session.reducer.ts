import { createReducer, on } from '@ngrx/store';
import { updateSession } from './session.actions';
import { Session } from './session.model';

export const initialState: Session = { id: null, username: null, token: null, type : null };

export const sessionReducer = createReducer(
  initialState,
  on(updateSession, (_state, { session }) => ({
    ..._state, 
    ...session // Corrected to spread session data properly
  }))
);
