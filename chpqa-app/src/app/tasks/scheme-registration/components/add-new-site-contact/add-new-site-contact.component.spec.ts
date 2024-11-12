import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewSiteContactComponent } from './add-new-site-contact.component';

describe('AddNewSiteContactComponent', () => {
  let component: AddNewSiteContactComponent;
  let fixture: ComponentFixture<AddNewSiteContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewSiteContactComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewSiteContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
