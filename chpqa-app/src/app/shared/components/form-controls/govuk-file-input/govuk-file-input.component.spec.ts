import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovukFileInputComponent } from './govuk-file-input.component';

describe('GovukFileInputComponent', () => {
  let component: GovukFileInputComponent;
  let fixture: ComponentFixture<GovukFileInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovukFileInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovukFileInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
