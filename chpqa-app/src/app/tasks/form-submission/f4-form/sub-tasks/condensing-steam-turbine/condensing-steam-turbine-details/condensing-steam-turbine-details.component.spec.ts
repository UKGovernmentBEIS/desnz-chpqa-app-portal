import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondensingSteamTurbineDetailsComponent } from './condensing-steam-turbine-details.component';

describe('CondensingSteamTurbineDetailsComponent', () => {
  let component: CondensingSteamTurbineDetailsComponent;
  let fixture: ComponentFixture<CondensingSteamTurbineDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CondensingSteamTurbineDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CondensingSteamTurbineDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
