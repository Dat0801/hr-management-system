import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  chevronBack, 
  ellipsisHorizontal, 
  mail, 
  call, 
  location, 
  business, 
  person, 
  fingerPrint, 
  documentText, 
  chevronForward,
  logOut
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonButtons,
    IonButton,
    IonIcon
  ],
})
export class Tab3Page {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Profile Data matching the image
  profile = {
    name: 'John Doe',
    role: 'Senior Product Designer',
    department: 'Engineering Department',
    avatar: 'https://i.pravatar.cc/150?u=john', // Placeholder
    personalInfo: {
      email: 'john.doe@company.com',
      phone: '+1 (555) 012-3456',
      address: '123 Design St, San Francisco, CA'
    },
    employment: {
      department: 'Engineering & Design',
      manager: 'Sarah Jenkins',
      id: '#EMP-4022'
    }
  };

  constructor() {
    addIcons({ 
      chevronBack, 
      ellipsisHorizontal, 
      mail, 
      call, 
      location, 
      business, 
      person, 
      fingerPrint, 
      documentText, 
      chevronForward,
      logOut
    });
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
