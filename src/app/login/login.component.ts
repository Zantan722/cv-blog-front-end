import { safeJsonParse } from './../../../node_modules/typed-assert/src/index';
import { CommonModule } from '@angular/common';
import { LoginModel } from './../models/login.model';
import { LoginService } from './../service/login.service';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  myForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private loginService: LoginService) {
    this.myForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null; // 如果沒有值，讓 required 驗證器處理
    }

    // 檢查最少長度 10
    if (value.length < 10) {
      return { minLength: { required: 10, actual: value.length } };
    }

    // 檢查是否包含大寫字母
    if (!/[A-Z]/.test(value)) {
      return { missingUppercase: true };
    }

    // 檢查是否包含小寫字母
    if (!/[a-z]/.test(value)) {
      return { missingLowercase: true };
    }

    // 檢查是否包含數字
    if (!/[0-9]/.test(value)) {
      return { missingNumber: true };
    }

    return null; // 驗證通過
  }

  // ✅ 檢查密碼長度是否有效
  isPasswordLengthValid(): boolean {
    const password = this.myForm.get('password')?.value;
    return password ? password.length >= 10 : false;
  }

  // ✅ 檢查是否包含大寫字母
  hasUppercase(): boolean {
    const password = this.myForm.get('password')?.value;
    return password ? /[A-Z]/.test(password) : false;
  }

  // ✅ 檢查是否包含小寫字母
  hasLowercase(): boolean {
    const password = this.myForm.get('password')?.value;
    return password ? /[a-z]/.test(password) : false;
  }

  // ✅ 檢查是否包含數字
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

    if (passwordControl?.hasError('minLength')) {
      return '密碼至少需要 10 個字符';
    }

    if (passwordControl?.hasError('missingUppercase')) {
      return '密碼必須包含至少一個大寫字母';
    }

    if (passwordControl?.hasError('missingLowercase')) {
      return '密碼必須包含至少一個小寫字母';
    }

    if (passwordControl?.hasError('missingNumber')) {
      return '密碼必須包含至少一個數字';
    }

    return '';
  }

  // 🔍 檢查密碼是否有效
  isPasswordValid(): boolean {
    const passwordControl = this.myForm.get('password');
    return passwordControl ? passwordControl.valid : false;
  }

  // 🔍 檢查密碼是否被觸碰過且無效
  isPasswordInvalid(): boolean {
    const passwordControl = this.myForm.get('password');
    return passwordControl ? passwordControl.invalid && passwordControl.touched : false;
  }

  login1() {
    const email = this.myForm.get('email')?.value;
    const password = this.myForm.get('password')?.value;

    console.log('Input 1:', email);
    console.log('Input 2:', password);
    // 處理這兩個值
  }


  login() {
    this.myForm.markAllAsTouched();

    if (this.myForm.valid) {
      const loginData: LoginModel = {
        email: this.myForm.get('email')?.value,
        password: this.myForm.get('password')?.value
      };

      console.log('登入資料:', loginData);

      // 呼叫登入服務
      this.loginService.login(loginData).subscribe({
        next: (response) => {
          console.log('登入成功:', response);
          localStorage.setItem('jwt', response);
          this.router.navigate(['']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('登入失敗:', error);
          const jsonData = JSON.parse(error.error);
          alert(jsonData['message']);
        }
      });
    } else {
      console.log('表單驗證失敗');
    }
  }



}
