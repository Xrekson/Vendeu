import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { BidComponent } from './bid/bid.component';
import { AuthGuard } from '../services/auth/AUthGuard';
import { DashComponent } from './dash/dash.component';
import { AuctionDetailsComponent } from './auction-details/auction-details.component';

const routes: Routes = [{ path: '', component: HomeComponent },
{ path: 'register', component: RegisterComponent },
{ path: 'login', component: LoginComponent },
{ path: 'bid', component: BidComponent, canActivate: [AuthGuard] },
{ path: 'dash', component: DashComponent, canActivate: [AuthGuard] },
{ path: 'details/:id', component: AuctionDetailsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
