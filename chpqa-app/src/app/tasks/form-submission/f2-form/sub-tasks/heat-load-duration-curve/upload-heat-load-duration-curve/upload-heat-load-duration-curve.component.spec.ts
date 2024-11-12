import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadHeatLoadDurationCurveComponent } from './upload-heat-load-duration-curve.component';

describe('UploadHeatLoadDurationCurveComponent', () => {
  let component: UploadHeatLoadDurationCurveComponent;
  let fixture: ComponentFixture<UploadHeatLoadDurationCurveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadHeatLoadDurationCurveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadHeatLoadDurationCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
