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
  IonProgressBar,
  ToastController,
  LoadingController
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
  people,
  wallet,
  chevronForward,
  target
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { AttendanceService } from '../services/attendance.service';

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
  private readonly attendanceService = inject(AttendanceService);
  readonly router = inject(Router);
  private readonly toastController = inject(ToastController);
  private readonly loadingController = inject(LoadingController);

  user = this.authService.getUser() as any;
  employee = this.authService.getEmployee() as any;
  currentDate = new Date();
  
  todayAttendance: any = null;
  isLoadingAttendance = false;
  isClocking = false;
  
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
    addIcons({ notifications, time, calendar, trendingUp, timer, megaphone, people, wallet, chevronForward, target });
  }

  async ionViewWillEnter() {
    await this.loadTodayAttendance();
  }

  async loadTodayAttendance() {
    this.isLoadingAttendance = true;
    try {
      this.todayAttendance = await this.attendanceService.getTodayAttendance();
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      this.isLoadingAttendance = false;
    }
  }

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  async clockIn() {
    if (this.isClocking) return;

    this.isClocking = true;
    const loading = await this.loadingController.create({
      message: 'Clocking in...',
    });
    await loading.present();

    try {
      const location = await this.getCurrentLocation();
      await this.attendanceService.clockIn(
        location?.latitude,
        location?.longitude,
        location ? 'Location verified' : undefined
      );

      await this.loadTodayAttendance();

      const toast = await this.toastController.create({
        message: 'Successfully clocked in!',
        duration: 2000,
        color: 'success',
        position: 'top',
      });
      await toast.present();
    } catch (error: any) {
      const toast = await this.toastController.create({
        message: error?.message || 'Failed to clock in. Please try again.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    } finally {
      await loading.dismiss();
      this.isClocking = false;
    }
  }

  async clockOut() {
    if (this.isClocking || !this.todayAttendance?.id) return;

    this.isClocking = true;
    const loading = await this.loadingController.create({
      message: 'Clocking out...',
    });
    await loading.present();

    try {
      const location = await this.getCurrentLocation();
      await this.attendanceService.clockOut(
        this.todayAttendance.id,
        location?.latitude,
        location?.longitude,
        location ? 'Location verified' : undefined
      );

      await this.loadTodayAttendance();

      const toast = await this.toastController.create({
        message: 'Successfully clocked out!',
        duration: 2000,
        color: 'success',
        position: 'top',
      });
      await toast.present();
    } catch (error: any) {
      const toast = await this.toastController.create({
        message: error?.message || 'Failed to clock out. Please try again.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    } finally {
      await loading.dismiss();
      this.isClocking = false;
    }
  }

  getClockInTime(): string {
    if (!this.todayAttendance?.check_in) return '';
    const date = new Date(this.todayAttendance.check_in);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  getClockOutTime(): string {
    if (!this.todayAttendance?.check_out) return '';
    const date = new Date(this.todayAttendance.check_out);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  canClockIn(): boolean {
    return !this.todayAttendance || !this.todayAttendance.check_in;
  }

  canClockOut(): boolean {
    return !!this.todayAttendance?.check_in && !this.todayAttendance?.check_out;
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  goToLeaveRequest() {
    this.router.navigateByUrl('/leave-request');
  }
}
