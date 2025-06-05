import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginModel } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  url = "";
  constructor(private http: HttpClient) {

  }
  login(value: LoginModel) {
    return this.http.post(this.url + '/jwtLogin', value);
  }

}
