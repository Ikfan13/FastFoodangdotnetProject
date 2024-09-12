// manage-users.component.ts
import { Component, OnInit } from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  loading = true;
  error: string | null = null;
  selectedUser: any = null; // For holding user data when updating
  isEditing = false; // Flag to show/hide the update form

  constructor() {}

  ngOnInit() {
    this.fetchUsers();
  }

  async fetchUsers() {
    try {
      const response = await axios.get('http://localhost:5270/api/user');
      this.users = response.data;
      this.loading = false;
    } catch (error) {
      this.error = 'Error fetching users';
      console.error('Error fetching users:', error);
      this.loading = false;
    }
  }

  async deleteUser(userId: number) {
    try {
      await axios.delete(`http://localhost:5270/api/user/${userId}`);
      this.users = this.users.filter(user => user.id !== userId);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  // Open the update form and select the user to be updated
  editUser(user: any) {
    this.selectedUser = { ...user }; // Copy user data to prevent direct mutation
    this.isEditing = true;
  }

  // async updateUser() {
  //   try {
  //     await axios.put(`http://localhost:5270/api/user/${this.selectedUser.id}`, this.selectedUser);
  //     this.users = this.users.map(user =>
  //       user.id === this.selectedUser.id ? { ...this.selectedUser } : user
  //     );
  //     this.isEditing = false;
  //     this.selectedUser = null;
  //   } catch (error) {
  //     console.error('Error updating user:', error);
  //   }
  // }

  cancelEdit() {
    this.isEditing = false;
    this.selectedUser = null;
  }
}
