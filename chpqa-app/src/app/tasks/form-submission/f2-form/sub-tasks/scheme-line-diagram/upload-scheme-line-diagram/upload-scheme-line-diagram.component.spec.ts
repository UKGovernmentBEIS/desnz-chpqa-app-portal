import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShemeLineDiagramComponent } from './upload-scheme-line-diagram.component';

describe('ShemeLineDiagramComponent', () => {
  let component: ShemeLineDiagramComponent;
  let fixture: ComponentFixture<ShemeLineDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShemeLineDiagramComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShemeLineDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
