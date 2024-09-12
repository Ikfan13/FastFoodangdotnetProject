import { Component, OnInit } from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-admin-order-confirm',
  templateUrl: './admin-order-confirm.component.html',
  styleUrls: ['./admin-order-confirm.component.css']
})
export class AdminOrderConfirmComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  error: string | null = null;
  token: string | null = null; // Ensure token is of type string | null

  ngOnInit(): void {
    this.token = localStorage.getItem('jwtToken');
    
    if (this.token) {
      this.loadOrders(); // Load orders only if the token is available
    } else {
      console.error('No JWT token found');
      this.error = 'Authentication error. Please log in again.';
      this.loading = false;
    }
  }

  async loadOrders() {
    this.loading = true;
    this.error = null;

    try {
      const response = await axios.get('http://localhost:5270/api/order', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      console.log('API Response:', response.data); // Log API response for debugging
      this.orders = response.data;
    } catch (error) {
      this.error = 'Error loading orders. Please try again later.';
      console.error('Error loading orders:', error);
    } finally {
      this.loading = false;
    }
  }

  async updateOrderStatus(orderId: number, status: string) {
    if (!this.token) {
      console.error('No JWT token found');
      this.error = 'Authentication error. Please log in again.';
      return;
    }

    try {
      await axios.put(`http://localhost:5270/api/order/${orderId}`, { status }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}` // Include token in the request
        }
      });
      
      await this.loadOrders(); // Reload orders after update
    } catch (error) {
      console.error('Error updating order:', error);
      this.error = 'Error updating order. Please try again later.';
    }
  }
}
