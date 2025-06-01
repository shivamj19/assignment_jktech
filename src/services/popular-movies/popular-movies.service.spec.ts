import { TestBed } from '@angular/core/testing';
import axios from 'axios';
import { PopularMoviesService } from './popular-movies.service';
import { environment, urlElement } from '../../constants/constants';

describe('PopularMoviesService', () => {
  let service: PopularMoviesService;

  const mockPopularMoviesResponse = {
    data: {
      page: 1,
      results: [
        {
          id: 550,
          original_title: 'Fight Club',
          release_date: '1999-10-15',
          poster_path: '/bptfVGEQuv6vDdHW6oJmHr6p4WK.jpg',
          vote_average: 8.4,
          genre_ids: [18, 53]
        },
        {
          id: 807,
          original_title: 'Se7en',
          release_date: '1995-09-22',
          poster_path: '/6yoghtyTpznpBik8EngEmJskVUO.jpg',
          vote_average: 8.3,
          genre_ids: [80, 18]
        },
        {
          id: 155,
          original_title: 'The Dark Knight',
          release_date: '2008-07-18',
          poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
          vote_average: 9.0,
          genre_ids: [28, 80, 18]
        },
        {
          id: 13,
          original_title: 'Forrest Gump',
          release_date: '1994-06-23',
          poster_path: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
          vote_average: 8.8,
          genre_ids: [35, 18, 10749]
        },
        {
          id: 11216,
          original_title: 'Cinema Paradiso',
          release_date: '1988-11-17',
          poster_path: '/8SRUfRUi6x4O68n0VCbDNRa6iGL.jpg',
          vote_average: 8.4,
          genre_ids: [18, 10749]
        },
        {
          id: 424,
          original_title: "Schindler's List",
          release_date: '1993-11-30',
          poster_path: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
          vote_average: 8.9,
          genre_ids: [18, 36, 10752]
        },
        {
          id: 278,
          original_title: 'The Shawshank Redemption',
          release_date: '1994-09-23',
          poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
          vote_average: 9.3,
          genre_ids: [18, 80]
        }
      ],
      total_pages: 500,
      total_results: 10000
    }
  };

  const mockEmptyResponse = {
    data: {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopularMoviesService);
    
    // Reset all mocks before each test
    spyOn(axios, 'get').and.stub();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchPopularMovies', () => {
    it('should fetch popular movies successfully and limit to 6 items', async () => {
      // Arrange
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(mockPopularMoviesResponse));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(6); // Should limit to 6 items (length <= 5 condition allows 6 items)
      expect(axios.get).toHaveBeenCalledWith(
        `${urlElement.popularMovies}?api_key=${environment.tmdbApiKey}&page=1`,
        service.axiosConfig
      );
    });

    it('should transform movie data correctly', async () => {
      // Arrange
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(mockPopularMoviesResponse));

      // Act
      const result = await service.fetchPopularMovies();
      const firstMovie = result[0];

      // Assert
      expect(firstMovie.uuid).toBe(550);
      expect(firstMovie.title).toBe('Fight Club');
      expect(firstMovie.year).toBe(1999);
      expect(firstMovie.posterImage).toBe(`${environment.imageBaseUrl}/bptfVGEQuv6vDdHW6oJmHr6p4WK.jpg`);
      expect(firstMovie.rating).toBe('8.4');
      expect(firstMovie.genre).toEqual([18, 53]);
    });

    it('should handle API call with custom body parameter', async () => {
      // Arrange
      const customBody = { customParam: 'value' };
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(mockPopularMoviesResponse));

      // Act
      const result = await service.fetchPopularMovies(customBody);

      // Assert
      expect(result).toBeTruthy();
      expect(axios.get).toHaveBeenCalledWith(
        `${urlElement.popularMovies}?api_key=${environment.tmdbApiKey}&page=1`,
        service.axiosConfig
      );
    });

    it('should handle empty body parameter', async () => {
      // Arrange
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(mockPopularMoviesResponse));

      // Act
      const result = await service.fetchPopularMovies({});

      // Assert
      expect(result).toBeTruthy();
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should return original data when results array is empty', async () => {
      // Arrange
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(mockEmptyResponse));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(result).toEqual(mockEmptyResponse.data);
    });

    it('should return original data when response data is empty object', async () => {
      // Arrange
      const emptyDataResponse = { data: {} };
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(emptyDataResponse));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(result).toEqual({});
    });

    it('should return original data when response has no results property', async () => {
      // Arrange
      const noResultsResponse = {
        data: {
          page: 1,
          total_pages: 0,
          total_results: 0
        }
      };
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(noResultsResponse));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(result).toEqual(noResultsResponse.data);
    });

    it('should handle API error and return error object', async () => {
      // Arrange
      const error = new Error('Network Error');
      (axios.get as jasmine.Spy).and.returnValue(Promise.reject(error));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(result).toBe(error);
    });

    it('should reset popularSet array before processing new data', async () => {
      // Arrange
      service.popularSet = [{ uuid: 999, title: 'Old Movie' }]; // Pre-populate with old data
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(mockPopularMoviesResponse));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(result).not.toContain(jasmine.objectContaining({ uuid: 999 }));
      expect(result[0].uuid).toBe(550); // Should start with new data
    });

    it('should handle movies with missing or null poster_path', async () => {
      // Arrange
      const responseWithNullPoster = {
        data: {
          ...mockPopularMoviesResponse.data,
          results: [
            {
              ...mockPopularMoviesResponse.data.results[0],
              poster_path: null
            }
          ]
        }
      };
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(responseWithNullPoster));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(result[0].posterImage).toBe(`${environment.imageBaseUrl}null`);
    });

    it('should handle movies with missing release_date', async () => {
      // Arrange
      const responseWithNullDate = {
        data: {
          ...mockPopularMoviesResponse.data,
          results: [
            {
              ...mockPopularMoviesResponse.data.results[0],
              release_date: null
            }
          ]
        }
      };
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(responseWithNullDate));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(result[0].year).toBeDefined(); // moment should handle null gracefully
    });

    it('should handle movies with invalid vote_average', async () => {
      // Arrange
      const responseWithInvalidRating = {
        data: {
          ...mockPopularMoviesResponse.data,
          results: [
            {
              ...mockPopularMoviesResponse.data.results[0],
              vote_average: null
            }
          ]
        }
      };
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(responseWithInvalidRating));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(() => result[0].rating).not.toThrow();
    });

    it('should limit results to maximum 6 movies even with more data', async () => {
      // Arrange
      const manyMoviesResponse = {
        data: {
          ...mockPopularMoviesResponse.data,
          results: Array(20).fill(null).map((_, index) => ({
            id: index,
            original_title: `Movie ${index}`,
            release_date: '2000-01-01',
            poster_path: '/test.jpg',
            vote_average: 7.0 + index * 0.1,
            genre_ids: [18]
          }))
        }
      };
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(manyMoviesResponse));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(result.length).toBe(6); // Should be limited to 6 items
    });

    it('should construct correct API URL', async () => {
      // Arrange
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(mockPopularMoviesResponse));

      // Act
      await service.fetchPopularMovies();

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        `${urlElement.popularMovies}?api_key=${environment.tmdbApiKey}&page=1`,
        service.axiosConfig
      );
    });

    it('should use correct axios configuration', async () => {
      // Arrange
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(mockPopularMoviesResponse));

      // Act
      await service.fetchPopularMovies();

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        jasmine.any(String),
        service.axiosConfig
      );
    });
  });

  describe('Service Properties', () => {
    it('should initialize with empty popularSet array', () => {
      expect(service.popularSet).toEqual([]);
    });

    it('should have axiosConfig property', () => {
      expect(service.axiosConfig).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle response with null data', async () => {
      // Arrange
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve({ data: null }));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(result).toBeNull();
    });

    it('should handle response with undefined data', async () => {
      // Arrange
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve({}));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(result).toBeUndefined();
    });

    it('should handle completely malformed response', async () => {
      // Arrange
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(null));

      // Act
      const result = await service.fetchPopularMovies();

      // Assert
      expect(result).toBeUndefined();
    });
  });
});