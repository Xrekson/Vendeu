import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Custom Components
import { CarouselComponent } from '../../shared/carousel/carousel.component'; 

// Services
import { ListingService } from '../../services/listing/listing.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

interface AuctionImage {
  url: string;
  alt: string;
}

interface Auction {
  id: string;
  name: string;
  price: number;
  highestbid: number;
  priceInterval: number;
  detail: string;
  auction_start: string;
  auction_end: string;
  images: string[];
  category?: string;
  condition?: string;
  location?: string;
  seller?: {
    id: string;
    name: string;
    rating: number;
  };
}

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatStepperModule,
    MatDialogModule,
    // Custom Components
    CarouselComponent,
    MatProgressSpinner
],
  templateUrl: './auction-details.component.html',
  styleUrls: ['./auction-details.component.scss']
})
export class AuctionDetailsComponent implements OnInit, OnDestroy {
  auction: Auction | null = null;
  bidAmount: number = 0;
  minBid: number = 0;
  timeRemaining: string = '';
  auctionProgress: number = 0;
  isAuctionActive: boolean = false;
  selectedImageIndex: number = 0;
  
  // Carousel settings
  carouselImages: any[] = [];
  
  // Timer
  private destroy$ = new Subject<void>();
  private updateInterval = 1000; // 1 second
  
  // Tabs
  selectedTabIndex = 0;
  
  // Mock data for bids history (replace with real API)
  bidsHistory = [
    { bidder: 'John Doe', amount: 3500, time: '2024-01-15T14:30:00Z' },
    { bidder: 'Jane Smith', amount: 3200, time: '2024-01-15T13:45:00Z' },
    { bidder: 'Bob Wilson', amount: 3000, time: '2024-01-15T12:15:00Z' }
  ];

  @ViewChild('bidInput') bidInput!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auctionService: ListingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAuctionDetails(id);
    }
    
    // Start timer for real-time updates
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAuctionDetails(id: string): void {
    this.auctionService.getListing(id).subscribe({
      next: (auction) => {
        this.auction = auction;
        this.initializeAuctionData();
      },
      error: (err) => {
        console.error('Error loading auction:', err);
        this.snackBar.open('Failed to load auction details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/dash']);
      }
    });
  }

  initializeAuctionData(): void {
    if (!this.auction) return;

    // Prepare images for carousel
    this.carouselImages = this.auction.images.map((img, index) => ({
      id: index + 1,
      imageUrl: img,
      altText: `${this.auction!.name} - Image ${index + 1}`,
      title: this.auction!.name
    }));

    // Calculate initial values
    this.calculateMinBid();
    this.bidAmount = this.minBid;
    this.updateAuctionStatus();
    
    // Set up carousel if no images
    if (this.carouselImages.length === 0) {
      this.carouselImages = [{
        id: 1,
        imageUrl: 'assets/default-auction.jpg',
        altText: 'No images available',
        title: this.auction.name
      }];
    }
  }

  calculateMinBid(): void {
    if (!this.auction) return;
    this.minBid = this.auction.highestbid > 0 
      ? this.auction.highestbid + this.auction.priceInterval 
      : this.auction.price + this.auction.priceInterval;
  }

  updateAuctionStatus(): void {
    if (!this.auction) return;
    
    const now = new Date();
    const start = new Date(this.auction.auction_start);
    const end = new Date(this.auction.auction_end);
    
    this.isAuctionActive = now >= start && now <= end;
    
    // Update time remaining
    this.updateTimeRemaining();
    
    // Update progress
    this.updateAuctionProgress();
  }

  updateTimeRemaining(): void {
    if (!this.auction || !this.isAuctionActive) {
      this.timeRemaining = 'Auction ended';
      return;
    }

    const now = new Date();
    const end = new Date(this.auction.auction_end);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      this.timeRemaining = 'Auction ended';
      this.isAuctionActive = false;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      this.timeRemaining = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      this.timeRemaining = `${hours}h ${minutes}m ${seconds}s`;
    } else {
      this.timeRemaining = `${minutes}m ${seconds}s`;
    }
  }

  updateAuctionProgress(): void {
    if (!this.auction) return;

    const now = new Date();
    const start = new Date(this.auction.auction_start);
    const end = new Date(this.auction.auction_end);

    if (now >= end) {
      this.auctionProgress = 100;
    } else if (now <= start) {
      this.auctionProgress = 0;
    } else {
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      this.auctionProgress = (elapsed / totalDuration) * 100;
    }
  }

  startTimer(): void {
    interval(this.updateInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateAuctionStatus();
      });
  }

  placeBid(): void {
    if (!this.auction) return;

    if (this.bidAmount < this.minBid) {
      this.snackBar.open(`Bid must be at least $${this.minBid}`, 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Bid',
        message: `Are you sure you want to place a bid of $${this.bidAmount}?`,
        confirmText: 'Place Bid',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Call API to place bid
        // this.auctionService.placeBid(this.auction!.id, this.bidAmount).subscribe({
        //   next: (updatedAuction) => {
        //     this.auction = updatedAuction;
        //     this.calculateMinBid();
        //     this.bidAmount = this.minBid;
            
        //     this.snackBar.open('Bid placed successfully!', 'Close', {
        //       duration: 3000,
        //       panelClass: ['success-snackbar']
        //     });
        //   },
        //   error: (err) => {
        //     console.error('Error placing bid:', err);
        //     this.snackBar.open('Failed to place bid. Please try again.', 'Close', {
        //       duration: 3000,
        //       panelClass: ['error-snackbar']
        //     });
        //   }
        // });
      }
    });
  }

  incrementBid(): void {
    if (!this.auction) return;
    this.bidAmount += this.auction.priceInterval;
  }

  decrementBid(): void {
    if (!this.auction) return;
    const newBid = this.bidAmount - this.auction.priceInterval;
    if (newBid >= this.minBid) {
      this.bidAmount = newBid;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  goBack(): void {
    this.router.navigate(['/dash']);
  }

  // Getter for current bid status color
  getBidStatusColor(): string {
    if (!this.auction) return 'warn';
    return this.auction.highestbid > 0 ? 'accent' : 'primary';
  }

  // Getter for auction status
  getAuctionStatus(): string {
    if (!this.auction) return 'Loading...';
    
    const now = new Date();
    const start = new Date(this.auction.auction_start);
    const end = new Date(this.auction.auction_end);

    if (now < start) return 'Starting Soon';
    if (now > end) return 'Ended';
    return 'Active';
  }

  // Getter for auction status color
  getAuctionStatusColor(): string {
    const status = this.getAuctionStatus();
    switch (status) {
      case 'Active': return 'accent';
      case 'Starting Soon': return 'primary';
      case 'Ended': return 'warn';
      default: return 'primary';
    }
  }
}