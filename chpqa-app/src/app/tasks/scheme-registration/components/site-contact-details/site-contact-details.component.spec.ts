import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteContactDetailsComponent } from './site-contact-details.component';

describe('SiteContactDetailsComponent', () => {
  let component: SiteContactDetailsComponent;
  let fixture: ComponentFixture<SiteContactDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteContactDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SiteContactDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
