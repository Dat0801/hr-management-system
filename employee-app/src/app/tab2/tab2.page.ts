import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent,
  IonSearchbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  chevronBackOutline, add, search, folder, wallet, shield, school,
  eye, download, documentText
} from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
    IonGrid, IonRow, IonCol, IonCard, IonCardContent,
    IonSearchbar
  ]
})
export class Tab2Page {
  folders = [
    { name: 'Contracts', count: 4, icon: 'folder', color: 'primary' },
    { name: 'Payslips', count: 12, icon: 'wallet', color: 'secondary' },
    { name: 'Policies', count: 5, icon: 'shield', color: 'tertiary' },
    { name: 'Training', count: 8, icon: 'school', color: 'success' }
  ];

  recentDocuments = [
    {
      name: 'Q3_Bonus_Agreement.pdf',
      date: 'Oct 24, 2023',
      size: '1.4 MB',
      type: 'pdf',
      icon: 'document-text',
      iconColor: 'danger'
    },
    {
      name: 'Employee_Handbook_2024.docx',
      date: 'Oct 18, 2023',
      size: '3.2 MB',
      type: 'word',
      icon: 'document-text',
      iconColor: 'primary'
    },
    {
      name: 'September_Payslip.pdf',
      date: 'Sep 30, 2023',
      size: '850 KB',
      type: 'pdf',
      icon: 'wallet',
      iconColor: 'success'
    },
    {
      name: 'Security_Protocol_V2.pptx',
      date: 'Sep 15, 2023',
      size: '12.5 MB',
      type: 'ppt',
      icon: 'shield',
      iconColor: 'warning'
    }
  ];

  constructor() {
    addIcons({ 
      chevronBackOutline, add, search, folder, wallet, shield, school,
      eye, download, documentText
    });
  }
}
