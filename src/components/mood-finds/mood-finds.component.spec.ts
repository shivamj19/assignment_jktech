import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChanges } from '@angular/core';
import { MoodFindsComponent } from './mood-finds.component';
import { MoviesSearchService } from '../../services/movies-search/movies-search.service';
import { MovieDetailsModalComponent } from "../movie-details-modal/movie-details-modal.component";
import { CommonModule } from '@angular/common';

describe('MoodFindsComponent', () => {
  let component: MoodFindsComponent;
  let fixture: ComponentFixture<MoodFindsComponent>;
  let mockMoviesSearchService: jasmine.SpyObj<MoviesSearchService>;

  const mockMovieData = [
    { id: 1, title: 'Test Movie 1', genre_ids: [35, 18] },
    { id: 2, title: 'Test Movie 2', genre_ids: [28, 80] }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('MoviesSearchService', ['fetchByGenre']);

    await TestBed.configureTestingModule({
      imports: [MoodFindsComponent, MovieDetailsModalComponent, CommonModule],
      providers: [
        { provide: MoviesSearchService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MoodFindsComponent);
    component = fixture.componentInstance;
    mockMoviesSearchService = TestBed.inject(MoviesSearchService) as jasmine.SpyObj<MoviesSearchService>;
  });

  beforeEach(() => {
    mockMoviesSearchService.fetchByGenre.and.returnValue(Promise.resolve(mockMovieData));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.movieData).toEqual([]);
      expect(component.uuid).toBe('');
      expect(component.moodType).toBeUndefined();
    });

    it('should have correct genre mappings', () => {
      expect(component.genreListBasisMood).toEqual({
        "feelGood": '35,18,14,10749',
        "actionFix": '10752,27,80,28',
        "mindBenders": '80,9648,878,53'
      });
    });

    it('should initialize movieSearch service', () => {
      expect(component.movieSearch).toBeInstanceOf(MoviesSearchService);
    });
  });

  describe('ngOnChanges', () => {
    it('should call fetchData when moodType changes with valid value', async () => {
      spyOn(component, 'fetchData').and.returnValue(Promise.resolve());
      
      const changes: SimpleChanges = {
        ['moodType']: {
          currentValue: 'feelGood',
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true
        }
      };

      await component.ngOnChanges(changes);
      expect(component.fetchData).toHaveBeenCalledWith(component.genreListBasisMood['feelGood']);
    });

    it('should not call fetchData when moodType changes to falsy value', async () => {
      spyOn(component, 'fetchData').and.returnValue(Promise.resolve());
      
      const changes: SimpleChanges = {
        ['moodType']: {
          currentValue: null,
          previousValue: 'feelGood',
          firstChange: false,
          isFirstChange: () => false
        }
      };

      await component.ngOnChanges(changes);
      expect(component.fetchData).not.toHaveBeenCalled();
    });

    it('should not call fetchData when moodType is not in changes', async () => {
      spyOn(component, 'fetchData').and.returnValue(Promise.resolve());
      
      const changes: SimpleChanges = {
        otherProperty: {
          currentValue: 'test',
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true
        }
      };

      await component.ngOnChanges(changes);
      expect(component.fetchData).not.toHaveBeenCalled();
    });

    it('should handle all mood types correctly', async () => {
      spyOn(component, 'fetchData').and.returnValue(Promise.resolve());

      let changes: SimpleChanges = {
        ['moodType']: {
          currentValue: 'feelGood',
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true
        }
      };
      await component.ngOnChanges(changes);
      expect(component.fetchData).toHaveBeenCalledWith(component.genreListBasisMood['feelGood']);

      changes['moodType'].currentValue = 'actionFix';
      await component.ngOnChanges(changes);
      expect(component.fetchData).toHaveBeenCalledWith(component.genreListBasisMood['actionFix']);

      changes['moodType'].currentValue = 'mindBenders';
      await component.ngOnChanges(changes);
      expect(component.fetchData).toHaveBeenCalledWith(component.genreListBasisMood['mindBenders']);
    });
  });

  describe('fetchData', () => {
    it('should fetch movie data and update movieData property', async () => {
      const testGenre = '35,18';
      await component.fetchData(testGenre);
      expect(mockMoviesSearchService.fetchByGenre).toHaveBeenCalledWith(testGenre);
      expect(component.movieData).toEqual(mockMovieData);
    });

    it('should handle empty genre parameter', async () => {
      await component.fetchData('');
      expect(mockMoviesSearchService.fetchByGenre).toHaveBeenCalledWith('');
    });

    it('should handle null genre parameter', async () => {
      await component.fetchData(null);
      expect(mockMoviesSearchService.fetchByGenre).toHaveBeenCalledWith(null);
    });

    it('should handle service returning empty array', async () => {
      mockMoviesSearchService.fetchByGenre.and.returnValue(Promise.resolve([]));
      await component.fetchData('35,18');
      expect(component.movieData).toEqual([]);
    });

    it('should handle service errors gracefully', async () => {
      const errorMessage = 'Service error';
      mockMoviesSearchService.fetchByGenre.and.returnValue(Promise.reject(new Error(errorMessage)));
      try {
        await component.fetchData('35,18');
      } catch (error) {
        expect((error as Error).message).toBe(errorMessage);
      }
      expect(mockMoviesSearchService.fetchByGenre).toHaveBeenCalledWith('35,18');
    });
  });

  describe('openModal', () => {
    it('should set uuid property with provided id', () => {
      const testId = 'test-movie-id-123';
      component.openModal(testId);
      expect(component.uuid).toBe(testId);
    });

    it('should handle numeric id', () => {
      const testId = 12345;
      component.openModal(testId);
      expect(component.uuid).toBe(testId);
    });

    it('should handle null id', () => {
      component.openModal(null);
      expect(component.uuid).toBeNull();
    });

    it('should handle undefined id', () => {
      component.openModal(undefined);
      expect(component.uuid).toBeUndefined();
    });

    it('should overwrite previous uuid value', () => {
      component.uuid = 'previous-id';
      const newId = 'new-id';
      component.openModal(newId);
      expect(component.uuid).toBe(newId);
    });
  });

  describe('Input Property', () => {
    it('should accept moodType input', () => {
      component.moodType = 'feelGood';
      expect(component.moodType).toBe('feelGood');
    });

    it('should handle different moodType values', () => {
      const moodTypes = ['feelGood', 'actionFix', 'mindBenders'];
      moodTypes.forEach(mood => {
        component.moodType = mood;
        expect(component.moodType).toBe(mood);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should complete full workflow when moodType changes', async () => {
      component.moodType = 'feelGood';
      const changes: SimpleChanges = {
        ['moodType']: {
          currentValue: 'feelGood',
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true
        }
      };
      await component.ngOnChanges(changes);
      expect(mockMoviesSearchService.fetchByGenre).toHaveBeenCalledWith(component.genreListBasisMood['feelGood']);
      expect(component.movieData).toEqual(mockMovieData);
    });

    it('should handle modal opening after data fetch', async () => {
      await component.fetchData('35,18');
      const movieId = mockMovieData[0].id;
      component.openModal(movieId);
      expect(component.movieData).toEqual(mockMovieData);
      expect(component.uuid).toBe(movieId);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid mood type gracefully', async () => {
      const changes: SimpleChanges = {
        ['moodType']: {
          currentValue: 'invalidMood',
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true
        }
      };
      await component.ngOnChanges(changes);
      expect(mockMoviesSearchService.fetchByGenre).toHaveBeenCalledWith(component.genreListBasisMood['invalidMood']);
    });
  });
});