// src/app/service/login.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginModel } from '../models/login.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http: HttpClient = inject(HttpClient);
  constructor() { }

  login(loginData: LoginModel): Observable<string> {
    return this.http.post<string>(`/common/login`, loginData);
  }

  logout(): void {
    localStorage.removeItem('jwt');
  }
}