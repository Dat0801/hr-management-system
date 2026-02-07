import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

interface PayrollResponse {
  id?: number;
  employee_id?: number;
  month?: number;
  year?: number;
  base_salary?: number;
  overtime_amount?: number;
  bonus_amount?: number;
  allowances?: number;
  deductions?: number;
  tax_amount?: number;
  insurance_amount?: number;
  gross_salary?: number;
  net_salary?: number;
  status?: string;
  paid_date?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
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

  async getMyPayroll(): Promise<PayrollResponse[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: PayrollResponse[] }>(
          `${this.apiUrl}/my-payroll`,
          { headers: this.getHeaders() }
        )
      );

      return Array.isArray(response.data) ? response.data : (response as any).data?.data || [];
    } catch (error) {
      console.error('Error fetching payroll:', error);
      return [];
    }
  }

  async getPayrollById(id: number): Promise<PayrollResponse | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: PayrollResponse }>(
          `${this.apiUrl}/payrolls/${id}`,
          { headers: this.getHeaders() }
        )
      );

      return response.data || (response as any).data;
    } catch (error) {
      console.error('Error fetching payroll details:', error);
      return null;
    }
  }
}
