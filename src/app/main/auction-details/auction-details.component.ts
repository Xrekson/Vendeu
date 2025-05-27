// auction-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing/listing.service';
import { RouterBackService } from '../../services/routerBack.service';
import { CountdownComponent } from 'ngx-countdown';

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TagModule,
    ButtonModule,
    GalleriaModule,
    DividerModule,
    TimelineModule,
    ProgressBarModule,
    InputNumberModule,
    FormsModule,
    CountdownComponent
  ],
  templateUrl: './auction-details.component.html',
  styleUrls: ['./auction-details.component.scss']
})
export class AuctionDetailsComponent implements OnInit {
  auction: any;
  bidAmount: number = 0;
  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private auctionService: ListingService,
    private routerBack : RouterBackService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.getAuctionDetails(id);
  }

  getAuctionDetails(id: string | null): void {
    // In a real app, you would fetch this from a service
    
    
    // Real implementation would look like:
    this.auctionService.getListing(id).subscribe({
      next : (auction) => {
      this.auction = auction;
      this.auction.endTime = this.getTimeRemaining(this.auction.auction_end);
      this.bidAmount = auction.highestbid > 0 ? 
        auction.highestbid + auction.priceInterval : 
        auction.price + auction.priceInterval;
      },
      error : (err)=>{
        console.error(err);
      }
    });
  }

  getAuctionStatus(endDate: string): string {
    const now = new Date();
    const end = new Date(endDate);
    return now > end ? 'Ended' : 'Active';
  }

  getTimeRemaining(endDate: string): any {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Auction ended';

    return diff/1000;
  }

  getProgressValue(startDate: string, endDate: string): number {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    const total = end - start;
    const elapsed = now - start;
    return (elapsed / total) * 100;
  }

  placeBid(): void {
    if (this.bidAmount <= this.auction.highestbid) {
      alert('Bid must be higher than current highest bid');
      return;
    }
    
    // In a real app, you would call a service
    this.auction.highestbid = this.bidAmount;
    alert(`Bid of $${this.bidAmount} placed successfully!`);
    
    // Real implementation would look like:
    // this.auctionService.placeBid(this.auction.id, this.bidAmount).subscribe({
    //   next: (updatedAuction) => {
    //     this.auction = updatedAuction;
    //   },
    //   error: (err) => {
    //     console.error('Error placing bid:', err);
    //   }
    // });
  }

  goBack(){
    // let previous = this.routerBack.getPreviousUrl();
    // debugger
    // if(previous){
    //   this.routerBack.router.navigateByUrl(previous);
    // }
    // else{
      this.routerBack.router.navigate(['dash']);
    // }
  }
}