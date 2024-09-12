import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
  token: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('jwtToken');
    
    if (!this.token) {
      console.error('No JWT token found');
      this.router.navigate(['/login']);
      return;
    }

    this.loadCartItems();
  }

  loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartItems = cart;
    this.calculateTotalPrice();
  }

  calculateTotalPrice() {
    this.totalPrice = this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  async proceedToCheckout() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User not logged in');
      this.router.navigate(['/login']);
      return;
    }

    try {
      const orderCreateModel = {
        orderNumber: `ORD-${new Date().getTime()}`, // Generate a unique order number
        totalPrice: this.totalPrice,
        orderTime: new Date().toISOString(),
        status: 'Pending',
        userId: userId,
        foodItemIds: this.cartItems.map(item => item.id)
      };

      const response = await axios.post('http://localhost:5270/api/order', orderCreateModel, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}` // Include token in the header
        }
      });

      console.log('Order created successfully', response.data); // Log response
      localStorage.removeItem('cart'); // Clear cart after successful order
      this.router.navigate(['/order-confirmation', response.data.id]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error response:', error.response?.data);
        console.error('Axios error status:', error.response?.status);
        console.error('Axios error headers:', error.response?.headers);
        if (error.response?.status === 401) {
          // Handle unauthorized access (e.g., redirect to login)
          this.router.navigate(['/login']);
        }
      } else if (error instanceof Error) {
        console.error('Error message:', error.message);
      } else {
        console.error('Unknown error type:', error);
      }
      alert('Failed to create order. Please try again.');
    }
  }

  removeFromCart(itemId: number) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter((item: any) => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    this.loadCartItems(); // Reload cart items after removal
  }

  getImageUrl(imageName: string): string {
    return `${imageName}`; // Modify this if you need a complete URL
  }
}
