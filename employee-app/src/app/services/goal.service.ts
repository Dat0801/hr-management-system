import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

interface GoalResponse {
  id?: number;
  employee_id?: number;
  title?: string;
  description?: string;
  category?: string;
  success_criteria?: string;
  start_date?: string;
  due_date?: string;
  status?: string;
  progress_percentage?: number;
  progress_notes?: string;
  weight?: number;
  alignment_with_company?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoalService {
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

  async getMyGoals(): Promise<GoalResponse[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: GoalResponse[] }>(
          `${this.apiUrl}/my-goals`,
          { headers: this.getHeaders() }
        )
      );

      return Array.isArray(response.data) ? response.data : (response as any).data?.data || [];
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  }

  async getGoalById(id: number): Promise<GoalResponse | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: GoalResponse }>(
          `${this.apiUrl}/goals/${id}`,
          { headers: this.getHeaders() }
        )
      );

      return response.data || (response as any).data;
    } catch (error) {
      console.error('Error fetching goal details:', error);
      return null;
    }
  }

  async updateProgress(goalId: number, progressPercentage: number, notes?: string): Promise<GoalResponse> {
    const payload: any = {
      progress_percentage: progressPercentage,
    };
    if (notes) {
      payload.notes = notes;
    }

    const response = await firstValueFrom(
      this.http.post<{ data: GoalResponse }>(
        `${this.apiUrl}/goals/${goalId}/update-progress`,
        payload,
        { headers: this.getHeaders() }
      )
    );

    return response.data || response;
  }

  async getCompletionStats(): Promise<any> {
    try {
      const employee = this.authService.getEmployee() as any;
      if (!employee?.id) return null;

      const response = await firstValueFrom(
        this.http.get<{ completion: any }>(
          `${this.apiUrl}/employee/${employee.id}/goals/completion`,
          { headers: this.getHeaders() }
        )
      );

      return response.completion || null;
    } catch (error) {
      console.error('Error fetching completion stats:', error);
      return null;
    }
  }
}
