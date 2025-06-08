import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogModifyComponent } from './blog-modify.component';

describe('BlogModifyComponent', () => {
  let component: BlogModifyComponent;
  let fixture: ComponentFixture<BlogModifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogModifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogModifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
