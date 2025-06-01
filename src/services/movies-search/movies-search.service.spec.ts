import { TestBed } from '@angular/core/testing';
import { MoviesSearchService } from './movies-search.service';
import axios from 'axios';
import { environment, urlElement } from '../../constants/constants';
import moment from 'moment';

spyOn(axios, 'get');

describe('MoviesSearchService', () => {
  let service: MoviesSearchService;
  let axiosGetSpy: jasmine.Spy;

  const mockMovieDetails = {
    id: 12345,
    original_title: 'Test Movie',
    overview: 'Test movie description',
    release_date: '2023-01-15',
    poster_path: '/test-poster.jpg',
    vote_average: 8.5,
    genre_ids: [1, 2, 3],
    runtime: 120
  };

  const mockTrailerResponse = {
    results: [
      {
        id: 'trailer1',
        type: 'Trailer',
        site: 'YouTube',
        official: true,
        key: 'testVideoKey'
      }
    ]
  };

  const mockCastResponse = {
    cast: [
      {
        id: 1,
        cast_id: 101,
        credit_id: 'credit1',
        original_name: 'Actor One',
        character: 'Hero',
        profile_path: '/actor1.jpg',
        known_for_department: 'Acting',
        order: 0
      },
      {
        id: 2,
        cast_id: 102,
        credit_id: 'credit2',
        original_name: 'Actor Two',
        character: 'Villain',
        profile_path: '/actor2.jpg',
        known_for_department: 'Acting',
        order: 1
      }
    ]
  };

  const mockRecommendationsResponse = {
    results: [
      {
        id: 67890,
        original_title: 'Recommended Movie',
        release_date: '2023-05-20',
        poster_path: '/recommended.jpg',
        vote_average: 7.8,
        genre_ids: [4, 5]
      }
    ]
  };

  const mockSearchResponse = {
    results: [
      {
        id: 11111,
        media_type: 'movie',
        original_title: 'Search Movie',
        release_date: '2022-12-01',
        poster_path: '/search-movie.jpg',
        vote_average: 6.5,
        genre_ids: [6, 7]
      },
      {
        id: 22222,
        media_type: 'person',
        original_name: 'Famous Actor',
        profile_path: '/famous-actor.jpg',
        known_for_department: 'Acting'
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MoviesSearchService]
    });
    service = TestBed.inject(MoviesSearchService);
    
    axiosGetSpy = spyOn(axios, 'get');
  });

  afterEach(() => {
    axiosGetSpy.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchMovieDetails', () => {
    it('should fetch complete movie details successfully', async () => {
      const uuid = '552524';

      axiosGetSpy.and.returnValues(
        Promise.resolve({ data: mockMovieDetails }),
        Promise.resolve({ data: mockTrailerResponse }),
        Promise.resolve({ data: mockCastResponse }),
        Promise.resolve({ data: mockRecommendationsResponse })
      );

      const result = await service.fetchMovieDetails(uuid);

      expect(result).toBeDefined();
      expect(result.uuid).toBe(mockMovieDetails.id);
      expect(result.title).toBe(mockMovieDetails.original_title);
      expect(axiosGetSpy).toHaveBeenCalledTimes(4);
    });

    it('should handle empty uuid parameter', async () => {
      axiosGetSpy.and.returnValues(
        Promise.resolve({ data: mockMovieDetails }),
        Promise.resolve({ data: mockTrailerResponse }),
        Promise.resolve({ data: mockCastResponse }),
        Promise.resolve({ data: mockRecommendationsResponse })
      );

      const result = await service.fetchMovieDetails();
      
      expect(axiosGetSpy).toHaveBeenCalledTimes(4);
      expect(result).toBeDefined();
    });
  });

  describe('fetchDetailsById', () => {
    it('should fetch movie details by ID successfully', async () => {
      const uuid = '12345';
      axiosGetSpy.and.returnValue(Promise.resolve({ data: mockMovieDetails }));

      const result = await service.fetchDetailsById(uuid);

      expect(axiosGetSpy).toHaveBeenCalledWith(
        `${urlElement.movieBase}/${uuid}?api_key=${environment.tmdbApiKey}`,
        service.axiosConfig
      );
      expect(result.uuid).toBe(mockMovieDetails.id);
      expect(result.title).toBe(mockMovieDetails.original_title);
      expect(result.description).toBe(mockMovieDetails.overview);
      expect(result.year).toBe(moment(mockMovieDetails.release_date, "YYYY-MM-DD").year());
      expect(result.posterImage).toBe(environment.imageBaseUrl + mockMovieDetails.poster_path);
      expect(result.rating).toBe(mockMovieDetails.vote_average.toFixed(1));
      expect(result.duration).toBe(String(mockMovieDetails.runtime) + ' min');
    });

    it('should handle empty response data', async () => {
      const uuid = '12345';
      axiosGetSpy.and.returnValue(Promise.resolve({ data: {} }));

      const result = await service.fetchDetailsById(uuid);

      expect(result).toEqual({});
    });

    it('should handle API error', async () => {
      const uuid = '12345';
      const error = new Error('API Error');
      axiosGetSpy.and.returnValue(Promise.reject(error));

      const result = await service.fetchDetailsById(uuid);

      expect(result).toBe(error);
    });

    it('should format movie rating correctly', async () => {
      const uuid = '12345';
      const movieWithRating = {
        ...mockMovieDetails,
        vote_average: 8.567
      };
      axiosGetSpy.and.returnValue(Promise.resolve({ data: movieWithRating }));

      const result = await service.fetchDetailsById(uuid);

      expect(result.rating).toBe('8.6');
    });

    it('should format duration correctly', async () => {
      const uuid = '12345';
      const movieWithDuration = {
        ...mockMovieDetails,
        runtime: 150
      };
      axiosGetSpy.and.returnValue(Promise.resolve({ data: movieWithDuration }));

      const result = await service.fetchDetailsById(uuid);

      expect(result.duration).toBe('150 min');
    });

    it('should extract year from release date correctly', async () => {
      const uuid = '12345';
      const movieWithDate = {
        ...mockMovieDetails,
        release_date: '2024-12-25'
      };
      axiosGetSpy.and.returnValue(Promise.resolve({ data: movieWithDate }));

      const result = await service.fetchDetailsById(uuid);

      expect(result.year).toBe(2024);
    });
  });

  describe('fetchTrailerById', () => {
    beforeEach(() => {
      service.movieDetails = { uuid: 12345, title: 'Test Movie' };
    });

    it('should fetch trailer details successfully', async () => {
      const uuid = '12345';
      axiosGetSpy.and.returnValue(Promise.resolve({ data: mockTrailerResponse }));

      const result = await service.fetchTrailerById(uuid);

      expect(axiosGetSpy).toHaveBeenCalledWith(
        `${urlElement.movieBase}/${uuid}/${urlElement.movieTrailer}?api_key=${environment.tmdbApiKey}`,
        service.axiosConfig
      );
      expect(result.trailerId).toBe(mockTrailerResponse.results[0].id);
      expect(result.trailerLink).toBe(environment.youtubeBaseUrl + mockTrailerResponse.results[0].key);
      expect(result.official).toBe(true);
    });

    it('should handle no trailer found', async () => {
      const uuid = '12345';
      axiosGetSpy.and.returnValue(Promise.resolve({ data: { results: [] } }));

      const result = await service.fetchTrailerById(uuid);

      expect(result.trailerId).toBeNull();
      expect(result.trailerLink).toBe("");
      expect(result.official).toBeNull();
    });

    it('should handle no official YouTube trailer', async () => {
      const uuid = '12345';
      const nonOfficialTrailer = {
        results: [
          {
            id: 'trailer1',
            type: 'Trailer',
            site: 'Vimeo',
            official: false,
            key: 'testKey'
          }
        ]
      };
      axiosGetSpy.and.returnValue(Promise.resolve({ data: nonOfficialTrailer }));

      const result = await service.fetchTrailerById(uuid);

      expect(result.trailerId).toBeNull();
      expect(result.trailerLink).toBe("");
      expect(result.official).toBeNull();
    });
  });

  describe('fetchCastById', () => {
    beforeEach(() => {
      service.movieDetails = { uuid: 12345, title: 'Test Movie' };
    });

    it('should fetch cast details successfully', async () => {
      const uuid = '12345';
      axiosGetSpy.and.returnValue(Promise.resolve({ data: mockCastResponse }));

      const result = await service.fetchCastById(uuid);

      expect(axiosGetSpy).toHaveBeenCalledWith(
        `${urlElement.movieBase}/${uuid}/${urlElement.movieCast}?api_key=${environment.tmdbApiKey}`,
        service.axiosConfig
      );
      expect(result.cast).toBeDefined();
      expect(result.cast.length).toBe(2);
      expect(result.cast[0].name).toBe('Actor One');
      expect(result.cast[0].characterName).toBe('Hero');
    });

    it('should limit cast to members with order <= 5', async () => {
      const uuid = '12345';
      
      const largeCastResponse = {
        cast: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          cast_id: 100 + i,
          credit_id: `credit${i}`,
          original_name: `Actor ${i + 1}`,
          character: `Character ${i + 1}`,
          profile_path: `/actor${i + 1}.jpg`,
          known_for_department: 'Acting',
          order: i
        }))
      };
      
      axiosGetSpy.and.returnValue(Promise.resolve({ data: largeCastResponse }));

      const result = await service.fetchCastById(uuid);

      expect(result.cast.length).toBe(6);
    });

    it('should handle empty cast response', async () => {
      const uuid = '12345';
      axiosGetSpy.and.returnValue(Promise.resolve({ data: { cast: [] } }));

      const result = await service.fetchCastById(uuid);

      expect(result).toEqual(service.movieDetails);
    });

    it('should handle API error', async () => {
      const uuid = '12345';
      const error = new Error('Cast API Error');
      axiosGetSpy.and.returnValue(Promise.reject(error));

      const result = await service.fetchCastById(uuid);

      expect(result).toBe(error);
    });
  });

  describe('fetchRecommendtionById', () => {
    beforeEach(() => {
      service.movieDetails = { uuid: 12345, title: 'Test Movie' };
    });

    it('should fetch recommendations successfully', async () => {
      const uuid = '12345';
      axiosGetSpy.and.returnValue(Promise.resolve({ data: mockRecommendationsResponse }));

      const result = await service.fetchRecommendtionById(uuid);

      expect(axiosGetSpy).toHaveBeenCalledWith(
        `${urlElement.movieBase}/${uuid}/${urlElement.movieRecom}?api_key=${environment.tmdbApiKey}&page=1`,
        service.axiosConfig
      );
      expect(result.recomendations).toBeDefined();
      expect(result.recomendations.length).toBe(1);
      expect(result.recomendations[0].title).toBe('Recommended Movie');
    });

    it('should limit recommendations to 4', async () => {
      const uuid = '12345';
      
      const manyRecommendations = {
        results: Array.from({ length: 10 }, (_, i) => ({
          id: 1000 + i,
          original_title: `Recommendation ${i + 1}`,
          release_date: '2023-01-01',
          poster_path: `/rec${i + 1}.jpg`,
          vote_average: 7.0 + i * 0.1,
          genre_ids: [i + 1]
        }))
      };
      
      axiosGetSpy.and.returnValue(Promise.resolve({ data: manyRecommendations }));

      const result = await service.fetchRecommendtionById(uuid);

      expect(result.recomendations.length).toBe(5);
    });

    it('should handle empty recommendations', async () => {
      const uuid = '12345';
      axiosGetSpy.and.returnValue(Promise.resolve({ data: { results: [] } }));

      const result = await service.fetchRecommendtionById(uuid);

      expect(result).toEqual(service.movieDetails);
    });
  });

  describe('searchByMovieNameorPerson', () => {
    it('should search for movies and persons successfully', async () => {
      const searchText = 'test search';
      axiosGetSpy.and.returnValue(Promise.resolve({ data: mockSearchResponse }));

      const result = await service.searchByMovieNameorPerson(searchText);

      expect(axiosGetSpy).toHaveBeenCalledWith(
        `${urlElement.searchMulti}?api_key=${environment.tmdbApiKey}&query=${searchText}`,
        service.axiosConfig
      );
      expect(result.movies).toBeDefined();
      expect(result.person).toBeDefined();
      expect(result.movies.length).toBe(1);
      expect(result.person.length).toBe(1);
      expect(result.movies[0].title).toBe('Search Movie');
      expect(result.person[0].name).toBe('Famous Actor');
    });

    it('should handle empty search text', async () => {
      axiosGetSpy.and.returnValue(Promise.resolve({ data: mockSearchResponse }));

      const result = await service.searchByMovieNameorPerson();

      expect(axiosGetSpy).toHaveBeenCalledWith(
        `${urlElement.searchMulti}?api_key=${environment.tmdbApiKey}&query=`,
        service.axiosConfig
      );
      expect(result).toBeDefined();
    });

    it('should handle empty search results', async () => {
      const searchText = 'no results';
      axiosGetSpy.and.returnValue(Promise.resolve({ data: { results: [] } }));

      const result = await service.searchByMovieNameorPerson(searchText);

      expect(result.movies).toEqual([]);
      expect(result.person).toEqual([]);
    });

    it('should filter by media_type correctly', async () => {
      const searchText = 'mixed results';
      const mixedResults = {
        results: [
          { ...mockSearchResponse.results[0], media_type: 'movie' },
          { ...mockSearchResponse.results[1], media_type: 'person' },
          { id: 33333, media_type: 'tv', name: 'TV Show' }
        ]
      };
      axiosGetSpy.and.returnValue(Promise.resolve({ data: mixedResults }));

      const result = await service.searchByMovieNameorPerson(searchText);

      expect(result.movies.length).toBe(1);
      expect(result.person.length).toBe(1);
    });

    it('should handle API error', async () => {
      const searchText = 'test';
      const error = new Error('Search API Error');
      axiosGetSpy.and.returnValue(Promise.reject(error));

      const result = await service.searchByMovieNameorPerson(searchText);

      expect(result).toBe(error);
    });
  });

  describe('fetchByGenre', () => {
    it('should fetch movies by genre successfully', async () => {
      const genreId = '28';
      const genreResponse = {
        results: [
          {
            id: 55555,
            original_title: 'Action Movie',
            release_date: '2023-03-15',
            poster_path: '/action.jpg',
            vote_average: 8.2,
            genre_ids: [28]
          }
        ]
      };
      axiosGetSpy.and.returnValue(Promise.resolve({ data: genreResponse }));

      const result = await service.fetchByGenre(genreId);

      expect(axiosGetSpy).toHaveBeenCalledWith(
        `${urlElement.discoverMovie}?api_key=${environment.tmdbApiKey}&${urlElement.withgenre}=${genreId}&page=1`,
        service.axiosConfig
      );
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Action Movie');
      expect(result[0].genre).toEqual([28]);
    });

    it('should handle empty genre results', async () => {
      const genreId = '999';
      axiosGetSpy.and.returnValue(Promise.resolve({ data: { results: [] } }));

      const result = await service.fetchByGenre(genreId);

      expect(result).toEqual([]);
    });

    it('should handle API error for genre search', async () => {
      const genreId = '28';
      const error = new Error('Genre API Error');
      axiosGetSpy.and.returnValue(Promise.reject(error));

      const result = await service.fetchByGenre(genreId);

      expect(result).toBe(error);
    });

    it('should handle empty genre parameter', async () => {
      const genreResponse = { results: [] };
      axiosGetSpy.and.returnValue(Promise.resolve({ data: genreResponse }));

      const result = await service.fetchByGenre();

      expect(axiosGetSpy).toHaveBeenCalledWith(
        `${urlElement.discoverMovie}?api_key=${environment.tmdbApiKey}&${urlElement.withgenre}=&page=1`,
        service.axiosConfig
      );
      expect(result).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const uuid = '12345';
      axiosGetSpy.and.returnValue(Promise.reject(new Error('Network Error')));

      const result = await service.fetchDetailsById(uuid);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Network Error');
    });

    it('should handle invalid JSON response', async () => {
      const uuid = '12345';
      axiosGetSpy.and.returnValue(Promise.resolve({ data: null }));

      const result = await service.fetchDetailsById(uuid);

      expect(result).toEqual({});
    });
  });
});