import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeMoverEngineManufacturerComponent } from './prime-mover-engine-manufacturer.component';

describe('PrimeMoverEngineManufacturerComponent', () => {
  let component: PrimeMoverEngineManufacturerComponent;
  let fixture: ComponentFixture<PrimeMoverEngineManufacturerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeMoverEngineManufacturerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimeMoverEngineManufacturerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
