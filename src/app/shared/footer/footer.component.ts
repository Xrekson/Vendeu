import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar'

@Component({
  selector: 'app-footerx',
  imports: [CommonModule,FontAwesomeModule,ToolbarModule,ButtonModule,AvatarModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit{
  date: Date = new Date();
  isScrolled = false;
  ngOnInit() {
    this.checkScrollPosition();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScrollPosition();
  }

  @HostListener('window:scroll', ['$event'])
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
