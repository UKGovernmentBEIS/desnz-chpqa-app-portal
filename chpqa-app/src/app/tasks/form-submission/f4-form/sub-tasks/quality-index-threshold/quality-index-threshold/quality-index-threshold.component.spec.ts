import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualityIndexThresholdComponent } from './quality-index-threshold.component';

describe('QualityIndexThresholdComponent', () => {
  let component: QualityIndexThresholdComponent;
  let fixture: ComponentFixture<QualityIndexThresholdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualityIndexThresholdComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QualityIndexThresholdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
