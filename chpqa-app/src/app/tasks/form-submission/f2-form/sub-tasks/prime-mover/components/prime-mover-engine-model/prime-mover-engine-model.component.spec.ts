import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeMoverEngineModelComponent } from './prime-mover-engine-model.component';

describe('PrimeMoverEngineModelComponent', () => {
  let component: PrimeMoverEngineModelComponent;
  let fixture: ComponentFixture<PrimeMoverEngineModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeMoverEngineModelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimeMoverEngineModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
