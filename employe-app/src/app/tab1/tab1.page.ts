import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { timeOutline, calendarOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
  ],
})
export class Tab1Page {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  user = this.authService.getUser() as any;
  employee = this.authService.getEmployee() as any;
  initials = '';

  constructor() {
    addIcons({ timeOutline, calendarOutline });
    this.initials = this.buildInitials();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private buildInitials(): string {
    const name = (this.user && (this.user as any).name) || 'Employee';
    if (typeof name !== 'string') {
      return 'E';
    }
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0).toUpperCase() ?? '';
    const second = parts[1]?.charAt(0).toUpperCase() ?? '';
    const value = `${first}${second}`.trim();
    return value || 'E';
  }
}
