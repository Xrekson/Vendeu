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
import { TopbarComponent } from './shared/top-bar/top-bar.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthInterceptor } from './services/interceptor/auth.interceptor';
import { WebsocketService } from './services/websocket/websocket.service';
import { rxStompClientFactory } from './services/websocket/rx-stomp-client-factory';
import { EffectsModule } from '@ngrx/effects';
import { SessionEffects } from './services/Store/session.effects';

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
    TopbarComponent,
    StoreModule.forRoot({ session: sessionReducer }),

    // Persist State for session
    PersistStateModule.forRoot({
      states: [
        {
          key: 'session',
          storage: localStorageStrategy
        }
      ]
    }),

    EffectsModule.forRoot([SessionEffects])

  ],
  providers: [
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    {
      provide: WebsocketService,
      useFactory: rxStompClientFactory
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
