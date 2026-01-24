import { Component } from '@angular/core';
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
  IonFabButton
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
  serverOutline
} from 'ionicons/icons';

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
    IonFabButton
  ]
})
export class SchedulePage {
  currentDate = 'October 2023';
  
  days = [
    { day: 'MON', date: 23, active: false },
    { day: 'TUE', date: 24, active: false },
    { day: 'WED', date: 25, active: false },
    { day: 'THU', date: 26, active: true },
    { day: 'FRI', date: 27, active: false },
    { day: 'SAT', date: 28, active: false },
  ];

  scheduleItems = [
    {
      type: 'work',
      tags: ['REGULAR'],
      title: 'Front Desk Management',
      time: '09:00 AM - 12:30 PM',
      location: 'Main Office • Room 4B',
      hasButton: true,
      buttonText: 'View Tasks',
      buttonIcon: 'list',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80',
      icon: 'briefcase',
      iconColor: 'primary'
    },
    {
      type: 'break',
      title: 'Lunch Break',
      time: '12:30 PM - 01:30 PM',
      location: 'Break Room',
      icon: 'restaurant',
      iconColor: 'medium'
    },
    {
      type: 'work',
      tags: ['REMOTE', 'OVERTIME'],
      title: 'Afternoon Support',
      time: '01:30 PM - 06:00 PM',
      description: 'System Maintenance Queue',
      hasButton: true,
      buttonText: 'Contact Manager',
      buttonIcon: 'chatbubble-ellipses-outline',
      image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=300&q=80',
      icon: 'home',
      iconColor: 'warning'
    }
  ];

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
      serverOutline
    });
  }
}
