import { Component } from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-feedbacks',
  templateUrl: './feedbacks.component.html',
  styleUrl: './feedbacks.component.css'
})
export class FeedbacksComponent {
  feedbacks: any[] = [];

  ngOnInit(): void {
    this.loadFeedbacks();
  }
  loadFeedbacks(): void {
    // Fetch feedbacks from the backend
    axios.get('http://localhost:5270/api/feedback')
      .then(response => {
        this.feedbacks = response.data;
      })
      .catch(error => {
        console.error('Error fetching feedbacks:', error);
      });
    }
  }
