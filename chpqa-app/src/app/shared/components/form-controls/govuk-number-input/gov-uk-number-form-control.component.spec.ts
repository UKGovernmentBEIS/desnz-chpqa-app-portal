import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovUkNumberFormControlComponent } from './gov-uk-number-form-control.component';

describe('GovUkNumberFormControlComponent', () => {
  let component: GovUkNumberFormControlComponent;
  let fixture: ComponentFixture<GovUkNumberFormControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovUkNumberFormControlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovUkNumberFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
