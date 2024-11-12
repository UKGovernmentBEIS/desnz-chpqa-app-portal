import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosePasswordFormComponent } from './choose-password-form.component';

describe('ChoosePasswordFormComponent', () => {
  let component: ChoosePasswordFormComponent;
  let fixture: ComponentFixture<ChoosePasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoosePasswordFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChoosePasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
