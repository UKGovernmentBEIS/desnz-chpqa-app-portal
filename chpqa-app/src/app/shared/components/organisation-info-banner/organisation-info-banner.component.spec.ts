import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganisationInfoBannerComponent } from './organisation-info-banner.component';

describe('OrganisationInfoBannerComponent', () => {
  let component: OrganisationInfoBannerComponent;
  let fixture: ComponentFixture<OrganisationInfoBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationInfoBannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrganisationInfoBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
