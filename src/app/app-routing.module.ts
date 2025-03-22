import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{path:'home' , redirectTo:'', pathMatch:'prefix'},
  { path:'', loadChildren: ()=>import('./main/main.module').then((m)=>m.MainModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
