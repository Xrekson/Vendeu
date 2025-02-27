import { Routes } from '@angular/router';

export const routes: Routes = [{path:'' , redirectTo:'home', pathMatch:'prefix'},
    { path:'home', loadChildren: ()=>import('./main/main.module').then((m)=>m.MainModule)}
];
