import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeMoverMechanicalLoadComponent } from './prime-mover-mechanical-load.component';

describe('PrimeMoverMechanicalLoadComponent', () => {
  let component: PrimeMoverMechanicalLoadComponent;
  let fixture: ComponentFixture<PrimeMoverMechanicalLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeMoverMechanicalLoadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimeMoverMechanicalLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
