import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterFiscalCheckComponent } from './meter-fiscal-check.component';

describe('MeterFiscalCheckComponent', () => {
  let component: MeterFiscalCheckComponent;
  let fixture: ComponentFixture<MeterFiscalCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeterFiscalCheckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeterFiscalCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
