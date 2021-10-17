import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomAddEditComponent } from './room-add-edit.component';

describe('RoomAddEditComponent', () => {
  let component: RoomAddEditComponent;
  let fixture: ComponentFixture<RoomAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomAddEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
