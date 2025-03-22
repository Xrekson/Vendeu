import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { sessionReducer } from './services/Store/session.reducer';
import { PersistStateModule, localStorageStrategy } from '@ngrx-addons/persist-state';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FooterComponent } from './shared/footer/footer.component';
import { TopBarComponent } from './shared/top-bar/top-bar.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import nora from '@primeng/themes/nora';
import { providePrimeNG } from 'primeng/config';
import { AuthInterceptor } from './services/interceptor/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterOutlet,
    FontAwesomeModule,
    FooterComponent,
    TopBarComponent,
    StoreModule.forRoot({ session: sessionReducer }),

    // Persist State for session
    PersistStateModule.forRoot({
      states: [
        {
          key: 'session',
          storage: localStorageStrategy
        }
      ]
    })

  ],
  providers: [
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: nora,
      },
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
