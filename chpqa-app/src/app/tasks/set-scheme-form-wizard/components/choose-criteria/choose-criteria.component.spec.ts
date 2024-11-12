import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseSchemeCriteriaComponent } from './choose-scheme-criteria.component';

describe('ChooseSchemeCriteriaComponent', () => {
  let component: ChooseSchemeCriteriaComponent;
  let fixture: ComponentFixture<ChooseSchemeCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseSchemeCriteriaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseSchemeCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
