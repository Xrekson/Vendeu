import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { MainRoutingModule } from './main-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


import { ImageModule } from 'primeng/image';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RegisterComponent } from './register/register.component';


@NgModule({
  declarations: [HomeComponent,RegisterComponent],
  imports: [
    CommonModule,
    MainRoutingModule,
    ImageModule,
    CarouselModule,
    TagModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule
]
})
export class MainModule { }
