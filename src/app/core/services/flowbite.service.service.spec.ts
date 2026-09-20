import { TestBed } from '@angular/core/testing';

import { FlowbiteServiceService } from './flowbite.service.service';

describe('FlowbiteServiceService', () => {
  let service: FlowbiteServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlowbiteServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
