import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = environment.apiUrl ?? 'http://localhost:8000/api';
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  }

  async getMyProfile(): Promise<any> {
    try {
      const employee = this.authService.getEmployee() as any;
      if (!employee?.id) return null;

      const response = await firstValueFrom(
        this.http.get<{ data: any }>(
          `${this.apiUrl}/employees/${employee.id}`,
          { headers: this.getHeaders() }
        )
      );

      return response.data || (response as any).data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async updateProfile(employeeId: number, data: any): Promise<any> {
    const response = await firstValueFrom(
      this.http.put<{ data: any }>(
        `${this.apiUrl}/employees/${employeeId}`,
        data,
        { headers: this.getHeaders() }
      )
    );

    return response.data || (response as any).data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    // Note: This endpoint may need to be created in backend
    // For now, we'll use a placeholder endpoint
    try {
      const response = await firstValueFrom(
        this.http.post<{ message: string }>(
          `${this.apiUrl}/change-password`,
          {
            current_password: currentPassword,
            new_password: newPassword,
          },
          { headers: this.getHeaders() }
        )
      );

      return response;
    } catch (error: any) {
      // If endpoint doesn't exist, we'll handle it gracefully
      throw new Error(error?.response?.data?.message || 'Password change endpoint not available');
    }
  }
}
