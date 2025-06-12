
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogDetailComponent } from './blog-detail.component';
import { AuthService } from '../../../service/auth.service';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../../service/blog.service';
import { ChangeDetectorRef } from '@angular/core';


describe('BlogDetailComponent', () => {
  let component: BlogDetailComponent;
  let fixture: ComponentFixture<BlogDetailComponent>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let blogService: jasmine.SpyObj<BlogService>;
  let changeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;


  beforeEach(async () => {

    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedInSync','isServiceInitialized']);

    await TestBed.configureTestingModule({
      imports: [BlogDetailComponent],
      providers:[
        { provide: AuthService, useValue: authSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BlogDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
