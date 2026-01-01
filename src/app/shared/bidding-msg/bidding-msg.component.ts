import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {MatListModule} from '@angular/material/list';


@Component({
  selector: 'app-bidding-msg',
  imports: [CommonModule,MatListModule],
  templateUrl: './bidding-msg.component.html',
  styleUrl: './bidding-msg.component.scss'
})
export class BiddingMsgComponent {
  @Input()
  dataMsg: Array<any> = [];
}
