import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonInput,
    IonItem,
    IonLabel,
    IonButton,
    IonSpinner,
    IonText,
  ],
})
export class LoginPage implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading) {
      return;
    }
    this.error = '';
    this.loading = true;
    const { email, password } = this.form.value;
    try {
      await this.authService.login(email, password);
      await this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    } catch (err: any) {
      const message =
        err?.error?.message ||
        err?.error?.errors?.email?.[0] ||
        'Sign in failed, please try again.';
      this.error = message;
    } finally {
      this.loading = false;
    }
  }
}
