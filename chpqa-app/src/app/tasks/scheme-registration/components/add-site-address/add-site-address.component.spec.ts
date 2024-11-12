import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddSiteAddressComponent } from './add-site-address.component';

describe('AddSiteAddressComponent', () => {
  let component: AddSiteAddressComponent;
  let fixture: ComponentFixture<AddSiteAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSiteAddressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSiteAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
