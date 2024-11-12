import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmSiteContactComponent } from './confirm-site-contact.component';

describe('ConfirmSiteContactComponent', () => {
  let component: ConfirmSiteContactComponent;
  let fixture: ComponentFixture<ConfirmSiteContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmSiteContactComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmSiteContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
