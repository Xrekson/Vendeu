import { Component } from '@angular/core';
import { ListingService } from '../../services/listing/listing.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { GalleriaModule } from 'primeng/galleria';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { ProgressBarModule } from 'primeng/progressbar';
// For dynamic progressbar demo
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { CountdownComponent } from 'ngx-countdown';
import { Observable, timer } from 'rxjs';

@Component({
  selector: 'app-listing',
  imports: [CommonModule,
    CardModule,
    TagModule,
    ButtonModule,
    GalleriaModule,
    DividerModule,
    TimelineModule,
    ProgressBarModule,
  ToastModule,
CountdownComponent],
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.scss'
})
export class ListingComponent {
  listingData: any;
  constructor(private listing:ListingService,private route:Router){
    this.listing.getAllListing().subscribe({
        next: (data)=>{
          console.log(data);
          this.listingData = data;
          this.listingData.map((data: { [x: string]: any; auction_end: string; })=>{
            data['endTime'] = this.getTimeRemaining(data.auction_end);
          })
        },
        error: (err)=>{
          console.error(err);
        }
      })
  }

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
  getToDetails(id:any){
    this.route.navigate(['details',id]);
  }
}
