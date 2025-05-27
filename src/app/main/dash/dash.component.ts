import { Component } from '@angular/core';
import { Observable, SequenceError } from 'rxjs';
import { Session } from '../../services/Store/session.model';
import { AppState } from '../../services/Store/app.store';
import { Store } from '@ngrx/store';
import { selectMAIN } from '../../services/Store/session.selectors';
import { ListingComponent } from '../../shared/listing/listing.component';
import { CreateListingComponent } from '../../shared/create-listing/create-listing.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dash',
  imports:[ListingComponent,CreateListingComponent,CommonModule],
  templateUrl: './dash.component.html',
  styleUrl: './dash.component.scss'
})
export class DashComponent {
  data$: Observable<Session>;
  sesssion: Session | undefined;
  constructor(private store: Store<AppState>){
    this.data$ = this.store.select(selectMAIN);
    this.data$.subscribe(data=>{
      this.sesssion = data;
    })
  }
}
