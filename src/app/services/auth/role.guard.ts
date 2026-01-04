import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AppState } from '../Store/app.store';
import { selectUserType, selectIsAuthenticated } from '../Store/session.selectors';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const requiredRoles = route.data['roles'] as string[] | string;
    
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }

        return this.checkUserRole(requiredRoles, state.url);
      })
    );
  }

  private checkUserRole(requiredRoles: string[] | string, returnUrl: string): boolean {
    let userType: string | null = null;
    
    this.store.select(selectUserType).pipe(take(1)).subscribe(type => {
      userType = type;
    });

    if (!userType) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    const rolesArray = Array.isArray(requiredRoles) 
      ? requiredRoles 
      : [requiredRoles];

    const hasRole = rolesArray.includes(userType);
    
    if (!hasRole) {
      console.warn(`Access denied. Required roles: ${rolesArray.join(', ')}, User role: ${userType}`);
      this.router.navigate(['/unauthorized'], {
        queryParams: { returnUrl }
      });
      return false;
    }

    return true;
  }
}