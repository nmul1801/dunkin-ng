import { TestBed } from '@angular/core/testing';

import { DunkinService } from './dunkin.service';

describe('DunkinService', () => {
  let service: DunkinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DunkinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
