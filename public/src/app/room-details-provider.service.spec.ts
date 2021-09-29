import { TestBed } from '@angular/core/testing';

import { RoomDetailsProviderService } from './room-details-provider.service';

describe('RoomDetailsProviderService', () => {
  let service: RoomDetailsProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomDetailsProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
