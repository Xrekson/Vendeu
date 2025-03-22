import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private registerUrl: string;
  public userData: BehaviorSubject<{
    id: string,
    token: string,
    username: string
  }> = new BehaviorSubject({
    id: "",
    token: "",
    username: ""
  });

  public getUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.getUser = this.userData.asObservable();
    this.registerUrl = environment.baseUrl + '/login';
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
}
