import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-manageitems',
  templateUrl: './manageitems.component.html',
  styleUrls: ['./manageitems.component.css']
})
export class ManageitemsComponent implements OnInit {
  foodItems: any[] = [];
  filteredItems: any[] = [];
  foodTypes: string[] = [];
  selectedFoodType: string | null = null;
  showAddItemForm: boolean = false;
  editingItem: any = null; // For editing existing items
  token: any;

  newItem: any = {
    name: '',
    description: '',
    price: 0.0,
    imgUrl: '',
    foodType: ''
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('jwtToken');
    this.loadFoodItems();
  }

  async loadFoodItems() {
    try {
      const response = await axios.get('http://localhost:5270/api/fooditems', {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      this.foodItems = response.data;
      this.filteredItems = this.foodItems;
      this.extractFoodTypes();
    } catch (error) {
      console.error('Error loading food items', error);
    }
  }

  extractFoodTypes() {
    const types = new Set(this.foodItems.map(item => item.foodType));
    this.foodTypes = Array.from(types);
  }

  filterItemsByType(type: string | null) {
    this.selectedFoodType = type;
    this.filteredItems = type
      ? this.foodItems.filter(item => item.foodType === type)
      : this.foodItems;
  }

  toggleAddItemForm(editingItem: any = null) {
    this.showAddItemForm = !this.showAddItemForm;
    if (editingItem) {
      this.editingItem = editingItem;
      this.newItem = { ...editingItem };
    } else {
      this.resetForm();
    }
  }

  async addOrUpdateItem() {
    try {
      if (this.editingItem) {
        await axios.put(`http://localhost:5270/api/fooditems/${this.editingItem.id}`, this.newItem, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        console.log('Item updated successfully');
      } else {
        const response = await axios.post('http://localhost:5270/api/FoodItems', this.newItem, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        this.foodItems.push(response.data); // Add new item to the list
      }

      this.loadFoodItems();
      this.resetForm();

    } catch (error) {
      console.error('Error adding/updating item:', error);
    }
  }

  async deleteItem(id: number) {
    try {
      await axios.delete(`http://localhost:5270/api/fooditems/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      this.loadFoodItems();
    } catch (error) {
      console.error('Error deleting food item', error);
    }
  }

  getImageUrl(imgUrl: string): string {
    // Modify the logic if you have a base path or need to prepend something
    return imgUrl;
  }

  resetForm() {
    this.newItem = {
      name: '',
      description: '',
      price: 0.0,
      imgUrl: '',
      foodType: ''
    };
    this.editingItem = null;
  }

  logout() {
    localStorage.removeItem('jwtToken');
    this.router.navigate(['/home']);
  }
}
