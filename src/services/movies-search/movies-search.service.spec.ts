import { TestBed } from '@angular/core/testing';

import { MoviesSearchService } from './movies-search.service';

describe('MoviesSearchService', () => {
  let service: MoviesSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoviesSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
