import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmOrganisationAddressComponent } from './confirm-organisation-address.component';

describe('ConfirmOrganisationAddressComponent', () => {
  let component: ConfirmOrganisationAddressComponent;
  let fixture: ComponentFixture<ConfirmOrganisationAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmOrganisationAddressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmOrganisationAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
