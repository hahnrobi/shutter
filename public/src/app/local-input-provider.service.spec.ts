import { TestBed } from '@angular/core/testing';

import { LocalInputProviderService } from './local-input-provider.service';

describe('LocalInputProviderService', () => {
  let service: LocalInputProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalInputProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
