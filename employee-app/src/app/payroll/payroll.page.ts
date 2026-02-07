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
  IonItem,
  IonLabel,
  IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { wallet, download, calendar, dollarSign, arrowBack, close } from 'ionicons/icons';
import { PayrollService } from '../services/payroll.service';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.page.html',
  styleUrls: ['./payroll.page.scss'],
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
    IonItem,
    IonLabel,
    IonBadge
  ],
})
export class PayrollPage implements OnInit {
  private readonly payrollService = inject(PayrollService);
  private readonly toastController = inject(ToastController);

  payrolls: any[] = [];
  isLoading = false;
  selectedPayroll: any = null;

  constructor() {
    addIcons({ wallet, download, calendar, dollarSign, arrowBack, close });
  }

  async ngOnInit() {
    await this.loadPayrolls();
  }

  async loadPayrolls() {
    this.isLoading = true;
    try {
      this.payrolls = await this.payrollService.getMyPayroll();
      // Sort by year and month descending
      this.payrolls.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
      });
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Failed to load payroll history',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  async viewDetails(payroll: any) {
    try {
      const details = await this.payrollService.getPayrollById(payroll.id);
      this.selectedPayroll = details;
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Failed to load payroll details',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  }

  getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  }

  getStatusColor(status: string): string {
    switch(status?.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'approved':
        return 'primary';
      case 'pending':
        return 'warning';
      default:
        return 'medium';
    }
  }

  closeDetails() {
    this.selectedPayroll = null;
  }
}
