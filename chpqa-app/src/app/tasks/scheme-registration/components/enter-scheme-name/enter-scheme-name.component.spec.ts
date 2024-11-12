import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterSchemeNameComponent } from './enter-scheme-name.component';

describe('EnterSchemeNameComponent', () => {
  let component: EnterSchemeNameComponent;
  let fixture: ComponentFixture<EnterSchemeNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterSchemeNameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EnterSchemeNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
