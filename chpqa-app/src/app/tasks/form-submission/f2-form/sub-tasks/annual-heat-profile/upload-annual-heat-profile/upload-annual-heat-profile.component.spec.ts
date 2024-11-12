import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAnnualHeatProfileComponent } from './upload-annual-heat-profile.component';

describe('UploadAnnualHeatProfileComponent', () => {
  let component: UploadAnnualHeatProfileComponent;
  let fixture: ComponentFixture<UploadAnnualHeatProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadAnnualHeatProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadAnnualHeatProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
