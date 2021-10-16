import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTopMenuComponent } from './user-top-menu.component';

describe('UserTopMenuComponent', () => {
  let component: UserTopMenuComponent;
  let fixture: ComponentFixture<UserTopMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserTopMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTopMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
