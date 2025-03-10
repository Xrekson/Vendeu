import { createReducer, on } from '@ngrx/store';
import { SessionActions } from './session.actions';
import { Session } from './session.model';

export const initialState: Readonly<Session> = { id: "", username: "", token: "" };

export const collectionReducer = createReducer(
    initialState,
    on(SessionActions.updateSession, (state, { id,
        username,
        token }) => {
        return {
            id,
            username,
            token
        };
    }
    ),
);