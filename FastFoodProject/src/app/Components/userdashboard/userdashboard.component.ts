import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-userdashboard',
  templateUrl: './userdashboard.component.html',
  styleUrls: ['./userdashboard.component.css']
})
export class UserdashboardComponent implements OnInit {
  foodItems: any[] = [];
  filteredItems: any[] = [];
  foodTypes: string[] = [];
  selectedFoodType: string | null = null;
  showMenu: boolean = false;
  selectedItem: any;
  token: string | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('jwtToken');
    
    if (this.token) {
      this.loadFoodItems(); // Load food items only if the token is available
    } else {
      console.error('No JWT token found');
      this.error = 'Authentication error. Please log in again.';
      this.loading = false;
    }
  }

  async loadFoodItems() {
    this.loading = true;
    this.error = null;

    try {
      const response = await axios.get('http://localhost:5270/api/fooditems', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      console.log('API Response:', response.data); // Log API response for debugging
      this.foodItems = response.data;
      this.filteredItems = this.foodItems;
      this.extractFoodTypes();
    } catch (error) {
      this.handleApiError(error, 'Error loading food items');
    } finally {
      this.loading = false;
    }
  }

  extractFoodTypes() {
    const types = new Set(this.foodItems.map(item => item.foodType));
    this.foodTypes = Array.from(types);
  }

  filterItemsByType(type: string | null) {
    this.selectedFoodType = type;
    this.filteredItems = type ? this.foodItems.filter(item => item.foodType === type) : this.foodItems;
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  getImageUrl(imageName: string): string {
    return `${imageName}`;
  }

  async orderNow(item: any) {
    this.selectedItem = item;
    await this.createOrder(item);
  }

  async createOrder(item: any) {
    if (!this.token) {
      console.error('No JWT token found');
      this.error = 'Authentication error. Please log in again.';
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User not logged in');
        this.error = 'User not logged in. Please log in first.';
        return;
      }

      const orderCreateModel = {
        orderNumber: `ORD-${new Date().getTime()}`, // Generate a unique order number
        totalPrice: item.price,
        orderTime: new Date().toISOString(),
        status: 'Pending',
        userId: userId,
        foodItemIds: [item.id] // Only pass the FoodItem ID
      };

      const response = await axios.post('http://localhost:5270/api/order', orderCreateModel, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}` // Include token in the request
        }
      });

      console.log('Order created successfully', response.data); // Log response
      this.router.navigate(['/order-confirmation', response.data.id]);
    } catch (error) {
      this.handleApiError(error, 'Error creating order');
    }
  }

  addToCart(item: any) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((cartItem: any) => cartItem.id === item.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Item added to cart');
  }

  showProfile() {
    this.router.navigate(['/user-profile']);
  }

  goToOrders() {
    this.router.navigate(['/order-list']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  logout() {
    localStorage.removeItem('userId'); // Clear userId from localStorage on logout
    localStorage.removeItem('cart'); // Clear cart from localStorage on logout
    localStorage.removeItem('jwtToken');  // Remove the token from localStorage
    this.router.navigate(['/login']);
  }

  private handleApiError(error: any, context: string) {
    if (axios.isAxiosError(error)) {
      console.error(`${context}:`, error.response?.data || error.message);
      this.error = `${context}. Please try again later.`;
    } else {
      console.error('Unexpected error:', error);
      this.error = 'Unexpected error. Please try again later.';
    }
  }
}
