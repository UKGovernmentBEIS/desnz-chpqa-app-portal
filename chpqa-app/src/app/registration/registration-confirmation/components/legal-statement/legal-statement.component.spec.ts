import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalStatementComponent } from './legal-statement.component';

describe('LegalStatementComponent', () => {
  let component: LegalStatementComponent;
  let fixture: ComponentFixture<LegalStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalStatementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LegalStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
