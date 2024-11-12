import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovukSelectInputComponent } from './govuk-select-input.component';

describe('GovukSelectInputComponent', () => {
  let component: GovukSelectInputComponent;
  let fixture: ComponentFixture<GovukSelectInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovukSelectInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovukSelectInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
