import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { LoginService } from '../service/login.service';
import { AuthService } from '../service/auth.service';
import { NotificationService } from '../service/notification.service';
import { ApiResponse } from '../models/api-response.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const loginSpy = jasmine.createSpyObj('LoginService', ['login']);
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'isLoggedInSync', 'isServiceInitialized']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const notificationSpyObj = jasmine.createSpyObj('NotificationService', ['error', 'warning', 'alert', 'showLoading']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: LoginService, useValue: loginSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: NotificationService, useValue: notificationSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    loginServiceSpy = TestBed.inject(LoginService) as jasmine.SpyObj<LoginService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    // Mock localStorage
    spyOn(localStorage, 'setItem');
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  describe('Form Validation', () => {
    it('should be invalid when form is empty', () => {
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should be invalid when email is invalid', () => {
      component.loginForm.patchValue({
        email: 'invalid-email',
        password: 'ValidPassword123'
      });
      expect(component.loginForm.get('email')?.invalid).toBeTruthy();
    });

    it('should be invalid when password is too short', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'short'
      });
      expect(component.loginForm.get('password')?.invalid).toBeTruthy();
    });

    it('should be valid when all fields are correctly filled', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'ValidPassword123'
      });
      expect(component.loginForm.valid).toBeTruthy();
    });
  });

  describe('Password Validation Methods', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        password: 'ValidPassword123'
      });
    });

    it('should validate password length correctly', () => {
      expect(component.isPasswordLengthValid()).toBeTruthy();
      
      component.loginForm.patchValue({ password: 'short' });
      expect(component.isPasswordLengthValid()).toBeFalsy();
    });

    it('should check for uppercase letters', () => {
      expect(component.hasUppercase()).toBeTruthy();
      
      component.loginForm.patchValue({ password: 'validpassword123' });
      expect(component.hasUppercase()).toBeFalsy();
    });

    it('should check for lowercase letters', () => {
      expect(component.hasLowercase()).toBeTruthy();
      
      component.loginForm.patchValue({ password: 'VALIDPASSWORD123' });
      expect(component.hasLowercase()).toBeFalsy();
    });

    it('should check for numbers', () => {
      expect(component.hasNumber()).toBeTruthy();
      
      component.loginForm.patchValue({ password: 'ValidPassword' });
      expect(component.hasNumber()).toBeFalsy();
    });
  });

  describe('Login Process', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'ValidPassword123'
      });
    });

    it('should login successfully', fakeAsync(() => {
      const mockToken = 'mock-jwt-token';
      loginServiceSpy.login.and.returnValue(of(mockToken));

      component.login();
      tick();

      expect(loginServiceSpy.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'ValidPassword123'
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('jwt',mockToken );
      expect(authServiceSpy.login).toHaveBeenCalledWith(mockToken);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['blog']);
    }));

    it('should handle login error', fakeAsync(() => {
      const errorResponse = { error: { message: 'Login failed' } };
      loginServiceSpy.login.and.returnValue(throwError(() => errorResponse));

      component.login();
      tick();

      expect(component.isSubmitting).toBeFalsy();
      // 除非非預期Error 不然進不來
      expect(notificationSpy.error).toHaveBeenCalled();
    }));

    it('should not submit when form is invalid', () => {
      component.loginForm.patchValue({
        email: 'invalid-email',
        password: 'short'
      });

      component.login();

      expect(loginServiceSpy.login).not.toHaveBeenCalled();
      expect(notificationSpy.alert).toHaveBeenCalled();
    });
  });

  describe('UI Interactions', () => {
    it('should toggle password visibility', () => {
      expect(component.showPassword).toBeFalsy();
      
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeTruthy();
      
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeFalsy();
    });

    it('should navigate to register page', () => {
      component.goToRegister();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/register']);
    });

  });
});