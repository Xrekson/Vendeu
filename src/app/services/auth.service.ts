import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private registerUrl:string;
  private loginUrl:string;

  constructor(private http:HttpClient) {
    this.registerUrl = environment.baseUrl+ '/register';
    this.loginUrl = environment.baseUrl+ '/login';
   }

  register(data: object): Observable<object> {
    return this.http.post(this.registerUrl, data);
  }
  setUser(data: {
    id: string,
    token: string,
    username: string
  }) {
    this.userData.next(data);
  }
  login(data:object): Observable<object>{
    return this.http.post(this.loginUrl,data);
  }
  login(data:object): Observable<object>{
    return this.http.post(this.loginUrl,data);
  }
}
