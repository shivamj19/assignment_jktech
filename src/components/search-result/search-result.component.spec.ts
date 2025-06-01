import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { SearchResultComponent } from './search-result.component';
import { MoviesSearchService } from '../../services/movies-search/movies-search.service';
import { MovieDetailsModalComponent } from '../movie-details-modal/movie-details-modal.component';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

describe('SearchResultComponent', () => {
  let component: SearchResultComponent;
  let fixture: ComponentFixture<SearchResultComponent>;
  let mockMoviesSearchService: jasmine.SpyObj<MoviesSearchService>;
  let mockDomSanitizer: jasmine.SpyObj<DomSanitizer>;

  const mockSearchResults = [
    {
      id: 1,
      title: 'The Matrix',
      overview: 'A computer programmer discovers reality is a simulation.',
      poster_path: '/matrix.jpg',
      release_date: '1999-03-31',
      vote_average: 8.7
    },
    {
      id: 2,
      title: 'Matrix Reloaded',
      overview: 'Neo and the rebel leaders continue their fight.',
      poster_path: '/matrix2.jpg',
      release_date: '2003-05-15',
      vote_average: 7.2
    },
    {
      id: 3,
      title: 'Matrix Revolutions',
      overview: 'The final chapter in the Matrix trilogy.',
      poster_path: '/matrix3.jpg',
      release_date: '2003-11-05',
      vote_average: 6.8
    }
  ];

  const mockPersonResults = [
    {
      id: 101,
      name: 'Keanu Reeves',
      profile_path: '/keanu.jpg',
      known_for_department: 'Acting'
    },
    {
      id: 102,
      name: 'Laurence Fishburne',
      profile_path: '/laurence.jpg',
      known_for_department: 'Acting'
    }
  ];

  const mockSafeResourceUrl = {
    changingThisBreaksApplicationSecurity: 'https://www.youtube.com/embed/test'
  };

  beforeEach(async () => {
    mockMoviesSearchService = jasmine.createSpyObj('MoviesSearchService', ['searchByMovieNameorPerson']);
    mockDomSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SearchResultComponent,
        MovieDetailsModalComponent
      ],
      providers: [
        { provide: MoviesSearchService, useValue: mockMoviesSearchService },
        { provide: DomSanitizer, useValue: mockDomSanitizer }
      ]
    }).compileComponents();

    mockMoviesSearchService.searchByMovieNameorPerson.and.returnValue(Promise.resolve(mockSearchResults));
    mockDomSanitizer.bypassSecurityTrustResourceUrl.and.returnValue(mockSafeResourceUrl);

    fixture = TestBed.createComponent(SearchResultComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.searchText).toBeUndefined();
      expect(component.movieData).toEqual([]);
      expect(component.uuid).toBe('');
      expect(component.movieSearch).toBeInstanceOf(MoviesSearchService);
    });
  });

  describe('Constructor and Initialization', () => {
    it('should create new MoviesSearchService instance', () => {
      expect(component.movieSearch).toBeDefined();
      expect(component.movieSearch).toBeInstanceOf(MoviesSearchService);
    });

    it('should not call fetchData on construction', () => {
      spyOn(component, 'fetchData');
      const newComponent = new SearchResultComponent();
      expect(newComponent.fetchData).not.toHaveBeenCalled();
    });
  });

  describe('Input Property', () => {
    it('should accept string searchText input', () => {
      component.searchText = 'matrix';
      expect(component.searchText).toBe('matrix');
    });

    it('should accept null searchText input', () => {
      component.searchText = null;
      expect(component.searchText).toBeNull();
    });

    it('should accept undefined searchText input', () => {
      component.searchText = undefined;
      expect(component.searchText).toBeUndefined();
    });

    it('should accept empty string searchText input', () => {
      component.searchText = '';
      expect(component.searchText).toBe('');
    });

    it('should accept number as searchText input', () => {
      component.searchText = 123;
      expect(component.searchText).toBe(123);
    });
  });

  describe('ngOnChanges Method', () => {
    beforeEach(() => {
      spyOn(component, 'fetchData').and.returnValue(Promise.resolve());
    });

    it('should call fetchData when searchText changes to valid value', async () => {
      const changes: SimpleChanges = {
        searchText: new SimpleChange(null, 'matrix', true)
      };
      await component.ngOnChanges(changes);
      expect(component.fetchData).toHaveBeenCalledWith('matrix');
    });

    it('should call fetchData when searchText changes from one value to another', async () => {
      component.searchText = 'batman';
      const changes: SimpleChanges = {
        searchText: new SimpleChange('matrix', 'batman', false)
      };
      await component.ngOnChanges(changes);
      expect(component.fetchData).toHaveBeenCalledWith('batman');
    });

    it('should not call fetchData when searchText changes to null', async () => {
      const changes: SimpleChanges = {
        searchText: new SimpleChange('matrix', null, false)
      };
      await component.ngOnChanges(changes);
      expect(component.fetchData).not.toHaveBeenCalled();
    });

    it('should not call fetchData when searchText changes to undefined', async () => {
      const changes: SimpleChanges = {
        searchText: new SimpleChange('matrix', undefined, false)
      };
      await component.ngOnChanges(changes);
      expect(component.fetchData).not.toHaveBeenCalled();
    });

    it('should not call fetchData when searchText changes to empty string', async () => {
      const changes: SimpleChanges = {
        searchText: new SimpleChange('matrix', '', false)
      };
      await component.ngOnChanges(changes);
      expect(component.fetchData).not.toHaveBeenCalled();
    });

    it('should not call fetchData when searchText is not in changes', async () => {
      const changes: SimpleChanges = {
        otherProperty: new SimpleChange('old', 'new', false)
      };
      await component.ngOnChanges(changes);
      expect(component.fetchData).not.toHaveBeenCalled();
    });

    it('should not call fetchData when searchText change has no currentValue', async () => {
      const changes: SimpleChanges = {
        searchText: new SimpleChange('matrix', null, false)
      };
      await component.ngOnChanges(changes);
      expect(component.fetchData).not.toHaveBeenCalled();
    });

    it('should handle multiple property changes but only process searchText', async () => {
      component.searchText = 'spiderman';
      const changes: SimpleChanges = {
        searchText: new SimpleChange('matrix', 'spiderman', false),
        otherProp: new SimpleChange('old', 'new', false)
      };
      await component.ngOnChanges(changes);
      expect(component.fetchData).toHaveBeenCalledTimes(1);
      expect(component.fetchData).toHaveBeenCalledWith('spiderman');
    });

    it('should call fetchData with number searchText', async () => {
      component.searchText = 2023;
      const changes: SimpleChanges = {
        searchText: new SimpleChange(null, 2023, true)
      };
      await component.ngOnChanges(changes);
      expect(component.fetchData).toHaveBeenCalledWith(2023);
    });

    it('should handle boolean searchText values', async () => {
      component.searchText = true;
      const changes: SimpleChanges = {
        searchText: new SimpleChange(null, true, true)
      };
      await component.ngOnChanges(changes);
      expect(component.fetchData).toHaveBeenCalledWith(true);
    });
  });

  describe('fetchData Method', () => {
    beforeEach(() => {
      component.movieData = [];
    });

    it('should fetch search results successfully', async () => {
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(mockSearchResults));
      await component.fetchData('matrix');
      expect(component.movieSearch.searchByMovieNameorPerson).toHaveBeenCalledWith('matrix');
      expect(component.movieData).toEqual(mockSearchResults);
    });

    it('should handle empty search results', async () => {
      const emptyResults: any[] = [];
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(emptyResults));
      await component.fetchData('nonexistent');
      expect(component.movieData).toEqual(emptyResults);
      expect(component.movieData.length).toBe(0);
    });

    it('should handle service returning null', async () => {
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(null));
      await component.fetchData('test');
      expect(component.movieData).toBeNull();
    });

    it('should handle service returning undefined', async () => {
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(undefined));
      await component.fetchData('test');
      expect(component.movieData).toBeUndefined();
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Search Service Error');
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.reject(error));
      await expectAsync(component.fetchData('error')).toBeRejected();
    });

    it('should search with different data types', async () => {
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(mockSearchResults));
      
      await component.fetchData(123);
      expect(component.movieSearch.searchByMovieNameorPerson).toHaveBeenCalledWith(123);
      
      await component.fetchData(true);
      expect(component.movieSearch.searchByMovieNameorPerson).toHaveBeenCalledWith(true);

      await component.fetchData({ query: 'matrix' });
      expect(component.movieSearch.searchByMovieNameorPerson).toHaveBeenCalledWith({ query: 'matrix' });
    });

    it('should update movieData with person search results', async () => {
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(mockPersonResults));
      await component.fetchData('keanu');
      expect(component.movieData).toEqual(mockPersonResults);
      expect(component.movieData[0].name).toBe('Keanu Reeves');
    });

    it('should handle mixed movie and person results', async () => {
      const mixedResults = [...mockSearchResults, ...mockPersonResults];
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(mixedResults));
      await component.fetchData('matrix keanu');
      expect(component.movieData).toEqual(mixedResults);
      expect(component.movieData.length).toBe(5);
    });

    it('should handle special characters in search text', async () => {
      const specialSearchText = 'matrix & reloaded (2003)';
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(mockSearchResults));
      await component.fetchData(specialSearchText);
      expect(component.movieSearch.searchByMovieNameorPerson).toHaveBeenCalledWith(specialSearchText);
    });

    it('should handle whitespace in search text', async () => {
      const whitespaceText = '  matrix  ';
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(mockSearchResults));
      await component.fetchData(whitespaceText);
      expect(component.movieSearch.searchByMovieNameorPerson).toHaveBeenCalledWith(whitespaceText);
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

    it('should handle object as id', () => {
      const objectId = { movieId: 123 };
      component.openModal(objectId);
      expect(component.uuid).toEqual(objectId);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full search flow when searchText input changes', async () => {
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(mockSearchResults));
      const changes: SimpleChanges = {
        searchText: new SimpleChange(null, 'matrix', true)
      };
      await component.ngOnChanges(changes);
      expect(component.movieSearch.searchByMovieNameorPerson).toHaveBeenCalledWith('matrix');
      expect(component.movieData).toEqual(mockSearchResults);
    });

    it('should handle search and modal open flow', async () => {
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(mockSearchResults));
      await component.fetchData('matrix');
      component.openModal(mockSearchResults[0].id);
      expect(component.movieData).toEqual(mockSearchResults);
      expect(component.uuid).toBe(mockSearchResults[0].id);
    });

    it('should handle multiple searches in sequence', async () => {
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.callFake((searchText: any) => {
        if (searchText === 'matrix') {
          return Promise.resolve(mockSearchResults);
        } else if (searchText === 'keanu') {
          return Promise.resolve(mockPersonResults);
        }
        return Promise.resolve([]);
      });
      
      const changes1: SimpleChanges = {
        searchText: new SimpleChange(null, 'matrix', true)
      };
      await component.ngOnChanges(changes1);
      expect(component.movieData).toEqual(mockSearchResults);
      
      const changes2: SimpleChanges = {
        searchText: new SimpleChange('matrix', 'keanu', false)
      };
      component.searchText = 'keanu';
      await component.ngOnChanges(changes2);
      expect(component.movieData).toEqual(mockPersonResults);
    });

    it('should handle search error and recovery', async () => {
      spyOn(component.movieSearch, 'searchByMovieNameorPerson')
        .and.returnValue(Promise.reject(new Error('Network error')))
        .and.returnValue(Promise.resolve(mockSearchResults));
      
      try {
        await component.fetchData('error');
        fail('Expected fetchData to throw error');
      } catch (error: any) {
        expect(error.message).toBe('Network error');
      }
      
      await component.fetchData('matrix');
      expect(component.movieData).toEqual(mockSearchResults);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network timeout', async () => {
      const timeoutError = new Error('Request timeout');
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.reject(timeoutError));
      await expectAsync(component.fetchData('timeout')).toBeRejectedWith(timeoutError);
    });

    it('should handle malformed response data', async () => {
      const malformedData = { error: 'Invalid response format' };
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(malformedData as any));
      await component.fetchData('malformed');
      expect(component.movieData).toEqual(malformedData);
    });

    it('should handle extremely long search text', async () => {
      const longSearchText = 'a'.repeat(1000);
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve([]));
      await component.fetchData(longSearchText);
      expect(component.movieSearch.searchByMovieNameorPerson).toHaveBeenCalledWith(longSearchText);
    });

    it('should handle concurrent search requests', async () => {
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(mockSearchResults));
      
      const promises = [
        component.fetchData('search1'),
        component.fetchData('search2'),
        component.fetchData('search3')
      ];
      
      await Promise.all(promises);
      
      expect(component.movieSearch.searchByMovieNameorPerson).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle ngOnChanges called without searchText property', async () => {
      spyOn(component, 'fetchData');
      const changes: SimpleChanges = {};
      await component.ngOnChanges(changes);
      expect(component.fetchData).not.toHaveBeenCalled();
    });

    it('should handle searchText with only whitespace', async () => {
      const changes: SimpleChanges = {
        searchText: new SimpleChange(null, '   ', true)
      };
      spyOn(component, 'fetchData');
      await component.ngOnChanges(changes);
      expect(component.fetchData).toHaveBeenCalledWith('   ');
    });

    it('should handle searchText as array', async () => {
      const arraySearchText = ['matrix', 'reloaded'];
      const changes: SimpleChanges = {
        searchText: new SimpleChange(null, arraySearchText, true)
      };
      spyOn(component, 'fetchData');
      await component.ngOnChanges(changes);
      expect(component.fetchData).toHaveBeenCalledWith(arraySearchText);
    });

    it('should handle very rapid input changes', async () => {
      spyOn(component.movieSearch, 'searchByMovieNameorPerson').and.returnValue(Promise.resolve(mockSearchResults));
      
      const searches = ['a', 'ab', 'abc', 'abcd', 'abcde'];
      
      for (let i = 0; i < searches.length; i++) {
        const changes: SimpleChanges = {
          searchText: new SimpleChange(searches[i-1] || null, searches[i], i === 0)
        };
        component.searchText = searches[i];
        await component.ngOnChanges(changes);
      }
      
      expect(component.movieSearch.searchByMovieNameorPerson).toHaveBeenCalledTimes(5);
    });
  });
});