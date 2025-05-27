import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
private createUrl:string;
  private allUrl:string;
  private singleData:string;


  constructor(private http:HttpClient) {
    this.createUrl = environment.baseUrl+ '/listing/save';
    this.allUrl = environment.baseUrl+ '/listings';
    this.singleData = environment.baseUrl+ '/listing/';

   }

  createListing(data: object): Observable<object> {
    return this.http.post(this.createUrl, data);
  }
  getAllListing(): Observable<object>{
    return this.http.get(this.allUrl);
  }
  getListing(ID:any): Observable<any>{
    return this.http.get(this.singleData+ID);
  }
}
