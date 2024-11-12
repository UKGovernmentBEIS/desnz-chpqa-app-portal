import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDailyHeatProfileComponent } from './upload-daily-heat-profile.component';

describe('UploadDailyHeatProfileComponent', () => {
  let component: UploadDailyHeatProfileComponent;
  let fixture: ComponentFixture<UploadDailyHeatProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadDailyHeatProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadDailyHeatProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
