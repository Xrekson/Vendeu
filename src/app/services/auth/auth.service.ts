import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Store } from '@ngrx/store';
import { AppState } from '../../services/Store/app.store';
import { loginSuccess, loginFailure, logout, updateSession } from '../../services/Store/session.actions';
import { Router } from '@angular/router';

// Response interfaces
interface LoginResponse {
  id: string;
  username: string;
  token: string;
  type: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  expiresIn?: number; // seconds until token expiry
  message?: string;
}

interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  type: string;
  message: string;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.baseUrl;
  private registerUrl = `${this.baseUrl}/register`;
  private loginUrl = `${this.baseUrl}/login`;
  private logoutUrl = `${this.baseUrl}/logout`;
  private refreshUrl = `${this.baseUrl}/refresh-token`;
  private verifyUrl = `${this.baseUrl}/verify-token`;
  
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  
  // Session storage keys
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly EXPIRY_KEY = 'token_expiry';
  private readonly REFRESH_KEY = 'refresh_token';

  constructor(
    private http: HttpClient,
    private store: Store<AppState>,
    private router: Router
  ) {}

  /**
   * Register a new user
   */
  register(data: any): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.registerUrl, data).pipe(
      tap(response => {
        this.handleSuccess('Registration successful! Please login.');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Login user
   */
  public login(data: FormData | any): Observable<LoginResponse> {
    // Convert object to FormData if needed
    let formData: FormData;
    if (!(data instanceof FormData)) {
      formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
    } else {
      formData = data;
    }

    return this.http.post<LoginResponse>(this.loginUrl, formData).pipe(
      tap(response => {
        // Save auth data to localStorage
        this.saveAuthData(response);
        
        // Dispatch login success to store
        this.store.dispatch(loginSuccess({ 
          session: {
            id: response.id,
            username: response.username,
            token: response.token,
            type: response.type,
            expiresAt: response.expiresIn 
              ? Math.floor(Date.now() / 1000) + response.expiresIn 
              : null,
            lastLogin: Math.floor(Date.now() / 1000),
            isAuthenticated: true
          }
        }));
        
        // Dispatch updateSession as well for compatibility
        this.store.dispatch(updateSession({
          session: {
            id: response.id,
            username: response.username,
            token: response.token,
            type: response.type,
            isAuthenticated: true
          }
        }));
        
        this.handleSuccess('Login successful!');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logout user
   */
  public logout(): Observable<any> {
    const token = this.getToken();
    
    // Clear local storage first
    this.clearAuthData();
    
    // Dispatch logout action
    this.store.dispatch(logout());
    
    // Call logout API if token exists
    if (token) {
      return this.http.post(this.logoutUrl, { token }).pipe(
        tap(() => {
          this.router.navigate(['/login']);
        }),
        catchError(error => {
          // Even if API call fails, ensure logout on client side
          this.router.navigate(['/login']);
          return throwError(error);
        })
      );
    }
    
    // If no token, just redirect
    this.router.navigate(['/login']);
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(this.refreshUrl, { refreshToken }).pipe(
      tap(response => {
        this.saveAuthData(response);
        this.store.dispatch(updateSession({
          session: {
            id: response.id,
            username: response.username,
            token: response.token,
            type: response.type,
            isAuthenticated: true
          }
        }));
      }),
      catchError(error => {
        this.clearAuthData();
        this.store.dispatch(logout());
        return throwError(error);
      })
    );
  }

  /**
   * Verify if current token is valid
   */
  verifyToken(): Observable<{ valid: boolean }> {
    const token = this.getToken();
    
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    return this.http.post<{ valid: boolean }>(this.verifyUrl, { token });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check token expiry if available
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    if (expiry) {
      const expiryTime = parseInt(expiry, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime >= expiryTime) {
        this.clearAuthData();
        return false;
      }
    }

    return true;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get current user data from storage
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.type === role;
  }

  /**
   * Password reset request
   */
  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/password/reset`, 
      { email }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/password/update`, 
      { token, password: newPassword }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Save auth data to localStorage
   */
  private saveAuthData(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    
    const userData = {
      id: response.id,
      username: response.username,
      type: response.type,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    
    // Calculate and store expiry time
    if (response.expiresIn) {
      const expiryTime = Math.floor(Date.now() / 1000) + response.expiresIn;
      localStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());
    }
    
    // Store refresh token if provided (usually in separate field)
    if ((response as any).refreshToken) {
      localStorage.setItem(this.REFRESH_KEY, (response as any).refreshToken);
    }
  }

  /**
   * Clear all auth data from localStorage
   */
  public clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    
    // Clear any other auth-related items
    localStorage.removeItem('remembered_user');
  }

  /**
   * Handle successful auth operations
   */
  private handleSuccess(message: string): void {
    console.log(message);
    // You could add toast notifications here
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.statusText || 'Server error';
      
      // Handle specific status codes
      switch (error.status) {
        case 400:
          errorMessage = error.error?.errors 
            ? this.formatValidationErrors(error.error.errors)
            : errorMessage;
          break;
        case 401:
          errorMessage = 'Invalid credentials';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 409:
          errorMessage = 'User already exists';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Format validation errors for display
   */
  private formatValidationErrors(errors: Record<string, string[]>): string {
    return Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('; ');
  }

  /**
   * Auto-login from stored credentials
   */
  autoLogin(): boolean {
    if (this.isAuthenticated()) {
      const user = this.getCurrentUser();
      const token = this.getToken();
      
      if (user && token) {
        // Dispatch login success with stored data
        this.store.dispatch(loginSuccess({
          session: {
            id: user.id,
            username: user.username,
            token: token,
            type: user.type,
            expiresAt: localStorage.getItem(this.EXPIRY_KEY) 
              ? parseInt(localStorage.getItem(this.EXPIRY_KEY)!, 10) 
              : null,
            lastLogin: Math.floor(Date.now() / 1000),
            isAuthenticated: true
          }
        }));
        
        return true;
      }
    }
    return false;
  }

  /**
   * Get auth headers for API requests
   */
  getAuthHeaders(): { [header: string]: string } {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Update user profile
   */
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile`, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response: any) => {
        // Update stored user data
        const currentUser = this.getCurrentUser();
        const updatedUser = { ...currentUser, ...response };
        localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/change-password`,
      { currentPassword, newPassword },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
}