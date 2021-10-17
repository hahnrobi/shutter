import { TestBed } from '@angular/core/testing';

import { RoomAddEditService } from './room-add-edit.service';

describe('RoomAddEditService', () => {
  let service: RoomAddEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomAddEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
