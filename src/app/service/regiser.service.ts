import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterModel } from '../models/register.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private http: HttpClient = inject(HttpClient);
  constructor() { }
  register(registerData: RegisterModel): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`/common/register`, registerData);
  }
}