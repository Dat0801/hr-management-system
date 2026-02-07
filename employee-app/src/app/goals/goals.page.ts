import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonBadge,
  IonProgressBar,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { target, arrowBack, checkmarkCircle, closeCircle, alertCircle } from 'ionicons/icons';
import { GoalService } from '../services/goal.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonBadge,
    IonProgressBar
  ],
})
export class GoalsPage implements OnInit {
  private readonly goalService = inject(GoalService);
  private readonly toastController = inject(ToastController);
  private readonly loadingController = inject(LoadingController);

  goals: any[] = [];
  isLoading = false;
  selectedGoal: any = null;
  showProgressModal = false;
  progressPercentage = 0;
  progressNotes = '';
  completionStats: any = null;

  constructor() {
    addIcons({ target, arrowBack, checkmarkCircle, closeCircle, alertCircle });
  }

  async ngOnInit() {
    await this.loadGoals();
    await this.loadCompletionStats();
  }

  async loadGoals() {
    this.isLoading = true;
    try {
      this.goals = await this.goalService.getMyGoals();
      // Sort by due date ascending
      this.goals.sort((a, b) => {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Failed to load goals',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  async loadCompletionStats() {
    try {
      this.completionStats = await this.goalService.getCompletionStats();
    } catch (error) {
      console.error('Error loading completion stats:', error);
    }
  }

  openProgressModal(goal: any) {
    this.selectedGoal = goal;
    this.progressPercentage = goal.progress_percentage || 0;
    this.progressNotes = goal.progress_notes || '';
    this.showProgressModal = true;
  }

  async updateProgress() {
    if (!this.selectedGoal) return;

    const loading = await this.loadingController.create({
      message: 'Updating progress...',
    });
    await loading.present();

    try {
      await this.goalService.updateProgress(
        this.selectedGoal.id,
        this.progressPercentage,
        this.progressNotes
      );

      await this.loadGoals();
      await this.loadCompletionStats();

      this.showProgressModal = false;
      this.selectedGoal = null;
      this.progressPercentage = 0;
      this.progressNotes = '';

      const toast = await this.toastController.create({
        message: 'Progress updated successfully!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    } catch (error: any) {
      const toast = await this.toastController.create({
        message: error?.message || 'Failed to update progress',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  closeProgressModal() {
    this.showProgressModal = false;
    this.selectedGoal = null;
    this.progressPercentage = 0;
    this.progressNotes = '';
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      business: 'Business',
      professional: 'Professional',
      personal: 'Personal',
      technical: 'Technical',
    };
    return labels[category] || category;
  }

  getStatusColor(status: string): string {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'not_started':
        return 'medium';
      case 'cancelled':
        return 'danger';
      default:
        return 'medium';
    }
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 100) return 'success';
    if (percentage >= 50) return 'primary';
    return 'warning';
  }
}
