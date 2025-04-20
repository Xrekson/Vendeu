import { Component } from '@angular/core';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bid',
  standalone: false,
  templateUrl: './bid.component.html',
  styleUrl: './bid.component.scss'
})
export class BidComponent {
  msg: string ='';
  messages: Array<string> = [];
  socketSubsription: Subscription;
  constructor(
    private websoc:WebsocketService
  ){
    // const socketSubsription = new WebSocket('ws:localhost:19090/websoc');
    // socketSubsription.onmessage= (event)=>{
    //   console.log("Connected!" , event);
    // }
    // setTimeout(() => {
    //   socketSubsription.send("Hi!");
    // }, 2000);
    this.socketSubsription = this.websoc.watch("/topic/response").subscribe({
      next: (value)=>{
        console.log("Websock !!!!!!!!!!!",value.body);
        this.messages.push(value.body);
      }
    });
  }
  sendMsg(){
    this.websoc.publish({
      destination: "/app/message",
      body: this.msg,
    })
  }
}
