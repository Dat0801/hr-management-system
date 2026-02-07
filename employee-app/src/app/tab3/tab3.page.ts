import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  ToastController,
  LoadingController,
  ModalController
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
  logOut,
  create,
  lockClosed
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonTextarea,
    IonSpinner
  ],
})
export class Tab3Page implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);
  private readonly loadingController = inject(LoadingController);

  user: any = null;
  employee: any = null;
  profile: any = null;
  
  showEditModal = false;
  showPasswordModal = false;
  
  editForm = {
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
  };

  passwordForm = {
    current_password: '',
    new_password: '',
    confirm_password: '',
  };

  isLoading = false;

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
      logOut,
      create,
      lockClosed
    });
  }

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    this.isLoading = true;
    try {
      this.user = this.authService.getUser() as any;
      this.employee = this.authService.getEmployee() as any;
      
      if (this.employee?.id) {
        this.profile = await this.profileService.getMyProfile();
        if (this.profile) {
          this.editForm = {
            phone: this.profile.phone || '',
            address: this.profile.address || '',
            city: this.profile.city || '',
            country: this.profile.country || '',
            postal_code: this.profile.postal_code || '',
          };
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      this.isLoading = false;
    }
  }

  openEditModal() {
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  openPasswordModal() {
    this.passwordForm = {
      current_password: '',
      new_password: '',
      confirm_password: '',
    };
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    this.showPasswordModal = false;
  }

  async saveProfile() {
    if (!this.employee?.id) return;

    const loading = await this.loadingController.create({
      message: 'Saving profile...',
    });
    await loading.present();

    try {
      await this.profileService.updateProfile(this.employee.id, this.editForm);
      await this.loadProfile();

      const toast = await this.toastController.create({
        message: 'Profile updated successfully!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      this.closeEditModal();
    } catch (error: any) {
      const toast = await this.toastController.create({
        message: error?.message || 'Failed to update profile',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  async changePassword() {
    if (this.passwordForm.new_password !== this.passwordForm.confirm_password) {
      const toast = await this.toastController.create({
        message: 'New passwords do not match',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
      return;
    }

    if (this.passwordForm.new_password.length < 8) {
      const toast = await this.toastController.create({
        message: 'Password must be at least 8 characters',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Changing password...',
    });
    await loading.present();

    try {
      await this.profileService.changePassword(
        this.passwordForm.current_password,
        this.passwordForm.new_password
      );

      const toast = await this.toastController.create({
        message: 'Password changed successfully!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      this.closePasswordModal();
    } catch (error: any) {
      const toast = await this.toastController.create({
        message: error?.message || 'Failed to change password',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  getProfileData() {
    return {
      name: this.user?.name || this.profile?.user?.name || 'N/A',
      email: this.user?.email || this.profile?.user?.email || 'N/A',
      phone: this.profile?.phone || 'Not set',
      address: this.profile?.address || 'Not set',
      city: this.profile?.city || '',
      country: this.profile?.country || '',
      postal_code: this.profile?.postal_code || '',
      position: this.profile?.position || this.employee?.position || 'N/A',
      department: this.profile?.department?.name || this.employee?.department?.name || 'N/A',
      employee_id: this.profile?.id || this.employee?.id || 'N/A',
    };
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
