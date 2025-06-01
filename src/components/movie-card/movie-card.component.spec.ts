import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCardComponent } from './movie-card.component';
import { PopularMoviesService } from '../../services/popular-movies/popular-movies.service';
import { CommonModule } from '@angular/common';
import { MovieDetailsModalComponent } from '../movie-details-modal/movie-details-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MoviesSearchService } from '../../services/movies-search/movies-search.service';

describe('MovieCardComponent', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;
  let mockPopularMoviesService: jasmine.SpyObj<PopularMoviesService>;
  let mockDomSanitizer: jasmine.SpyObj<DomSanitizer>;
  let mockMoviesSearchService: jasmine.SpyObj<MoviesSearchService>;

  const mockMovieData = [
    {
      id: 1,
      title: 'The Shawshank Redemption',
      overview: 'Two imprisoned men bond over a number of years.',
      poster_path: '/poster1.jpg',
      release_date: '1994-09-23',
      vote_average: 9.3
    },
    {
      id: 2,
      title: 'The Godfather',
      overview: 'The aging patriarch of an organized crime dynasty.',
      poster_path: '/poster2.jpg',
      release_date: '1972-03-24',
      vote_average: 9.2
    },
    {
      id: 3,
      title: 'The Dark Knight',
      overview: 'When the menace known as the Joker wreaks havoc.',
      poster_path: '/poster3.jpg',
      release_date: '2008-07-18',
      vote_average: 9.0
    }
  ];

  const mockSafeResourceUrl = {
    changingThisBreaksApplicationSecurity: 'https://www.youtube.com/embed/test'
  };

  beforeEach(async () => {
    mockPopularMoviesService = jasmine.createSpyObj('PopularMoviesService', ['fetchPopularMovies']);
    mockDomSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    mockMoviesSearchService = jasmine.createSpyObj('MoviesSearchService', ['fetchMovieDetails']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MovieCardComponent,
        MovieDetailsModalComponent
      ],
      providers: [
        { provide: PopularMoviesService, useValue: mockPopularMoviesService },
        { provide: DomSanitizer, useValue: mockDomSanitizer },
        { provide: MoviesSearchService, useValue: mockMoviesSearchService }
      ]
    }).compileComponents();

    mockPopularMoviesService.fetchPopularMovies.and.returnValue(Promise.resolve(mockMovieData));
    mockDomSanitizer.bypassSecurityTrustResourceUrl.and.returnValue(mockSafeResourceUrl);
    mockMoviesSearchService.fetchMovieDetails.and.returnValue(Promise.resolve({}));

    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.movieData).toEqual([]);
      expect(component.uuid).toBe('');
      expect(component.popularMovie).toBeInstanceOf(PopularMoviesService);
    });
  });

  describe('Constructor and Initialization', () => {
    it('should create new PopularMoviesService instance', () => {
      expect(component.popularMovie).toBeDefined();
      expect(component.popularMovie).toBeInstanceOf(PopularMoviesService);
    });

    it('should call fetchData on construction', () => {
      spyOn(component, 'fetchData');
      const newComponent = new MovieCardComponent();
      expect(newComponent.fetchData).toHaveBeenCalled();
    });
  });

  describe('fetchData Method', () => {
    beforeEach(() => {
      component.movieData = [];
    });

    it('should fetch popular movies successfully', async () => {
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.resolve(mockMovieData));
      await component.fetchData();
      expect(component.popularMovie.fetchPopularMovies).toHaveBeenCalled();
      expect(component.movieData).toEqual(mockMovieData);
    });

    it('should handle empty movie data', async () => {
      const emptyData: any[] = [];
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.resolve(emptyData));
      await component.fetchData();
      expect(component.movieData).toEqual(emptyData);
      expect(component.movieData.length).toBe(0);
    });

    it('should handle service returning null', async () => {
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.resolve(null));
      await component.fetchData();
      expect(component.movieData).toBeNull();
    });

    it('should handle service returning undefined', async () => {
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.resolve(undefined));
      await component.fetchData();
      expect(component.movieData).toBeUndefined();
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Service Error');
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.reject(error));
      await expectAsync(component.fetchData()).toBeRejected();
    });

    it('should update movieData with fetched data', async () => {
      const newMovieData = [
        { id: 4, title: 'Pulp Fiction', overview: 'Test overview' }
      ];
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.resolve(newMovieData));
      await component.fetchData();
      expect(component.movieData).toEqual(newMovieData);
      expect(component.movieData.length).toBe(1);
    });
  });

  describe('openModal Method', () => {
    it('should set uuid when called with string id', () => {
      const testId = '123';
      component.openModal(testId);
      expect(component.uuid).toBe(testId);
    });

    it('should set uuid when called with number id', () => {
      const testId = 456;
      component.openModal(testId);
      expect(component.uuid).toBe(testId);
    });

    it('should set uuid when called with null', () => {
      component.openModal(null);
      expect(component.uuid).toBeNull();
    });

    it('should set uuid when called with undefined', () => {
      component.openModal(undefined);
      expect(component.uuid).toBeUndefined();
    });

    it('should overwrite existing uuid', () => {
      component.uuid = 'old-id';
      const newId = 'new-id';
      component.openModal(newId);
      expect(component.uuid).toBe(newId);
      expect(component.uuid).not.toBe('old-id');
    });

    it('should handle empty string id', () => {
      component.openModal('');
      expect(component.uuid).toBe('');
    });

    it('should handle zero as id', () => {
      component.openModal(0);
      expect(component.uuid).toBe(0);
    });

    it('should handle boolean values', () => {
      component.openModal(true);
      expect(component.uuid).toBe(true);
      component.openModal(false);
      expect(component.uuid).toBe(false);
    });

    it('should handle object as id', () => {
      const objectId = { movieId: 123 };
      component.openModal(objectId);
      expect(component.uuid).toEqual(objectId);
    });
  });

  describe('Component Properties', () => {
    it('should have movieData property initialized as empty array', () => {
      const freshComponent = new MovieCardComponent();
      expect(freshComponent.movieData).toEqual([]);
    });

    it('should have uuid property initialized as empty string', () => {
      const freshComponent = new MovieCardComponent();
      expect(freshComponent.uuid).toBe('');
    });

    it('should have popularMovie service instance', () => {
      expect(component.popularMovie).toBeDefined();
      expect(component.popularMovie).toBeInstanceOf(PopularMoviesService);
    });

    it('should allow movieData to be reassigned', () => {
      const newData = [{ id: 1, title: 'Test Movie' }];
      component.movieData = newData;
      expect(component.movieData).toEqual(newData);
    });

    it('should allow uuid to be reassigned', () => {
      const newUuid = 'test-uuid';
      component.uuid = newUuid;
      expect(component.uuid).toBe(newUuid);
    });
  });

  describe('Integration Tests', () => {
    it('should fetch data and update movieData on component initialization', async () => {
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.resolve(mockMovieData));
      await component.fetchData();
      expect(component.movieData).toEqual(mockMovieData);
      expect(component.popularMovie.fetchPopularMovies).toHaveBeenCalled();
    });

    it('should complete full flow: fetch data then open modal', async () => {
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.resolve(mockMovieData));
      await component.fetchData();
      component.openModal(mockMovieData[0].id);
      expect(component.movieData).toEqual(mockMovieData);
      expect(component.uuid).toBe(mockMovieData[0].id);
    });

    it('should handle multiple modal opens with different ids', () => {
      const ids = [1, 2, 3, '4', null, undefined];
      
      ids.forEach(id => {
        component.openModal(id);
        expect(component.uuid).toBe(id);
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle fetchData called multiple times', async () => {
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.resolve(mockMovieData));
      await component.fetchData();
      await component.fetchData();
      expect(component.popularMovie.fetchPopularMovies).toHaveBeenCalledTimes(2);
      expect(component.movieData).toEqual(mockMovieData);
    });

    it('should handle network timeout in fetchData', async () => {
      const timeoutError = new Error('Network timeout');
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.reject(timeoutError));
      
      try {
        await component.fetchData();
        fail('Expected fetchData to throw error');
      } catch (error: any) {
        expect(error.message).toBe('Network timeout');
      }
    });

    it('should handle service returning malformed data', async () => {
      const malformedData = { not: 'an array' };
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.resolve(malformedData as any));
      await component.fetchData();
      expect(component.movieData).toEqual(malformedData);
    });

    it('should handle extremely large dataset', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        title: `Movie ${i}`,
        overview: `Overview ${i}`
      }));
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.resolve(largeDataset));
      await component.fetchData();
      expect(component.movieData.length).toBe(1000);
      expect(component.movieData[0].title).toBe('Movie 0');
      expect(component.movieData[999].title).toBe('Movie 999');
    });
  });

  describe('Type Safety Tests', () => {
    it('should handle different data types for uuid', () => {
      const testValues = [
        'string-id',
        123,
        true,
        false,
        null,
        undefined,
        [],
        {},
        0,
        ''
      ];
      
      testValues.forEach(value => {
        component.openModal(value);
        expect(component.uuid).toBe(value);
      });
    });

    it('should maintain movieData type consistency', async () => {
      spyOn(component.popularMovie, 'fetchPopularMovies').and.returnValue(Promise.resolve(mockMovieData));
      await component.fetchData();
      expect(Array.isArray(component.movieData)).toBe(true);
      if (component.movieData && component.movieData.length > 0) {
        expect(typeof component.movieData[0].id).toBe('number');
        expect(typeof component.movieData[0].title).toBe('string');
      }
    });
  });
});