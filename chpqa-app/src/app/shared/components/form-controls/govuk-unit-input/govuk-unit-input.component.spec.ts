import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovukUnitInputComponent } from './govuk-unit-input.component';

describe('GovukUnitInputComponent', () => {
  let component: GovukUnitInputComponent;
  let fixture: ComponentFixture<GovukUnitInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovukUnitInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovukUnitInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
