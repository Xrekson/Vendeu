import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { 
    login, 
    loginSuccess, 
    loginFailure, 
    logout, 
    logoutSuccess,
    restoreSession 
} from './session.actions';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { AppState } from './app.store';
import { selectSession } from './session.selectors';

@Injectable()
export class SessionEffects {
    private readonly SESSION_KEY = 'auction_session';
    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'current_user';
    private actions$ = inject(Actions);

    constructor(
        private authService: AuthService,
        private store: Store<AppState>,
        private router: Router
    ) {}

    // Login effect
    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(login),
            mergeMap(({ username, password }) =>
            {
                let formData = {username:username,password:password}
                return this.authService.login(formData).pipe(
                    map(response => {
                        // Save to localStorage
                        this.saveSessionToStorage(response);
                        
                        // Dispatch success action
                        return loginSuccess({ 
                            session: {
                                id: response.id,
                                username: response.username,
                                token: response.token,
                                type: response.type,
                                expiresAt: this.calculateExpiry(24), // 24 hours
                                lastLogin: Math.floor(Date.now() / 1000),
                                isAuthenticated: true
                            }
                        });
                    }),
                    catchError(error => {
                        console.error('Login error:', error);
                        return of(loginFailure({ 
                            error: error.message || 'Login failed' 
                        }));
                    })
                );
            }
            )
        )
    );

    // Login success effect (redirect)
    loginSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loginSuccess),
            tap(({ session }) => {
                // Redirect based on user type
                if (session.type === 'admin') {
                    this.router.navigate(['/admin']);
                } else {
                    this.router.navigate(['/dash']);
                }
            })
        ),
        { dispatch: false }
    );

    // Login failure effect (show error)
    loginFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loginFailure),
            tap(({ error }) => {
                console.error('Login failed:', error);
                // You could show a toast notification here
            })
        ),
        { dispatch: false }
    );

    // Logout effect
    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(logout),
            withLatestFrom(this.store.select(selectSession)),
            tap(([action, session]) => {
                // Clear localStorage
                this.clearSessionFromStorage();
                
                // Call logout API if needed
                if (session.token) {
                    this.authService.logout().subscribe();
                }
                
                // Redirect to login
                this.router.navigate(['/login']);
            }),
            map(() => logoutSuccess())
        )
    );

    // Restore session from storage on app init
    restoreSession$ = createEffect(() =>
        this.actions$.pipe(
            ofType('[App Init] Restore Session'),
            map(() => {
                const session = this.getSessionFromStorage();
                if (session && this.isSessionValid(session)) {
                    return restoreSession({ session });
                }
                return { type: 'NO_ACTION' };
            })
        )
    );

    // Auto-logout on token expiry (polling)
    autoLogout$ = createEffect(() =>
        this.actions$.pipe(
            ofType('[Session] Check Expiry'),
            withLatestFrom(this.store.select(selectSession)),
            map(([action, session]) => {
                if (session.token && session.expiresAt) {
                    const now = Math.floor(Date.now() / 1000);
                    if (now >= session.expiresAt) {
                        return logout();
                    }
                }
                return { type: 'NO_ACTION' };
            })
        )
    );

    // Private helper methods
    private saveSessionToStorage(session: any): void {
        const sessionData = {
            id: session.id,
            username: session.username,
            token: session.token,
            type: session.type,
            expiresAt: this.calculateExpiry(24),
            lastLogin: Math.floor(Date.now() / 1000)
        };
        
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        localStorage.setItem(this.TOKEN_KEY, session.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify({
            id: session.id,
            username: session.username,
            type: session.type
        }));
    }

    private getSessionFromStorage(): any {
        const sessionStr = localStorage.getItem(this.SESSION_KEY);
        if (!sessionStr) return null;
        
        try {
            return JSON.parse(sessionStr);
        } catch (error) {
            console.error('Error parsing session from storage:', error);
            return null;
        }
    }

    private clearSessionFromStorage(): void {
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    private calculateExpiry(hours: number): number {
        return Math.floor(Date.now() / 1000) + (hours * 3600);
    }

    private isSessionValid(session: any): boolean {
        if (!session.expiresAt) return false;
        const now = Math.floor(Date.now() / 1000);
        return session.expiresAt > now;
    }
}