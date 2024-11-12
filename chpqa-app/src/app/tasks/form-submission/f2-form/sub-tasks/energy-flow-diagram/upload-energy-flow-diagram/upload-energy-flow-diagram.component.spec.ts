import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadEnergyFlowDiagramComponent } from './upload-energy-flow-diagram.component';

describe('UploadEnergyFlowDiagramComponent', () => {
  let component: UploadEnergyFlowDiagramComponent;
  let fixture: ComponentFixture<UploadEnergyFlowDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadEnergyFlowDiagramComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadEnergyFlowDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
