import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  user: unknown;
  employee: unknown;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl ?? 'http://localhost:8000/api';
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'user_data';
  private readonly employeeKey = 'employee_data';

  private readonly http = inject(HttpClient);

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }),
    );
    this.setToken(response.token);
    this.setUser(response.user);
    if (response.employee) {
      this.setEmployee(response.employee);
    }
    return response;
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/logout`, {}));
    } catch (error) {
    }
    this.clearSession();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): unknown {
    const value = localStorage.getItem(this.userKey);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  getEmployee(): unknown {
    const value = localStorage.getItem(this.employeeKey);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: unknown): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private setEmployee(employee: unknown): void {
    localStorage.setItem(this.employeeKey, JSON.stringify(employee));
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.employeeKey);
  }
}
