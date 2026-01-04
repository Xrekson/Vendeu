import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ListingService } from '../../services/listing/listing.service';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatFormFieldModule} from '@angular/material/form-field';

import { CarouselComponent } from '../carousel/carousel.component';
import { FormsModule } from '@angular/forms';
import { Product } from '../../classes/Product';

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
  carouselImages: Product[];
}

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [
    CommonModule,
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    FormsModule,
    // Custom Components
    CarouselComponent
  ],
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit, OnDestroy {
  listingData: Auction[] = [];
  filteredData: Auction[] = [];
  isLoading = true;
  
  // Filter options
  statusFilter: 'all' | 'active' | 'ended' = 'all';
  priceFilter: 'all' | 'low' | 'medium' | 'high' = 'all';
  searchTerm = '';
  
  // Grid layout
  gridCols = 3;
  
  private destroy$ = new Subject<void>();
  private updateInterval = 30000; // Update every 30 seconds

  constructor(
    private listingService: ListingService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAuctions();
    this.setupResponsiveGrid();
    this.startAutoUpdate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAuctions(): void {
    this.isLoading = true;
    this.listingService.getAllListing().subscribe({
      next: (data) => {
        this.listingData = data.map((item: any) => ({
          ...item,
          endTime: this.getTimeRemaining(item.auction_end),
          carouselImages: this.prepareImagesForCarousel(item.images, item.name)
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading listings:', err);
        this.snackBar.open('Failed to load auctions', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  prepareImagesForCarousel(images: string[], name: string): any[] {
    if (!images || images.length === 0) {
      return [{
        id: 1,
        imageUrl: 'assets/default-auction.jpg',
        altText: 'No images available',
        title: name
      }];
    }
    
    return images.map((img, index) => ({
      id: index + 1,
      imageUrl: img,
      altText: `${name} - Image ${index + 1}`,
      title: name
    }));
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
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
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

  getAuctionStatusColor(endDate: string): string {
    const status = this.getAuctionStatus(endDate);
    return status === 'Active' ? 'primary' : 'warn';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getToDetails(id: string): void {
    this.router.navigate(['details', id]);
  }

  applyFilters(): void {
    let filtered = [...this.listingData];

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(item => 
        this.statusFilter === 'active' 
          ? this.getAuctionStatus(item.auction_end) === 'Active'
          : this.getAuctionStatus(item.auction_end) === 'Ended'
      );
    }

    // Apply price filter
    if (this.priceFilter !== 'all') {
      filtered = filtered.filter(item => {
        const price = item.price;
        switch (this.priceFilter) {
          case 'low': return price < 1000;
          case 'medium': return price >= 1000 && price < 5000;
          case 'high': return price >= 5000;
          default: return true;
        }
      });
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.detail.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term)
      );
    }

    this.filteredData = filtered;
  }

  onStatusFilterChange(filter: 'all' | 'active' | 'ended'): void {
    this.statusFilter = filter;
    this.applyFilters();
  }

  onPriceFilterChange(filter: 'all' | 'low' | 'medium' | 'high'): void {
    this.priceFilter = filter;
    this.applyFilters();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  clearFilters(): void {
    this.statusFilter = 'all';
    this.priceFilter = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  setupResponsiveGrid(): void {
    const updateGridCols = () => {
      const width = window.innerWidth;
      if (width < 768) {
        this.gridCols = 1;
      } else if (width < 1024) {
        this.gridCols = 2;
      } else if (width < 1440) {
        this.gridCols = 3;
      } else {
        this.gridCols = 4;
      }
    };

    updateGridCols();
    window.addEventListener('resize', updateGridCols);
  }

  startAutoUpdate(): void {
    interval(this.updateInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAuctions();
      });
  }

  // Helper to check if auction is ending soon (less than 1 hour)
  isEndingSoon(endDate: string): boolean {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return diff > 0 && diff < 3600000; // Less than 1 hour
  }

  // Get time remaining in seconds for countdown
  getTimeRemainingSeconds(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return diff > 0 ? Math.floor(diff / 1000) : 0;
  }

  // Get total auctions count
  getTotalAuctions(): number {
    return this.listingData.length;
  }

  // Get active auctions count
  getActiveAuctions(): number {
    return this.listingData.filter(item => 
      this.getAuctionStatus(item.auction_end) === 'Active'
    ).length;
  }
}