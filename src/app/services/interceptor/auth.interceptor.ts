import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { exhaustMap, take } from 'rxjs/operators';
import { AppState } from '../Store/app.store';
import { selectSession } from '../Store/session.selectors';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private store: Store<AppState>) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.store.pipe(
      select(selectSession),
      take(1), // Take the latest session state once
      exhaustMap(session => {
        if (!session || !session.token) {
          return next.handle(req);
        }
        
        // Clone request and add Authorization header
        const modifiedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${session.token}`
          }
        });

        return next.handle(modifiedReq);
      })
    );
  }
}
