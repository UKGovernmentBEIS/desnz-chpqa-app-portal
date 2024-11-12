import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfimDeleteMetersComponent } from './confim-delete-meters.component';

describe('ConfimDeleteMetersComponent', () => {
  let component: ConfimDeleteMetersComponent;
  let fixture: ComponentFixture<ConfimDeleteMetersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfimDeleteMetersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfimDeleteMetersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
