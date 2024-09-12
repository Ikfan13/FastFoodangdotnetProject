import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  foodItems: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadFoodItems();
  }

  async loadFoodItems() {
    try {
      const response = await axios.get('http://localhost:5270/api/fooditems');
      this.foodItems = response.data;
    } catch (error) {
      console.error('Error loading food items', error);
    }
  }

  checkout(item: any) {
    console.log('Checking out:', item);
    // Redirect to UserDashboard component
    this.router.navigate(['/userdash']);
  }
}

