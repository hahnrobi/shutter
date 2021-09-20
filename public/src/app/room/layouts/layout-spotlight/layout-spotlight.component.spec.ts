import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutSpotlightComponent } from './layout-spotlight.component';

describe('LayoutSpotlightComponent', () => {
  let component: LayoutSpotlightComponent;
  let fixture: ComponentFixture<LayoutSpotlightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutSpotlightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutSpotlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
