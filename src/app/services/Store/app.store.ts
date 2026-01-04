import { Session } from "./session.model";

export interface AppState {
    session: Session;
    cart: Array<CartItem>;
}

export interface CartItem {
    id: string;
    auctionId: string;
    auctionName: string;
    currentBid: number;
    myBid: number;
    imageUrl: string;
    endsAt: string;
    status: 'active' | 'won' | 'lost' | 'pending';
}