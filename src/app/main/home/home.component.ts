import { Component } from '@angular/core';
import { AppState } from '../../services/Store/app.store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Session } from '../../services/Store/session.model';
import { selectMAIN } from '../../services/Store/session.selectors';
import { Router } from '@angular/router';
import { Product } from '../../classes/Product';


@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  products: Product[] = [
    {
      name: 'MCX Spear 17inch',
      img: '/images/spear.jpg',
      price: 3000,
      category: 'Rifle',
      description: 'Military-grade tactical rifle with 17-inch barrel, featuring advanced modular design for special operations.',
      inStock: true
    },
    {
      name: 'M1 Garand',
      img: '/images/garand.png',
      price: 5000,
      category: 'Vintage',
      description: 'Classic WWII-era semi-automatic rifle, collector\'s edition with historical significance.',
      inStock: true
    },
    {
      name: 'Pancore JackHammer',
      img: '/images/jack.jpg',
      price: 10000,
      category: 'Shotgun',
      description: 'Advanced combat shotgun with rotary magazine system, designed for maximum firepower in close quarters.',
      inStock: false
    },
    {
      name: 'S&S P226',
      img: '/images/p226.jpg',
      price: 1000,
      category: 'Pistol',
      description: 'Reliable 9mm service pistol with exceptional accuracy and durability, trusted by military units worldwide.',
      inStock: true
    },
    {
      name: 'Multiple Carbine',
      img: '/images/Firearms.jpg',
      price: 5550,
      category: 'Carbine',
      description: 'Versatile modular carbine system with multiple caliber options and extensive accessory compatibility.',
      inStock: true
    },
    {
      name: 'Walter Comp Gun',
      img: '/images/walther.webp',
      price: 2000,
      category: 'Competition',
      description: 'Competition-ready pistol with match-grade barrel and adjustable trigger for precision shooting.',
      inStock: true
    }
  ];
  data$: Observable<Session>;

  constructor(private store: Store<AppState>, private route: Router) {
    this.data$ = this.store.select(selectMAIN);
    this.data$.subscribe(data => {
      if (data.username) {
        console.log('dash');
        this.route.navigate(['dash']);
      }
    })
  }
  onProductClick(product: Product) {
    console.log('Product clicked:', product);
    alert(`Viewing details for: ${product.name}\nPrice: $${product.price}`);
  }

  onAddToCart(product: Product) {
    console.log('Added to cart:', product);
    alert(`Added ${product.name} to cart for $${product.price}`);
  }

  getAveragePrice(): number {
    const total = this.products.reduce((sum, product) => sum + product.price, 0);
    return total / this.products.length;
  }

  getTotalValue(): number {
    return this.products.reduce((sum, product) => sum + product.price, 0);
  }
}
