import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterPowerOutputComponent } from './enter-power-output.component';

describe('EnterPowerOutputComponent', () => {
  let component: EnterPowerOutputComponent;
  let fixture: ComponentFixture<EnterPowerOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterPowerOutputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EnterPowerOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
