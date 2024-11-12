import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterHeatOutputComponent } from './enter-heat-output.component';

describe('EnterHeatOutputComponent', () => {
  let component: EnterHeatOutputComponent;
  let fixture: ComponentFixture<EnterHeatOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterHeatOutputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EnterHeatOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
