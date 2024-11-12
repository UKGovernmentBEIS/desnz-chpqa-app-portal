import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationEmailComponent } from './registration-email.component';

describe('RegistrationEmailComponent', () => {
  let component: RegistrationEmailComponent;
  let fixture: ComponentFixture<RegistrationEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationEmailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
