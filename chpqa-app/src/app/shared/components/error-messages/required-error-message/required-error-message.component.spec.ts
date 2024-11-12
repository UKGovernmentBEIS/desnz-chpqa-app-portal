import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequiredErrorMessageComponent } from './required-error-message.component';

describe('RequiredErrorMessagesComponent', () => {
  let component: RequiredErrorMessageComponent;
  let fixture: ComponentFixture<RequiredErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequiredErrorMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequiredErrorMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
