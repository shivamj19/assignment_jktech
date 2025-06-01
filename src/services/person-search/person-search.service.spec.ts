import { TestBed } from '@angular/core/testing';
import axios from 'axios';
import { PersonSearchService } from './person-search.service';
import { environment, urlElement } from '../../constants/constants';

describe('PersonSearchService', () => {
  let service: PersonSearchService;

  const mockPersonResponse = {
    data: {
      id: 287,
      name: 'Brad Pitt',
      biography: 'William Bradley Pitt is an American actor and film producer.',
      profile_path: '/kU3B75TyRiCgE270EyZnHjfivoq.jpg'
    }
  };

  const mockMoviesResponse = {
    data: {
      cast: [
        {
          id: 550,
          original_title: 'Fight Club',
          release_date: '1999-10-15',
          poster_path: '/bptfVGEQuv6vDdHW6oJmHr6p4WK.jpg',
          vote_average: 8.4,
          character: 'Tyler Durden',
          genre_ids: [18, 53],
          order: 0
        },
        {
          id: 807,
          original_title: 'Se7en',
          release_date: '1995-09-22',
          poster_path: '/6yoghtyTpznpBik8EngEmJskVUO.jpg',
          vote_average: 8.3,
          character: 'Mills',
          genre_ids: [80, 18],
          order: 1
        }
      ]
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonSearchService);
    
    // Reset all mocks before each test
    spyOn(axios, 'get').and.stub();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchPersonDetails', () => {
    it('should fetch complete person details with movies successfully', async () => {
      // Arrange
      const uuid = '287';
      (axios.get as jasmine.Spy).and.returnValues(
        Promise.resolve(mockPersonResponse),
        Promise.resolve(mockMoviesResponse)
      );

      // Act
      const result = await service.fetchPersonDetails(uuid);

      // Assert
      expect(result).toBeTruthy();
      expect(result?.uuid).toBe(287);
      expect(result?.name).toBe('Brad Pitt');
      expect(result?.movies).toBeDefined();
      expect(result?.movies?.length).toBe(2);
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it('should return null when uuid is empty', async () => {
      // Act
      const result = await service.fetchPersonDetails('');

      // Assert
      expect(result).toBeNull();
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should return null when person details fetch fails', async () => {
      // Arrange
      const uuid = '287';
      (axios.get as jasmine.Spy).and.returnValue(Promise.reject(new Error('API Error')));

      // Act
      const result = await service.fetchPersonDetails(uuid);

      // Assert
      expect(result).toBeNull();
    });

    it('should return person details without movies when movies fetch fails', async () => {
      // Arrange
      const uuid = '287';
      (axios.get as jasmine.Spy).and.returnValues(
        Promise.resolve(mockPersonResponse),
        Promise.reject(new Error('Movies API Error'))
      );

      // Act
      const result = await service.fetchPersonDetails(uuid);

      // Assert
      expect(result).toBeTruthy();
      expect(result?.uuid).toBe(287);
      expect(result?.name).toBe('Brad Pitt');
      expect(result?.movies).toBeUndefined();
    });
  });

  describe('fetchDetailsById', () => {
    it('should fetch person details successfully', async () => {
      // Arrange
      const uuid = '287';
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(mockPersonResponse));

      // Act
      const result = await (service as any).fetchDetailsById(uuid);

      // Assert
      expect(result).toBeTruthy();
      expect(result.uuid).toBe(287);
      expect(result.name).toBe('Brad Pitt');
      expect(result.description).toBe('William Bradley Pitt is an American actor and film producer.');
      expect(result.profileImage).toBe(`${environment.imageBaseUrl}/kU3B75TyRiCgE270EyZnHjfivoq.jpg`);
      expect(axios.get).toHaveBeenCalledWith(
        `${urlElement.personBase}/${uuid}?api_key=${environment.tmdbApiKey}`,
        jasmine.any(Object)
      );
    });

    it('should return null when API returns empty data', async () => {
      // Arrange
      const uuid = '287';
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve({ data: {} }));

      // Act
      const result = await (service as any).fetchDetailsById(uuid);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const uuid = '287';
      const error = new Error('Network Error');
      (axios.get as jasmine.Spy).and.returnValue(Promise.reject(error));

      // Act & Assert
      await expectAsync((service as any).fetchDetailsById(uuid)).toBeRejected();
    });

    it('should handle missing profile_path gracefully', async () => {
      // Arrange
      const uuid = '287';
      const responseWithoutImage = {
        data: {
          ...mockPersonResponse.data,
          profile_path: null
        }
      };
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(responseWithoutImage));

      // Act
      const result = await (service as any).fetchDetailsById(uuid);

      // Assert
      expect(result.profileImage).toBe('');
    });
  });

  describe('fetchMoviePlayedByPersonById', () => {
    const mockPersonDetails = {
      uuid: 287,
      name: 'Brad Pitt',
      description: 'Actor',
      profileImage: 'image.jpg'
    };

    it('should fetch and merge movies with person details', async () => {
      // Arrange
      const uuid = '287';
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(mockMoviesResponse));

      // Act
      const result = await (service as any).fetchMoviePlayedByPersonById(uuid, mockPersonDetails);

      // Assert
      expect(result.movies).toBeDefined();
      expect(result.movies.length).toBe(2);
      expect(result.movies[0].title).toBe('Fight Club');
      expect(result.movies[0].year).toBe(1999);
      expect(result.movies[0].rating).toBe('8.4');
      expect(result.movies[0].characterPlayed).toBe('Tyler Durden');
      expect(axios.get).toHaveBeenCalledWith(
        `${urlElement.personBase}/${uuid}/${urlElement.personMovies}?api_key=${environment.tmdbApiKey}`,
        jasmine.any(Object)
      );
    });

    it('should sort movies by order', async () => {
      // Arrange
      const uuid = '287';
      const unorderedMoviesResponse = {
        data: {
          cast: [
            { ...mockMoviesResponse.data.cast[1], order: 5 },
            { ...mockMoviesResponse.data.cast[0], order: 1 }
          ]
        }
      };
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(unorderedMoviesResponse));

      // Act
      const result = await (service as any).fetchMoviePlayedByPersonById(uuid, mockPersonDetails);

      // Assert
      expect(result.movies[0].order).toBe(1);
      expect(result.movies[1].order).toBe(5);
    });

    it('should return person details without movies when cast is empty', async () => {
      // Arrange
      const uuid = '287';
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve({ data: { cast: [] } }));

      // Act
      const result = await (service as any).fetchMoviePlayedByPersonById(uuid, mockPersonDetails);

      // Assert
      expect(result).toEqual(mockPersonDetails);
      expect(result.movies).toBeUndefined();
    });

    it('should return person details when movies API fails', async () => {
      // Arrange
      const uuid = '287';
      (axios.get as jasmine.Spy).and.returnValue(Promise.reject(new Error('API Error')));

      // Act
      const result = await (service as any).fetchMoviePlayedByPersonById(uuid, mockPersonDetails);

      // Assert
      expect(result).toEqual(mockPersonDetails);
    });
  });

  describe('processMovieData', () => {
    it('should process movie data correctly', () => {
      // Act
      const result = (service as any).processMovieData(mockMoviesResponse.data.cast);

      // Assert
      expect(result.length).toBe(2);
      expect(result[0].uuid).toBe(550);
      expect(result[0].title).toBe('Fight Club');
      expect(result[0].year).toBe(1999);
      expect(result[0].rating).toBe('8.4');
      expect(result[0].posterImage).toBe(`${environment.imageBaseUrl}/bptfVGEQuv6vDdHW6oJmHr6p4WK.jpg`);
    });

    it('should handle missing release date', () => {
      // Arrange
      const movieWithoutDate = [{
        ...mockMoviesResponse.data.cast[0],
        release_date: ''
      }];

      // Act
      const result = (service as any).processMovieData(movieWithoutDate);

      // Assert
      expect(result[0].year).toBe(0);
    });

    it('should handle missing poster path', () => {
      // Arrange
      const movieWithoutPoster = [{
        ...mockMoviesResponse.data.cast[0],
        poster_path: null
      }];

      // Act
      const result = (service as any).processMovieData(movieWithoutPoster);

      // Assert
      expect(result[0].posterImage).toBe('');
    });
  });

  describe('extractYear', () => {
    it('should extract year from valid date', () => {
      // Act
      const result = (service as any).extractYear('1999-10-15');

      // Assert
      expect(result).toBe(1999);
    });

    it('should return 0 for empty date', () => {
      // Act
      const result = (service as any).extractYear('');

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 for null date', () => {
      // Act
      const result = (service as any).extractYear(null);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('buildImageUrl', () => {
    it('should build complete image URL', () => {
      // Act
      const result = (service as any).buildImageUrl('/test-image.jpg');

      // Assert
      expect(result).toBe(`${environment.imageBaseUrl}/test-image.jpg`);
    });

    it('should return empty string for null image path', () => {
      // Act
      const result = (service as any).buildImageUrl(null);

      // Assert
      expect(result).toBe('');
    });

    it('should return empty string for empty image path', () => {
      // Act
      const result = (service as any).buildImageUrl('');

      // Assert
      expect(result).toBe('');
    });
  });

  describe('Error Handling', () => {
    it('should log errors appropriately', async () => {
      // Arrange
      spyOn(console, 'error');
      (axios.get as jasmine.Spy).and.returnValue(Promise.reject(new Error('Network Error')));

      // Act
      await service.fetchPersonDetails('287');

      // Assert
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('API URL Construction', () => {
    it('should construct correct person details URL', async () => {
      // Arrange
      const uuid = '123';
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(mockPersonResponse));

      // Act
      await (service as any).fetchDetailsById(uuid);

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        `${urlElement.personBase}/${uuid}?api_key=${environment.tmdbApiKey}`,
        jasmine.any(Object)
      );
    });

    it('should construct correct movies URL', async () => {
      // Arrange
      const uuid = '123';
      const mockPersonDetails = { uuid: 123, name: 'Test', description: '', profileImage: '' };
      (axios.get as jasmine.Spy).and.returnValue(Promise.resolve(mockMoviesResponse));

      // Act
      await (service as any).fetchMoviePlayedByPersonById(uuid, mockPersonDetails);

      // Assert
      expect(axios.get).toHaveBeenCalledWith(
        `${urlElement.personBase}/${uuid}/${urlElement.personMovies}?api_key=${environment.tmdbApiKey}`,
        jasmine.any(Object)
      );
    });
  });
});