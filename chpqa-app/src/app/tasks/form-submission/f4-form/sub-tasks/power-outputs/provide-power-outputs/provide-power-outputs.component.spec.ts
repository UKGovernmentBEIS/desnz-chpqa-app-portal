import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidePowerOutputsComponent } from './provide-power-outputs.component';

describe('ProvidePowerOutputsComponent', () => {
  let component: ProvidePowerOutputsComponent;
  let fixture: ComponentFixture<ProvidePowerOutputsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvidePowerOutputsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProvidePowerOutputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
