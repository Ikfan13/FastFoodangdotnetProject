import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isScrolled = false;
  isMenuOpen = false;

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const scrollPosition = window.scrollY;
    this.isScrolled = scrollPosition > 50; // Adjust this value as needed
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    const nav = document.querySelector('.nav');
    if (nav) {
      nav.classList.toggle('show', this.isMenuOpen);
    }
  }
}
