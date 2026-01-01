import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { MainRoutingModule } from './main-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RegisterComponent } from './register/register.component';


// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';


import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../services/auth/auth.service';
import { LoginComponent } from './login/login.component';
import { StoreModule } from '@ngrx/store';
import { BidComponent } from './bid/bid.component';
import { BiddingMsgComponent } from '../shared/bidding-msg/bidding-msg.component';
import { RouterBackService } from '../services/routerBack.service';
import { CarouselComponent } from '../shared/carousel/carousel.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

@NgModule({
  declarations: [HomeComponent,RegisterComponent,LoginComponent,BidComponent],
  imports: [
    CommonModule,
    MainRoutingModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule,
    BiddingMsgComponent,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatInputModule,
    MatStepperModule,
    MatSelectModule,
    MatDatepickerModule,

    CarouselComponent,
    ConfirmationDialogComponent
],providers:[AuthService,RouterBackService]
})
export class MainModule { }
