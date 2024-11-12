import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovukNotificationBannerComponent } from './govuk-notification-banner.component';

describe('GovukNotificationBannerComponent', () => {
  let component: GovukNotificationBannerComponent;
  let fixture: ComponentFixture<GovukNotificationBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovukNotificationBannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovukNotificationBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
