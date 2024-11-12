import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmExistingSiteContactComponent } from './confirm-existing-site-contact.component';

describe('ConfirmExistingSiteContactComponent', () => {
  let component: ConfirmExistingSiteContactComponent;
  let fixture: ComponentFixture<ConfirmExistingSiteContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmExistingSiteContactComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmExistingSiteContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
