import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseSchemeOperationalComponent } from './choose-scheme-operational.component';

describe('ChooseSchemeOperationalComponent', () => {
  let component: ChooseSchemeOperationalComponent;
  let fixture: ComponentFixture<ChooseSchemeOperationalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseSchemeOperationalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseSchemeOperationalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
