import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

interface PerformanceReviewResponse {
  id?: number;
  employee_id?: number;
  reviewer_id?: number;
  rating_year?: number;
  period?: string;
  performance_summary?: string;
  strengths?: string;
  areas_for_improvement?: string;
  overall_rating?: number;
  rating_leadership?: number;
  rating_teamwork?: number;
  rating_communication?: number;
  rating_technical_skills?: number;
  rating_attendance?: number;
  status?: string;
  feedback_from_manager?: string;
  review_date?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PerformanceReviewService {
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

  async getMyReviews(): Promise<PerformanceReviewResponse[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: PerformanceReviewResponse[] }>(
          `${this.apiUrl}/my-performance-reviews`,
          { headers: this.getHeaders() }
        )
      );

      return Array.isArray(response.data) ? response.data : (response as any).data?.data || [];
    } catch (error) {
      console.error('Error fetching performance reviews:', error);
      return [];
    }
  }

  async getReviewById(id: number): Promise<PerformanceReviewResponse | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ data: PerformanceReviewResponse }>(
          `${this.apiUrl}/performance-reviews/${id}`,
          { headers: this.getHeaders() }
        )
      );

      return response.data || (response as any).data;
    } catch (error) {
      console.error('Error fetching review details:', error);
      return null;
    }
  }

  async getAverageRating(): Promise<number | null> {
    try {
      const employee = this.authService.getEmployee() as any;
      if (!employee?.id) return null;

      const response = await firstValueFrom(
        this.http.get<{ average_rating: number }>(
          `${this.apiUrl}/performance-reviews/employee/${employee.id}/average`,
          { headers: this.getHeaders() }
        )
      );

      return response.average_rating || null;
    } catch (error) {
      console.error('Error fetching average rating:', error);
      return null;
    }
  }
}
