import { CommonModule } from '@angular/common';
import { LoginModel } from './../models/login.model';
import { LoginService } from './../service/login.service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseComponent } from '../home/base/base.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent extends BaseComponent implements OnInit {

  loginForm: FormGroup;
  isSubmitting = false;
  showPassword = false;

  private fb: FormBuilder = inject(FormBuilder);
  private loginService: LoginService = inject(LoginService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    super();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  protected override async onComponentInit(): Promise<void> {


    this.loginForm.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
    // ✅ 監聽表單變化
    this.loginForm.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });

    // 監聽個別欄位狀態變化
    this.loginForm.get('email')?.statusChanges.subscribe(() => {
      this.cdr.markForCheck();
    });

    this.loginForm.get('password')?.statusChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  setIsSubmit(submit: boolean) {
    this.isShowLoadingModal(submit);
    this.isSubmitting = submit;
    this.cdr.markForCheck();
  }

  setShowPassword(show: boolean) {
    this.showPassword = show;
    this.cdr.markForCheck();
  }

  // 檢查密碼長度是否有效
  isPasswordLengthValid(): boolean {
    const password = this.loginForm.get('password')?.value;
    return password ? password.length >= 10 : false;
  }

  // 檢查是否包含大寫字母
  hasUppercase(): boolean {
    const password = this.loginForm.get('password')?.value;
    return password ? /[A-Z]/.test(password) : false;
  }

  // 檢查是否包含小寫字母
  hasLowercase(): boolean {
    const password = this.loginForm.get('password')?.value;
    return password ? /[a-z]/.test(password) : false;
  }

  // 檢查是否包含數字
  hasNumber(): boolean {
    const password = this.loginForm.get('password')?.value;
    return password ? /[0-9]/.test(password) : false;
  }

  // 取得密碼錯誤訊息
  getPasswordErrorMessage(): string {
    const passwordControl = this.loginForm.get('password');
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

  isEmailInvalid(): boolean {
    const emailControl = this.loginForm.get('email');
    return emailControl ?
      emailControl.touched && emailControl.invalid : false;
  }

  // 🔍 檢查密碼是否被觸碰過且無效
  isPasswordInvalid(): boolean {
    const passwordControl = this.loginForm.get('password');
    const invalid = passwordControl ? passwordControl.touched && !(this.isPasswordLengthValid() && this.hasUppercase() && this.hasLowercase() && this.hasLowercase() && this.hasNumber())
      : false;
    return invalid;
  }

  isButtonDisabled(): boolean {
    const eamilControl = this.loginForm.get('email')
    const emailInvalid = eamilControl?.invalid;
    const passwordInvalid = this.isPasswordInvalid();

    return emailInvalid || passwordInvalid || this.loginForm.invalid || this.isSubmitting;;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.cdr.markForCheck();
  }


  login() {
    this.loginForm.markAllAsTouched();
    this.cdr.markForCheck();

    if (this.loginForm.valid) {
      const loginData: LoginModel = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      console.log('🔑 發送登入請求:', loginData);
      this.setIsSubmit(true);
      this.loginService.login(loginData)
        .pipe(finalize(() => {
          this.setIsSubmit(false);
        }))
        .subscribe({
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
              this.authService.login(jwt);
            }
            this.router.navigate(['blog']);
          },
          error: (error: HttpErrorResponse) => {
            console.error('登入失敗:', error);


            try {
              if (typeof error != 'boolean' && typeof error === 'object' && !error.message) {
                this.notificationService.error('登入失敗，請檢查帳號密碼');
              }
            } catch (e) {
              this.notificationService.error('登入失敗，請檢查帳號密碼');
            }

          }
        });
    } else {
      // 表單驗證失敗的處理
      if (!this.loginForm.get('email')?.valid) {
        this.notificationService.alert("請確認信箱資訊填入正確");
      } else if (this.isPasswordInvalid()) {
        this.notificationService.warning(this.getPasswordErrorMessage());
      } else {
        this.notificationService.warning("請確認資訊皆填入正確");
      }
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

}
