    import { Injectable } from '@angular/core';
    import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectMAIN } from '../Store/session.selectors';
import { Observable, map, tap } from 'rxjs';
    
    @Injectable({
      providedIn: 'root'
    })
    export class AuthGuard implements CanActivate {
    
      constructor(private store:Store, private router: Router) { }
    
      canActivate(): Observable<boolean> {
    return this.store.select(selectMAIN).pipe(
      map(session => {
        // Adjust the condition based on your session object structure
        return !!session?.username; // e.g., user is logged in
      }),
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']);
        }
      })
    );
  }
    
    }