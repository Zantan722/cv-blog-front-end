import { CommonModule } from '@angular/common';
import { LoginModel } from './../models/login.model';
import { LoginService } from './../service/login.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  myForm: FormGroup;


  constructor(private fb: FormBuilder, private router: Router, private loginService: LoginService, private authServive: AuthService) {
    this.myForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(10)]]
    });

  }

  // 檢查密碼長度是否有效
  isPasswordLengthValid(): boolean {
    const password = this.myForm.get('password')?.value;
    return password ? password.length >= 10 : false;
  }

  // 檢查是否包含大寫字母
  hasUppercase(): boolean {
    const password = this.myForm.get('password')?.value;
    return password ? /[A-Z]/.test(password) : false;
  }

  // 檢查是否包含小寫字母
  hasLowercase(): boolean {
    const password = this.myForm.get('password')?.value;
    return password ? /[a-z]/.test(password) : false;
  }

  // 檢查是否包含數字
  hasNumber(): boolean {
    const password = this.myForm.get('password')?.value;
    return password ? /[0-9]/.test(password) : false;
  }

  // 取得密碼錯誤訊息
  getPasswordErrorMessage(): string {
    const passwordControl = this.myForm.get('password');
    if (passwordControl?.hasError('required')) {
      return '請輸入密碼';
    }

    if (!this.isPasswordLengthValid()) {
      return '密碼至少需要 10 個字符';
    }

    if (!this.hasUppercase()) {
      console.log(123);
      return '密碼必須包含至少一個大寫字母';
    }

    if (!this.hasLowercase()) {
      return '密碼必須包含至少一個小寫字母';
    }

    if (!this.hasNumber()) {
      return '密碼必須包含至少一個數字';
    }

    return '';
  }

  // 🔍 檢查密碼是否被觸碰過且無效
  isPasswordInvalid(): boolean {
    const passwordControl = this.myForm.get('password');
    const invalid = passwordControl ? passwordControl.touched && !(this.isPasswordLengthValid() && this.hasUppercase() && this.hasLowercase() && this.hasLowercase() && this.hasNumber())
      : false;
    return invalid;
  }

  isButtonDisabled(): boolean {
    const eamilControl = this.myForm.get('email')
    const emailInvalid = eamilControl?.invalid;
    const passwordInvalid = this.isPasswordInvalid();
    return emailInvalid || passwordInvalid;
  }


  login() {
    this.myForm.markAllAsTouched();

    if (this.myForm.valid) {
      const loginData: LoginModel = {
        email: this.myForm.get('email')?.value,
        password: this.myForm.get('password')?.value
      };

      console.log('🔑 發送登入請求:', loginData);

      this.loginService.login(loginData).subscribe({
        next: (response) => {
          console.log('登入成功，收到回應:', response);
          let jwt: string | null = null;
          if (typeof response === 'string') {
            // 如果是 token 字串
            jwt = response;
          } else if (response && typeof response === 'object') {
            // 如果是物件，可能包含 token 和 user 資訊
            if ((response as any).token) {
              jwt = (response as any).token;
            }

          }
          if (jwt != null) {
            localStorage.setItem('jwt', jwt);
            this.authServive.login(jwt);
          }
          this.router.navigate(['blog']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('登入失敗:', error);


          try {
            const errorData = error.error as ApiResponse;
            if (errorData.message) {
              alert(errorData.message);
            } else {
              alert('登入失敗，請檢查帳號密碼');
            }
          } catch (e) {
            alert('登入失敗，請檢查帳號密碼');
          }

        }
      });
    } else {
      // 表單驗證失敗的處理
      if (!this.myForm.get('email')?.valid) {
        alert("請確認信箱資訊填入正確");
      } else if (this.isPasswordInvalid()) {
        alert(this.getPasswordErrorMessage());
      } else {
        alert("請確認資訊皆填入正確");
      }
    }
  }

}
