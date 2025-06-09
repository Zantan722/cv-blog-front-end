import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterModel } from '../models/register.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private http: HttpClient) {}

  register(registerData: RegisterModel): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`/common/register`, registerData);
  }
}