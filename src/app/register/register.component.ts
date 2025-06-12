import { NotificationService } from '././../service/notification.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RegisterService } from './../service/regiser.service';
import { RegisterModel } from './../models/register.model';
import { ApiResponse } from './../models/api-response.model';
import { BaseComponent } from './../home/base/base.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent extends BaseComponent implements OnInit {

  registerForm: FormGroup;
  isSubmitting = false;

  private fb: FormBuilder = inject(FormBuilder);
  private registerService: RegisterService = inject(RegisterService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    super();
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator()]],
      confirmPassword: ['', [Validators.required]],
      fullName: ['', [Validators.required, Validators.minLength(2)]]
    }, {
      validators: this.passwordMatchValidator
    });
  }


  protected override async onComponentInit(): Promise<void> {
    this.registerForm.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }


  // 自訂密碼驗證器
  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const hasNumber = /[0-9]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasMinLength = value.length >= 10;

      const passwordValid = hasNumber && hasUpper && hasLower && hasMinLength;

      return !passwordValid ? { passwordRequirements: true } : null;
    };
  }

  // 密碼確認驗證器
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // 清除 confirmPassword 的 passwordMismatch 錯誤，但保留其他錯誤
      const confirmPasswordControl = form.get('confirmPassword');
      if (confirmPasswordControl?.errors) {
        delete confirmPasswordControl.errors['passwordMismatch'];
        if (Object.keys(confirmPasswordControl.errors).length === 0) {
          confirmPasswordControl.setErrors(null);
        }
      }
      return null;
    }
  }

  // 檢查密碼長度是否有效
  isPasswordLengthValid(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password ? password.length >= 10 : false;
  }

  // 檢查是否包含大寫字母
  hasUppercase(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password ? /[A-Z]/.test(password) : false;
  }

  // 檢查是否包含小寫字母
  hasLowercase(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password ? /[a-z]/.test(password) : false;
  }

  // 檢查是否包含數字
  hasNumber(): boolean {
    const password = this.registerForm.get('password')?.value;
    return password ? /[0-9]/.test(password) : false;
  }

  // 檢查密碼是否一致
  isPasswordMatching(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  // 取得密碼錯誤訊息
  getPasswordErrorMessage(): string {
    const passwordControl = this.registerForm.get('password');
    if (passwordControl?.hasError('required')) {
      return '請輸入密碼';
    }

    if (!this.isPasswordLengthValid()) {
      return '密碼至少需要 10 個字符';
    }

    if (!this.hasUppercase()) {
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

  // 檢查密碼是否被觸碰過且無效
  isPasswordInvalid(): boolean {
    const passwordControl = this.registerForm.get('password');
    return passwordControl ?
      passwordControl.touched && passwordControl.hasError('passwordRequirements') : false;
  }

  // 檢查確認密碼是否無效
  isConfirmPasswordInvalid(): boolean {
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    return confirmPasswordControl ?
      confirmPasswordControl.touched &&
      (confirmPasswordControl.hasError('required') || confirmPasswordControl.hasError('passwordMismatch')) : false;
  }

  // 檢查註冊按鈕是否應該被禁用
  isButtonDisabled(): boolean {
    return this.registerForm.invalid || this.isSubmitting;
  }

  // 註冊函數
  register(): void {
    this.registerForm.markAllAsTouched();
    this.cdr.markForCheck();

    if (this.registerForm.valid) {
      this.setIsSubmit(true);

      const registerData: RegisterModel = {
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
        name: this.registerForm.get('fullName')?.value
      };

      console.log('📝 發送註冊請求:', registerData);

      this.registerService.register(registerData)
        .pipe(finalize(() => {
          this.setIsSubmit(false);
        }))
        .subscribe({
          next: (response: any) => {
            console.log('註冊成功，收到回應:', response);

            this.notificationService.success('註冊成功！請前往登入頁面登入。');
            this.router.navigate(['/login']);
          },
          error: (error: HttpErrorResponse) => {
            console.error('註冊失敗:', error);
            this.setIsSubmit(false);

            try {
              const errorData = error.error as ApiResponse;
              if (typeof error != 'boolean' && typeof error === 'object' && !errorData.message) {
                this.notificationService.error('註冊失敗，請稍後再試');
              }
            } catch (e) {
              this.notificationService.error('註冊失敗，請稍後再試');
            }
          }
        });
    } else {
      // 表單驗證失敗的處理
      this.showValidationErrors();
    }
  }

  // 顯示驗證錯誤
  private showValidationErrors(): void {
    const emailControl = this.registerForm.get('email');
    const passwordControl = this.registerForm.get('password');
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    const fullNameControl = this.registerForm.get('fullName');


    if (emailControl?.invalid) {
      if (emailControl.hasError('required')) {
        this.notificationService.warning('請輸入電子郵件');
      } else if (emailControl.hasError('email')) {
        this.notificationService.warning('請輸入有效的電子郵件格式');
      }
    } else if (passwordControl?.invalid) {
      this.notificationService.warning(this.getPasswordErrorMessage());
    } else if (confirmPasswordControl?.invalid) {
      if (confirmPasswordControl.hasError('required')) {
        this.notificationService.warning('請確認密碼');
      } else if (confirmPasswordControl.hasError('passwordMismatch')) {
        this.notificationService.warning('密碼確認不一致');
      }
    } else if (fullNameControl?.invalid) {
      if (fullNameControl.hasError('required')) {
        this.notificationService.warning('請輸入姓名');
      } else if (fullNameControl.hasError('minlength')) {
        this.notificationService.warning('姓名至少需要 2 個字符');
      }
    } else {
      this.notificationService.warning('請確認所有資訊皆填入正確');
    }
  }

  setIsSubmit(submit: boolean) {
    this.isShowLoadingModal(submit);
    this.isSubmitting = submit;
    this.cdr.markForCheck;
  }

}