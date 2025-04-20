import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-bidding-msg',
  imports: [CommonModule,CardModule],
  templateUrl: './bidding-msg.component.html',
  styleUrl: './bidding-msg.component.scss'
})
export class BiddingMsgComponent {
  @Input()
  dataMsg: Array<any> = [];
}
