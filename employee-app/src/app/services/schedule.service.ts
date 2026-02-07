import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
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

  async getScheduleForMonth(year: number, month: number): Promise<any[]> {
    try {
      const employee = this.authService.getEmployee() as any;
      if (!employee?.id) return [];

      // Get attendance records for the month
      const attendanceResponse = await firstValueFrom(
        this.http.get<{ data: any[] }>(
          `${this.apiUrl}/attendances?per_page=100`,
          { headers: this.getHeaders() }
        )
      );

      const attendances = Array.isArray(attendanceResponse.data) 
        ? attendanceResponse.data 
        : (attendanceResponse as any).data?.data || [];

      // Get leave requests for the month
      const leaveResponse = await firstValueFrom(
        this.http.get<{ data: any[] }>(
          `${this.apiUrl}/leaves?per_page=100`,
          { headers: this.getHeaders() }
        )
      );

      const leaves = Array.isArray(leaveResponse.data) 
        ? leaveResponse.data 
        : (leaveResponse as any).data?.data || [];

      // Filter by employee and month
      const employeeAttendances = attendances.filter(
        (att: any) => att.employee_id === employee.id
      );

      const employeeLeaves = leaves.filter(
        (leave: any) => leave.employee_id === employee.id
      );

      // Combine and format schedule items
      const scheduleItems: any[] = [];

      // Process attendances
      employeeAttendances.forEach((att: any) => {
        const date = new Date(att.date);
        if (date.getFullYear() === year && date.getMonth() + 1 === month) {
          scheduleItems.push({
            date: att.date,
            type: 'attendance',
            check_in: att.check_in,
            check_out: att.check_out,
            status: att.status,
            notes: att.notes,
          });
        }
      });

      // Process leaves
      employeeLeaves.forEach((leave: any) => {
        const startDate = new Date(leave.start_date);
        const endDate = new Date(leave.end_date);
        
        // Add leave days for the month
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (currentDate.getFullYear() === year && currentDate.getMonth() + 1 === month) {
            scheduleItems.push({
              date: currentDate.toISOString().split('T')[0],
              type: 'leave',
              leave_type: leave.leave_type,
              status: leave.status,
              reason: leave.reason,
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      return scheduleItems.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return [];
    }
  }

  async getTodaySchedule(): Promise<any[]> {
    const today = new Date();
    return this.getScheduleForDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
  }

  async getScheduleForDate(year: number, month: number, day: number): Promise<any[]> {
    const schedule = await this.getScheduleForMonth(year, month);
    const targetDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return schedule.filter((item: any) => item.date === targetDate);
  }
}
