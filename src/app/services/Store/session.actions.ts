import { createAction, props } from '@ngrx/store';
import { Session } from './session.model';

export const updateSession = createAction(
    '[Session Component] Update',
    props<{ session: Session }>()
);
