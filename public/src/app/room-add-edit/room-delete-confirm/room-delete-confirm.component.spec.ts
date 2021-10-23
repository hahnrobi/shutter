import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDeleteConfirmComponent } from './room-delete-confirm.component';

describe('RoomDeleteConfirmComponent', () => {
  let component: RoomDeleteConfirmComponent;
  let fixture: ComponentFixture<RoomDeleteConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomDeleteConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomDeleteConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
