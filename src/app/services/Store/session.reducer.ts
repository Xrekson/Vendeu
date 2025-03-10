import { createReducer, on } from '@ngrx/store';

import { SessionApiActions } from './session.actions';
import { Session } from './session.model';

export const initialState: Session = {id:"",username:"",token:""};

export const sessionReducer = createReducer(
  initialState,
  on(SessionApiActions.retrievedSession, (_state, { session }) => session)
);