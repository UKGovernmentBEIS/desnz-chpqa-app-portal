import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmSiteAddressComponent } from './confirm-site-address.component';

describe('ConfirmSiteAddressComponent', () => {
  let component: ConfirmSiteAddressComponent;
  let fixture: ComponentFixture<ConfirmSiteAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmSiteAddressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmSiteAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
