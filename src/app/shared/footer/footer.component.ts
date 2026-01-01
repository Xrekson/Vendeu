import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'app-footerx',
  imports: [CommonModule,FontAwesomeModule,MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit{
  date: Date = new Date();
  isScrolled = false;
  ngOnInit() {
    this.checkScrollPosition();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScrollPosition();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.checkScrollPosition();
  }

  checkScrollPosition() {
    const scrollPosition = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    // If the document height is greater than the window height, there will be scrolling
    this.isScrolled = scrollPosition > 0 || documentHeight > windowHeight;
  }
}
