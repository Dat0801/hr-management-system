import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonBadge,
  IonFab,
  IonFabButton,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  syncOutline, 
  chevronBack, 
  chevronForward, 
  briefcase, 
  restaurant, 
  home, 
  timeOutline, 
  locationOutline, 
  list, 
  chatbubbleEllipsesOutline,
  calendar,
  serverOutline,
  calendarOutline
} from 'ionicons/icons';
import { ScheduleService } from '../services/schedule.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonBadge,
    IonFab,
    IonFabButton,
    IonSpinner
  ]
})
export class SchedulePage implements OnInit {
  private readonly scheduleService = inject(ScheduleService);
  private readonly toastController = inject(ToastController);

  currentDate = new Date();
  selectedDate = new Date();
  days: any[] = [];
  scheduleItems: any[] = [];
  isLoading = false;

  constructor() {
    addIcons({
      syncOutline,
      chevronBack,
      chevronForward,
      briefcase,
      restaurant,
      home,
      timeOutline,
      locationOutline,
      list,
      chatbubbleEllipsesOutline,
      calendar,
      serverOutline,
      calendarOutline
    });
  }

  async ngOnInit() {
    await this.loadSchedule();
  }

  async loadSchedule() {
    this.isLoading = true;
    try {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth() + 1;
      
      const scheduleData = await this.scheduleService.getScheduleForMonth(year, month);
      this.generateCalendarDays(year, month);
      await this.loadSelectedDaySchedule();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Failed to load schedule',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  async loadSelectedDaySchedule() {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1;
    const day = this.selectedDate.getDate();
    
    const daySchedule = await this.scheduleService.getScheduleForDate(year, month, day);
    this.scheduleItems = this.formatScheduleItems(daySchedule);
  }

  generateCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    this.days = [];

    // Add days from previous month if needed
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      this.days.push({
        day: dayNames[i],
        date: prevMonthLastDay - i,
        active: false,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 2, prevMonthLastDay - i)
      });
    }

    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      const isToday = this.isToday(date);
      const isSelected = this.isSameDay(date, this.selectedDate);
      
      this.days.push({
        day: dayNames[date.getDay()],
        date: i,
        active: isSelected,
        isCurrentMonth: true,
        fullDate: date,
        isToday: isToday
      });
    }

    // Fill remaining days to show full week
    const remainingDays = 42 - this.days.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.days.push({
        day: dayNames[(startDayOfWeek + daysInMonth + i - 1) % 7],
        date: i,
        active: false,
        isCurrentMonth: false,
        fullDate: new Date(year, month, i)
      });
    }
  }

  async selectDay(day: any) {
    if (!day.isCurrentMonth) {
      // Navigate to that month
      this.currentDate = new Date(day.fullDate);
      await this.loadSchedule();
    } else {
      this.selectedDate = day.fullDate;
      this.days.forEach(d => d.active = this.isSameDay(d.fullDate, this.selectedDate));
      await this.loadSelectedDaySchedule();
    }
  }

  async previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    await this.loadSchedule();
  }

  async nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    await this.loadSchedule();
  }

  async syncSchedule() {
    const toast = await this.toastController.create({
      message: 'Syncing schedule...',
      duration: 1000,
    });
    await toast.present();
    await this.loadSchedule();
  }

  formatScheduleItems(items: any[]): any[] {
    return items.map(item => {
      if (item.type === 'attendance') {
        const checkIn = item.check_in ? new Date(item.check_in) : null;
        const checkOut = item.check_out ? new Date(item.check_out) : null;
        
        return {
          type: 'work',
          tags: [item.status?.toUpperCase() || 'PRESENT'],
          title: 'Work Day',
          time: checkIn && checkOut 
            ? `${this.formatTime(checkIn)} - ${this.formatTime(checkOut)}`
            : checkIn 
              ? `From ${this.formatTime(checkIn)}`
              : 'Scheduled',
          location: item.notes || 'Office',
          icon: 'briefcase',
          iconColor: 'primary',
          status: item.status
        };
      } else if (item.type === 'leave') {
        return {
          type: 'leave',
          title: `${item.leave_type?.replace('_', ' ').toUpperCase()} Leave`,
          time: 'All Day',
          location: item.reason || 'Leave Request',
          icon: 'calendar-outline',
          iconColor: item.status === 'approved' ? 'success' : 'warning',
          status: item.status
        };
      }
      return null;
    }).filter(item => item !== null);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  getCurrentMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
}
