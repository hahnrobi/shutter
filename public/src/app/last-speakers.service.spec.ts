import { TestBed } from '@angular/core/testing';

import { LastSpeakersService } from './last-speakers.service';

describe('LastSpeakersService', () => {
  let service: LastSpeakersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastSpeakersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
