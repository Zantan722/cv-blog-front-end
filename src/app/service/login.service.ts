// src/app/service/login.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginModel } from '../models/login.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) {}

  login(loginData: LoginModel): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`/common/login`, loginData);
  }

  logout(): void {
    localStorage.removeItem('jwt');
  }
}