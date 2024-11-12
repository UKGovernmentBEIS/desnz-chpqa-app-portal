import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimeMoverDocumentationComponent } from './prime-mover-documentation.component';

describe('PrimeMoverDocumentationComponent', () => {
  let component: PrimeMoverDocumentationComponent;
  let fixture: ComponentFixture<PrimeMoverDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimeMoverDocumentationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimeMoverDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
