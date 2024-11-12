import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovukFileInputListComponent } from './govuk-file-input-list.component';

describe('GovukFileInputListComponent', () => {
  let component: GovukFileInputListComponent;
  let fixture: ComponentFixture<GovukFileInputListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovukFileInputListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovukFileInputListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
