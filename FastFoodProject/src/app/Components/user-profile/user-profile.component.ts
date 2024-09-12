import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userId: number;
  userDetails: any = {}; // Initialize as an empty object
  isEditing: boolean = false;
  token:any;

  constructor(private router: Router) {
    // Retrieve the userId from localStorage
    this.userId = +localStorage.getItem('userId')!;
  }

  ngOnInit(): void {
    this.fetchUserDetails();
    this.token=localStorage.getItem('jwtToken');
  }

  async fetchUserDetails() {
    try {
      const response = await axios.get(`http://localhost:5270/api/user/${this.userId}`,{
        headers:{
          'Authorization':`Bearer ${this.token}`
        }
      });
      this.userDetails = response.data;
    } catch (error) {
      console.error('Error fetching user details', error);
    }
  }

  editProfile() {
    this.isEditing = true;
  }

  async updateProfile() {
    try {
      await axios.put(`http://localhost:5270/api/user/${this.userId}`, this.userDetails,{
        headers:{
          'Authorization':`Bearer ${this.token}`
        }
      });
      this.isEditing = false;
      // Optionally, refresh the user details
      await this.fetchUserDetails();
    } catch (error) {
      console.error('Error updating user profile', error);
    }
  }

  async deleteProfile() {
    try {
      await axios.delete(`http://localhost:5270/api/user/${this.userId}`,{
        headers:{
          'Authorization':`Bearer ${this.token}`
        }
      });
      // Navigate back to the dashboard or another page
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error deleting user profile', error);
    }
  }

  logout() {
    // Clear userId from localStorage
    localStorage.removeItem('userId');
    // Redirect to login or home page
    this.router.navigate(['/home']);
  }
}
