import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

interface AttendanceResponse {
  data?: any;
  id?: number;
  employee_id?: number;
  date?: string;
  check_in?: string;
  check_out?: string;
  status?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
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

  async getTodayAttendance(): Promise<AttendanceResponse | null> {
    try {
      const employee = this.authService.getEmployee() as any;
      if (!employee?.id) return null;

      const today = new Date().toISOString().split('T')[0];
      const response = await firstValueFrom(
        this.http.get<{ data: AttendanceResponse[] }>(
          `${this.apiUrl}/attendances?per_page=100`,
          { headers: this.getHeaders() }
        )
      );

      const attendances = Array.isArray(response.data) ? response.data : (response as any).data?.data || [];
      return attendances.find((att: any) => att.date === today && att.employee_id === employee.id) || null;
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      return null;
    }
  }

  async clockIn(latitude?: number, longitude?: number, notes?: string): Promise<AttendanceResponse> {
    const employee = this.authService.getEmployee() as any;
    if (!employee?.id) {
      throw new Error('Employee not found');
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const payload: any = {
      employee_id: employee.id,
      date: today,
      check_in: now,
      status: 'present',
    };

    if (latitude && longitude) {
      payload.notes = `Location: ${latitude}, ${longitude}${notes ? ` - ${notes}` : ''}`;
    } else if (notes) {
      payload.notes = notes;
    }

    const response = await firstValueFrom(
      this.http.post<AttendanceResponse>(
        `${this.apiUrl}/attendances`,
        payload,
        { headers: this.getHeaders() }
      )
    );

    return response.data || response;
  }

  async clockOut(attendanceId: number, latitude?: number, longitude?: number, notes?: string): Promise<AttendanceResponse> {
    const now = new Date().toISOString();

    const payload: any = {
      check_out: now,
    };

    if (latitude && longitude) {
      payload.notes = `Location: ${latitude}, ${longitude}${notes ? ` - ${notes}` : ''}`;
    } else if (notes) {
      payload.notes = notes;
    }

    const response = await firstValueFrom(
      this.http.put<AttendanceResponse>(
        `${this.apiUrl}/attendances/${attendanceId}`,
        payload,
        { headers: this.getHeaders() }
      )
    );

    return response.data || response;
  }

  async getAttendanceHistory(limit: number = 30): Promise<AttendanceResponse[]> {
    try {
      const employee = this.authService.getEmployee() as any;
      if (!employee?.id) return [];

      const response = await firstValueFrom(
        this.http.get<{ data: AttendanceResponse[] }>(
          `${this.apiUrl}/attendances?per_page=${limit}`,
          { headers: this.getHeaders() }
        )
      );

      const attendances = Array.isArray(response.data) ? response.data : (response as any).data?.data || [];
      return attendances.filter((att: any) => att.employee_id === employee.id);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      return [];
    }
  }
}
