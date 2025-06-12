import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterModel } from '../models/register.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private http: HttpClient = inject(HttpClient);
  constructor() { }
  register(registerData: RegisterModel): Observable<void> {
    return this.http.post<void>(`/common/register`, registerData);
  }
}