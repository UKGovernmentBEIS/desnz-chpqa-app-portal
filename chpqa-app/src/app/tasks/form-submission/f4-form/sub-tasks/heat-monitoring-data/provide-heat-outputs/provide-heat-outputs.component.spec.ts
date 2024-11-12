import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvideHeatOutputsComponent } from './provide-heat-outputs.component';

describe('ProvideHeatOutputsComponent', () => {
  let component: ProvideHeatOutputsComponent;
  let fixture: ComponentFixture<ProvideHeatOutputsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvideHeatOutputsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProvideHeatOutputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
