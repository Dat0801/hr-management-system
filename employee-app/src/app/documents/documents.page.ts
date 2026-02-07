import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonLabel
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  documentText, 
  download, 
  arrowBack,
  fileText,
  receipt,
  calendar,
  trendingUp
} from 'ionicons/icons';
import { PayrollService } from '../services/payroll.service';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonLabel
  ],
})
export class DocumentsPage implements OnInit {
  private readonly payrollService = inject(PayrollService);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  isLoading = false;
  documents: any[] = [];

  constructor() {
    addIcons({ 
      documentText, 
      download, 
      arrowBack,
      fileText,
      receipt,
      calendar,
      trendingUp
    });
  }

  async ngOnInit() {
    await this.loadDocuments();
  }

  async loadDocuments() {
    this.isLoading = true;
    try {
      const payrolls = await this.payrollService.getMyPayroll();
      
      // Format payrolls as documents
      this.documents = [
        {
          id: 'contract',
          type: 'contract',
          title: 'Employment Contract',
          description: 'Your employment agreement and terms',
          icon: 'file-text',
          color: 'primary',
          category: 'Employment',
          date: null,
          action: () => this.viewContract()
        },
        ...payrolls.map((payroll: any) => ({
          id: `payslip-${payroll.id}`,
          type: 'payslip',
          title: `Payslip - ${this.getMonthName(payroll.month)} ${payroll.year}`,
          description: `Net Salary: ${this.formatCurrency(payroll.net_salary)}`,
          icon: 'receipt',
          color: 'success',
          category: 'Payroll',
          date: payroll.paid_date || payroll.created_at,
          payrollId: payroll.id,
          action: () => this.viewPayslip(payroll.id)
        }))
      ];
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Failed to load documents',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  viewContract() {
    const toast = await this.toastController.create({
      message: 'Employment contract will be available soon',
      duration: 2000,
      color: 'medium',
    });
    await toast.present();
  }

  async viewPayslip(payrollId: number) {
    await this.router.navigateByUrl(`/payroll`);
  }

  downloadDocument(doc: any) {
    if (doc.type === 'payslip') {
      // In a real app, this would download the PDF
      const toast = await this.toastController.create({
        message: 'Downloading payslip...',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    } else {
      const toast = await this.toastController.create({
        message: 'Document download not available',
        duration: 2000,
        color: 'medium',
      });
      await toast.present();
    }
  }

  getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getDocumentsByCategory(): { [key: string]: any[] } {
    const categories: { [key: string]: any[] } = {};
    this.documents.forEach(doc => {
      if (!categories[doc.category]) {
        categories[doc.category] = [];
      }
      categories[doc.category].push(doc);
    });
    return categories;
  }
}
