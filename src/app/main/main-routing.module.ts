import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { BidComponent } from './bid/bid.component';

const routes: Routes = [{ path: '', component: HomeComponent }, { path: 'register', component: RegisterComponent }, { path: 'login', component: LoginComponent }, { path: 'bid', component: BidComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
