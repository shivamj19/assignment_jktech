import { TestBed } from '@angular/core/testing';

import { PersonSearchService } from './person-search.service';

describe('PersonSearchService', () => {
  let service: PersonSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
