import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private registerUrl:string;
  constructor(private http:HttpClient) {
    this.registerUrl = environment.baseUrl+ '/user/save';
   }

  register(data:object): Observable<object>{
    return this.http.post(this.registerUrl,data);
  }
}
