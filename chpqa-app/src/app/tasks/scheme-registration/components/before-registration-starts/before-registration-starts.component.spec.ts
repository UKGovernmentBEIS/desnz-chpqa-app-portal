import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeforeRegistrationStartsComponent } from './before-registration-starts.component';

describe('BeforeRegistrationStartsComponent', () => {
  let component: BeforeRegistrationStartsComponent;
  let fixture: ComponentFixture<BeforeRegistrationStartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeforeRegistrationStartsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BeforeRegistrationStartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
