import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvideHoursOfOperationComponent } from './provide-hours-of-operation.component';

describe('ProvideHoursOfOperationComponent', () => {
  let component: ProvideHoursOfOperationComponent;
  let fixture: ComponentFixture<ProvideHoursOfOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvideHoursOfOperationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProvideHoursOfOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
