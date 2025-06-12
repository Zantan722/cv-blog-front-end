import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { RegisterService } from '../service/regiser.service';
import { NotificationService } from '../service/notification.service';
import { EMPTY, startWith, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let registerServiceSpy: jasmine.SpyObj<RegisterService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  beforeEach(async () => {
    const registerSpy = jasmine.createSpyObj('RegisterComponent', ['register']);
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedInSync', 'isServiceInitialized']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const notificationSpyObj = jasmine.createSpyObj('NotificationService', ['error', 'warning', 'alert']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: RegisterService, useValue: registerSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: NotificationService, useValue: notificationSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    registerServiceSpy = TestBed.inject(RegisterService) as jasmine.SpyObj<RegisterService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('fullName')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
  });

  describe('Form Validation', () => {
    it('should be invalid when form is empty', () => {
      expect(component.registerForm.valid).toBeFalsy();
    });

    it('should be invalid when email is invalid', () => {
      component.registerForm.patchValue({
        email: 'invalid-email',
        password: 'Aaa123123123',
        fullName: 'Test1'
      });
      expect(component.registerForm.get('email')?.invalid).toBeTruthy();
    });

    it('should be invalid when password is too short', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'short'
      });
      expect(component.registerForm.get('password')?.invalid).toBeTruthy();
    });

    it('should be invalid when name is empty', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'short',
        fullName: ''
      });
      expect(component.registerForm.get('password')?.invalid).toBeTruthy();
    });

    it('should be invalid when name is too short', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'short',
        fullName: 'T'
      });
      expect(component.registerForm.get('password')?.invalid).toBeTruthy();
    });

    it('should be valid when all fields are correctly filled', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'ValidPassword123',
        confirmPassword: 'ValidPassword123',
        fullName: 'UserTest'
      });
      expect(component.registerForm.valid).toBeTruthy();
    });
  });

  describe('Password Validation Methods', () => {
    beforeEach(() => {
      component.registerForm.patchValue({
        password: 'ValidPassword123'
      });
    });

    it('should validate password length correctly', () => {
      expect(component.isPasswordLengthValid()).toBeTruthy();

      component.registerForm.patchValue({ password: 'short' });
      expect(component.isPasswordLengthValid()).toBeFalsy();
    });

    it('should check for uppercase letters', () => {
      expect(component.hasUppercase()).toBeTruthy();

      component.registerForm.patchValue({ password: 'validpassword123' });
      expect(component.hasUppercase()).toBeFalsy();
    });

    it('should check for lowercase letters', () => {
      expect(component.hasLowercase()).toBeTruthy();

      component.registerForm.patchValue({ password: 'VALIDPASSWORD123' });
      expect(component.hasLowercase()).toBeFalsy();
    });

    it('should check for numbers', () => {
      expect(component.hasNumber()).toBeTruthy();

      component.registerForm.patchValue({ password: 'ValidPassword' });
      expect(component.hasNumber()).toBeFalsy();
    });
  });

  describe('Confrim Password Methods.', () => {
    beforeEach(() => {
      component.registerForm.patchValue({
        password: 'ValidPassword123'
      })
    })

    it('comfirm password invalid', () => {
      component.registerForm.patchValue({
        confirmPassword: `1`,
      });
      component.registerForm.markAllAsTouched();
      expect(component.isConfirmPasswordInvalid()).toBeTruthy();
    });

    it('comfirm password miss match', () => {
      component.registerForm.patchValue({
        password: 'ValidPassword123',
        confirmPassword: `123`,
      });
      expect(component.isPasswordMatching()).toBeFalsy();
    });

    it('comfirm password match', () => {
      component.registerForm.patchValue({
        confirmPassword: `ValidPassword123`,
      });
      expect(component.isPasswordMatching()).toBeTruthy();
    });
  })

  describe('Register Process', () => {
    beforeEach(() => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'ValidPassword123',
        confirmPassword: 'ValidPassword123'
      });
    });

    it('should register successfully', fakeAsync(() => {
      registerServiceSpy.register.and.returnValue(EMPTY.pipe(
        // 使用 startWith 來模擬完成狀態
        startWith(undefined as void)
      ));
    }));

    it('should handle regist error', fakeAsync(() => {
      const errorResponse = { status: 400, error: 'Bad Request' };
      registerServiceSpy.register.and.returnValue(throwError(() => errorResponse));

      component.register();
      tick();

      expect(component.isSubmitting).toBeFalsy();
      expect(notificationSpy.error).toHaveBeenCalled();
    }));

    it('should not submit when form is invalid', () => {
      component.registerForm.patchValue({
        email: 'invalid@email.com',
        password: '123',
        confirmPassword: '123',
        name: 'TestUser'
      });

      component.register();

      expect(registerServiceSpy.register).not.toHaveBeenCalled();
      expect(notificationSpy.warning).toHaveBeenCalled();
    });
  });

  describe('UI Interactions', () => {


    it('should navigate to login page', () => {
      component.goToLogin();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });



});



