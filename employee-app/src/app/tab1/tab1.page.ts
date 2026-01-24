import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonAvatar,
  IonBadge,
  IonProgressBar
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  notifications, 
  time, 
  calendar, 
  trendingUp, 
  timer, 
  megaphone, 
  people 
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonAvatar,
    IonBadge,
    IonProgressBar
  ],
})
export class Tab1Page {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  user = this.authService.getUser() as any;
  employee = this.authService.getEmployee() as any;
  currentDate = new Date();
  
  notifications = [
    {
      id: 1,
      title: 'New Health Benefits Policy',
      description: 'The company has updated the health insurance coverage for the upcoming quarter. Please...',
      time: '2h ago',
      icon: 'megaphone',
      color: 'primary',
      bg: 'blue-100'
    },
    {
      id: 2,
      title: 'Upcoming Office Holiday',
      description: 'The office will be closed on Friday for the...',
      time: 'Yesterday',
      icon: 'calendar',
      color: 'warning',
      bg: 'orange-100'
    },
    {
      id: 3,
      title: 'Quarterly Town Hall Meeting',
      description: 'Join the CEO for our Q3 performance update...',
      time: 'Oct 20',
      icon: 'people',
      color: 'tertiary',
      bg: 'purple-100'
    }
  ];

  constructor() {
    addIcons({ notifications, time, calendar, trendingUp, timer, megaphone, people });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  goToLeaveRequest() {
    this.router.navigateByUrl('/leave-request');
  }
}
