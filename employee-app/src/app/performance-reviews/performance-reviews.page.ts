import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, arrowBack, trophy, trendingUp } from 'ionicons/icons';
import { PerformanceReviewService } from '../services/performance-review.service';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-performance-reviews',
  templateUrl: './performance-reviews.page.html',
  styleUrls: ['./performance-reviews.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonBadge
  ],
})
export class PerformanceReviewsPage implements OnInit {
  private readonly reviewService = inject(PerformanceReviewService);
  private readonly toastController = inject(ToastController);

  reviews: any[] = [];
  isLoading = false;
  selectedReview: any = null;
  averageRating: number | null = null;

  constructor() {
    addIcons({ star, arrowBack, trophy, trendingUp });
  }

  async ngOnInit() {
    await this.loadReviews();
    await this.loadAverageRating();
  }

  async loadReviews() {
    this.isLoading = true;
    try {
      this.reviews = await this.reviewService.getMyReviews();
      // Sort by year and period descending
      this.reviews.sort((a, b) => {
        if (b.rating_year !== a.rating_year) return b.rating_year - a.rating_year;
        const periodOrder = { annual: 0, q4: 1, q3: 2, q2: 3, q1: 4 };
        return (periodOrder[b.period as keyof typeof periodOrder] || 0) - (periodOrder[a.period as keyof typeof periodOrder] || 0);
      });
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Failed to load performance reviews',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  async loadAverageRating() {
    try {
      this.averageRating = await this.reviewService.getAverageRating();
    } catch (error) {
      console.error('Error loading average rating:', error);
    }
  }

  async viewDetails(review: any) {
    try {
      const details = await this.reviewService.getReviewById(review.id);
      this.selectedReview = details;
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Failed to load review details',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  getPeriodLabel(period: string): string {
    const labels: { [key: string]: string } = {
      q1: 'Q1',
      q2: 'Q2',
      q3: 'Q3',
      q4: 'Q4',
      annual: 'Annual',
    };
    return labels[period] || period;
  }

  renderStars(rating: number): string {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '½';
    stars += '☆'.repeat(5 - Math.ceil(rating || 0));
    return stars;
  }

  getStatusColor(status: string): string {
    switch(status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'submitted':
        return 'warning';
      case 'draft':
        return 'medium';
      default:
        return 'medium';
    }
  }

  closeDetails() {
    this.selectedReview = null;
  }
}
