import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSiteContactComponent } from './add-site-contact.component';

describe('AddSiteContactComponent', () => {
  let component: AddSiteContactComponent;
  let fixture: ComponentFixture<AddSiteContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSiteContactComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSiteContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
