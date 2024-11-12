import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeMoverEngineComponent } from './prime-mover-engine.component';

describe('PrimeMoverEngineComponent', () => {
  let component: PrimeMoverEngineComponent;
  let fixture: ComponentFixture<PrimeMoverEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeMoverEngineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimeMoverEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
