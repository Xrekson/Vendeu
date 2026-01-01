import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import {  Product } from '../../classes/Product';

@Component({
  selector: 'app-carousel',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule,MatChipsModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
  standalone: true,
  animations: [
    trigger('carouselAnimation', [
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition('* => void', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(-100%)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]

})
export class CarouselComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() products: Product[] = [];
  @Input() autoSlide = true;
  @Input() slideInterval = 5000;
  @Input() showIndicators = true;
  @Input() showNavigation = true;
  @Input() showThumbnails = false;
  @Input() showAddToCart = true;
  @Input() height = '500px';
  @Input() borderRadius = '12px';
  @Input() cardMode = false; // New: Display as cards instead of full-screen
  
  @Output() productClick = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;
  
  currentIndex = 0;
  private autoSlideTimer: any;
  isAnimating = false;
  touchStartX = 0;
  touchEndX = 0;
  
  ngOnInit() {
    // Add IDs if not present
    this.products = this.products.map((product, index) => ({
      ...product,
      id: product.id || index + 1,
      inStock: product.inStock !== undefined ? product.inStock : true
    }));
    
    if (this.products.length > 0 && this.autoSlide) {
      this.startAutoSlide();
    }
  }
  
  ngAfterViewInit() {
    if (this.carouselContainer) {
      this.setupTouchEvents();
    }
  }
  
  ngOnDestroy() {
    this.stopAutoSlide();
  }
  
  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideTimer = setInterval(() => {
      this.next();
    }, this.slideInterval);
  }
  
  stopAutoSlide() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
  }
  
  next() {
    if (this.isAnimating || this.products.length === 0) return;
    this.isAnimating = true;
    this.currentIndex = (this.currentIndex + 1) % this.products.length;
    setTimeout(() => this.isAnimating = false, 300);
    
    if (this.autoSlide) {
      this.restartAutoSlide();
    }
  }
  
  prev() {
    if (this.isAnimating || this.products.length === 0) return;
    this.isAnimating = true;
    this.currentIndex = this.currentIndex === 0 ? this.products.length - 1 : this.currentIndex - 1;
    setTimeout(() => this.isAnimating = false, 300);
    
    if (this.autoSlide) {
      this.restartAutoSlide();
    }
  }
  
  goToSlide(index: number) {
    if (this.isAnimating || index === this.currentIndex || this.products.length === 0) return;
    this.isAnimating = true;
    this.currentIndex = index;
    setTimeout(() => this.isAnimating = false, 300);
    
    if (this.autoSlide) {
      this.restartAutoSlide();
    }
  }
  
  restartAutoSlide() {
    this.stopAutoSlide();
    if (this.autoSlide) {
      this.startAutoSlide();
    }
  }
  
  onProductClick(product: Product) {
    this.productClick.emit(product);
  }
  
  onAddToCart(product: Product, event: Event) {
    event.stopPropagation();
    this.addToCart.emit(product);
  }
  
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }
  
  private setupTouchEvents() {
    const container = this.carouselContainer.nativeElement;
    
    container.addEventListener('touchstart', (e: TouchEvent) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.stopAutoSlide();
    });
    
    container.addEventListener('touchend', (e: TouchEvent) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
      if (this.autoSlide) {
        this.restartAutoSlide();
      }
    });
  }
  
  private handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }
  
  pauseAutoSlide() {
    this.stopAutoSlide();
  }
  
  resumeAutoSlide() {
    if (this.autoSlide) {
      this.startAutoSlide();
    }
  }
}
