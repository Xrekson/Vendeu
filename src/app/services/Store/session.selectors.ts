import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Session } from './session.model';

// Use createFeatureSelector for better modularity
export const selectSession = createFeatureSelector<Session>('session');

export const selectMAIN = createSelector(
    selectSession,
    (state) => state // No need for extra return statement
);
