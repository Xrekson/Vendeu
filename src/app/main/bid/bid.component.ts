import { Component } from '@angular/core';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '../../services/Store/app.store';
import { Store } from '@ngrx/store';
import { Session } from '../../services/Store/session.model';
import { selectMAIN } from '../../services/Store/session.selectors';

@Component({
  selector: 'app-bid',
  standalone: false,
  templateUrl: './bid.component.html',
  styleUrl: './bid.component.scss'
})
export class BidComponent {
  msg: string = '';
  messages: Array<string> = [];
  socketSubsription: Subscription | undefined;
  headers: any;
  data$: Observable<Session>;
  constructor(
    private websoc: WebsocketService,
    private store: Store<AppState>
  ) {
    // const socketSubsription = new WebSocket('ws:localhost:19090/websoc');
    // socketSubsription.onmessage= (event)=>{
    //   console.log("Connected!" , event);
    // }
    // setTimeout(() => {
    //   socketSubsription.send("Hi!");
    // }, 2000);
    this.data$ = this.store.select(selectMAIN);
    this.data$.subscribe(data => {
      this.headers = {
        Authorization: 'Bearer ' + data.token
      };
      this.socketSubsription = this.websoc.watch("/main/bid/response", this.headers).subscribe({
        next: (value) => {
          console.log("Websock !!!!!!!!!!!", value.body);
          this.messages.push(value.body);
        }
      });
    });
  }
  sendMsg() {

    this.websoc.publish({
      destination: "/auc/biding",
      body: JSON.stringify({
        userId: 121,
        auctionItemId: 258,
        bidAmount: 123456.23
      }),
      headers: this.headers
    })
  }
}
