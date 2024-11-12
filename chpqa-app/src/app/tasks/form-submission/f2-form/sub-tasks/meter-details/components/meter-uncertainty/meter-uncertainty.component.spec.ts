import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterUncertaintyComponent } from './meter-uncertainty.component';

describe('MeterUncertaintyComponent', () => {
  let component: MeterUncertaintyComponent;
  let fixture: ComponentFixture<MeterUncertaintyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeterUncertaintyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeterUncertaintyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
