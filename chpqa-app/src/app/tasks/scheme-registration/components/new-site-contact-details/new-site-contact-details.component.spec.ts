import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSiteContactDetailsComponent } from './new-site-contact-details.component';

describe('NewSiteContactDetailsComponent', () => {
  let component: NewSiteContactDetailsComponent;
  let fixture: ComponentFixture<NewSiteContactDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewSiteContactDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewSiteContactDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
