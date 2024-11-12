import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterDocumentationComponent } from './meter-documentation.component';

describe('MeterDocumentationComponent', () => {
  let component: MeterDocumentationComponent;
  let fixture: ComponentFixture<MeterDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeterDocumentationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeterDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
