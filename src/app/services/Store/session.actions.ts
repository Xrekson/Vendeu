import { createActionGroup, props } from '@ngrx/store';
import { Session } from './session.model';

export const SessionActions = createActionGroup({
    source: 'Session',
    events: {
        'Update Session': props<{
            id: string,
            username: string,
            token: string,
        }>(),
    },
});

export const SessionApiActions = createActionGroup({
    source: 'Session API',
    events: {
        'Retrieved Session': props<{ session: Session }>(),
    },
});