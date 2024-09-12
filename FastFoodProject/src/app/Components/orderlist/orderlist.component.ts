import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-orderlist',
  templateUrl: './orderlist.component.html',
  styleUrls: ['./orderlist.component.css']
})
export class OrderlistComponent implements OnInit {
  userOrders: any[] = [];
  token: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.token = localStorage.getItem('jwtToken');
    if (this.token) {
      this.fetchUserOrders(); // Fetch orders only if the token is available
    } else {
      console.error('No JWT token found');
      // Handle scenario when no token is available (e.g., redirect to login)
    }
  }

  async fetchUserOrders() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User not logged in');
      return;
    }

    try {
      if (this.isTokenExpired(this.token)) {
        console.error('Token expired');
        return;
      }

      const response = await axios.get(`http://localhost:5270/api/order/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      this.userOrders = response.data;
    } catch (error) {
      console.error('Error fetching user orders', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error('Unauthorized access - Token might be invalid');
      }
    }
  }

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() > expiry;
  }

  downloadBill(orderId: number) {
    // Retrieve the order details for the specific order
    const order = this.userOrders.find(o => o.id === orderId);
    if (!order) {
      console.error('Order not found');
      return;
    }

    // Create a new PDF document
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Order Confirmation', 20, 20);

    doc.setFontSize(12);
    doc.text(`Order Number: ${order.orderNumber}`, 20, 30);
    doc.text(`Total Price: $${order.totalPrice}`, 20, 40);
    doc.text(`Order Time: ${order.orderTime}`, 20, 50);
    doc.text(`Status: ${order.status}`, 20, 60);

    doc.text('Items Ordered:', 20, 70);
    order.orderItems.forEach((item: any, index: number) => {
      const y = 80 + index * 10;
      doc.text(`Item Name: ${item.name}`, 20, y);
      doc.text(`Price: $${item.price}`, 20, y + 10);
    });

    // Save the PDF
    doc.save(`Order_${order.orderNumber}.pdf`);
  }
}
