import { TestBed } from '@angular/core/testing';

import { MoviesGenreService } from './movies-genre.service';

describe('MoviesGenreService', () => {
  let service: MoviesGenreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoviesGenreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
