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
    // return this.http.post(this.url + 'https://cv-user-service-app-683332902245.asia-east1.run.app/common/login', value);
    console.log("123123123");
    return this.http.post(this.url + '/common/login', value, {
      responseType: 'text' // 不解析 JSON
    });
  }

}
