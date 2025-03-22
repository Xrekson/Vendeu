import { Session } from "./session.model";

export interface AppState {
    session: Session;
    cart: Array<any>;
}
