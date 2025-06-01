import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SimpleChange } from '@angular/core';
import { MovieDetailsModalComponent } from './movie-details-modal.component';
import { MoviesSearchService } from '../../services/movies-search/movies-search.service';

describe('MovieDetailsModalComponent', () => {
  let component: MovieDetailsModalComponent;
  let fixture: ComponentFixture<MovieDetailsModalComponent>;
  let mockDomSanitizer: jasmine.SpyObj<DomSanitizer>;
  let mockMoviesSearchService: jasmine.SpyObj<MoviesSearchService>;

  const mockMovieDetails = {
    uuid: 550,
    title: 'Fight Club',
    description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.',
    year: 1999,
    rating: '8.8',
    posterImage: 'https://example.com/poster.jpg',
    trailerLink: 'https://www.youtube.com/embed/SUXWAEX2jlg'
  };

  const mockSafeResourceUrl = {
    changingThisBreaksApplicationSecurity: 'https://www.youtube.com/embed/SUXWAEX2jlg'
  };

  beforeEach(async () => {
    mockDomSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    mockMoviesSearchService = jasmine.createSpyObj('MoviesSearchService', ['fetchMovieDetails']);

    await TestBed.configureTestingModule({
      imports: [MovieDetailsModalComponent],
      providers: [
        { provide: DomSanitizer, useValue: mockDomSanitizer },
        { provide: MoviesSearchService, useValue: mockMoviesSearchService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailsModalComponent);
    component = fixture.componentInstance;

    mockDomSanitizer.bypassSecurityTrustResourceUrl.and.callFake((url: string) => {
      return mockSafeResourceUrl;
    });
    mockMoviesSearchService.fetchMovieDetails.and.returnValue(Promise.resolve(mockMovieDetails));

    component.myDivElement = {
      nativeElement: {
        style: { display: 'none' }
      }
    } as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.uuid).toBe('');
      expect(component.movieDetails).toEqual({});
      expect(component.trailerLink).toBe('');
    });

    it('should log initialization message on ngOnInit', async () => {     
      spyOn(console, 'log');
      await component.ngOnInit();
      expect(console.log).toHaveBeenCalledWith('MovieDetailsModalComponent Initiliazed');
    });
  });

  describe('Input Changes - ngOnChanges', () => {
    it('should fetch movie details when uuid input changes to valid value', async () => {
      const changes = {
        uuid: new SimpleChange(null, '550', true)
      };
      spyOn(component, 'fetchMovieDetails').and.returnValue(Promise.resolve(mockMovieDetails));
      await component.ngOnChanges(changes);
      expect(component.fetchMovieDetails).toHaveBeenCalledWith('550');
      expect(component.movieDetails).toEqual(mockMovieDetails);
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(mockMovieDetails.trailerLink);
      expect(component.trailerLink).toEqual(mockSafeResourceUrl);
      expect(component.myDivElement.nativeElement.style.display).toBe('block');
    });

    it('should not fetch movie details when uuid changes to falsy value', async () => {
      const changes = {
        uuid: new SimpleChange('550', '', false)
      };
      spyOn(component, 'fetchMovieDetails');
      await component.ngOnChanges(changes);
      expect(component.fetchMovieDetails).not.toHaveBeenCalled();
    });

    it('should not fetch movie details when uuid is not in changes', async () => {
      const changes = {
        otherProperty: new SimpleChange('old', 'new', false)
      };
      spyOn(component, 'fetchMovieDetails');      
      await component.ngOnChanges(changes);
      expect(component.fetchMovieDetails).not.toHaveBeenCalled();
    });

    it('should handle null currentValue in uuid changes', async () => {
      const changes = {
        uuid: new SimpleChange('550', null, false)
      };
      spyOn(component, 'fetchMovieDetails');
      await component.ngOnChanges(changes);
      expect(component.fetchMovieDetails).not.toHaveBeenCalled();
    });

    it('should handle undefined currentValue in uuid changes', async () => {
      const changes = {
        uuid: new SimpleChange('550', undefined, false)
      };
      spyOn(component, 'fetchMovieDetails');
      await component.ngOnChanges(changes);
      expect(component.fetchMovieDetails).not.toHaveBeenCalled();
    });
  });

  describe('fetchMovieDetails', () => {
    it('should create new MoviesSearchService instance and fetch movie details', async () => {
      const uuid = '550';
      spyOn(MoviesSearchService.prototype, 'fetchMovieDetails').and.returnValue(Promise.resolve(mockMovieDetails));
      const result = await component.fetchMovieDetails(uuid);
      expect(MoviesSearchService.prototype.fetchMovieDetails).toHaveBeenCalledWith(uuid);
      expect(result).toEqual(mockMovieDetails);
    });

    it('should handle service errors gracefully', async () => {
      const uuid = '550';
      const error = new Error('Service Error');
      spyOn(MoviesSearchService.prototype, 'fetchMovieDetails').and.returnValue(Promise.reject(error));
      await expectAsync(component.fetchMovieDetails(uuid)).toBeRejected();
    });
  });

  describe('openMovieModal', () => {
    it('should reset properties and fetch new movie details', async () => {
      const uuid = '550';
      component.movieDetails = { existing: 'data' };
      component.trailerLink = 'existing-link';
      spyOn(component, 'fetchMovieDetails').and.returnValue(Promise.resolve(mockMovieDetails));
      await component.openMovieModal(uuid);
      expect(component.movieDetails).toEqual({});
      expect(component.trailerLink).toBe('');
      expect(component.fetchMovieDetails).toHaveBeenCalledWith(uuid);
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(mockMovieDetails.trailerLink);
    });

    it('should update movieDetails and trailerLink after fetching', async () => {
      const uuid = '550';
      spyOn(component, 'fetchMovieDetails').and.returnValue(Promise.resolve(mockMovieDetails));
      await component.openMovieModal(uuid);
      expect(component.movieDetails).toEqual(mockMovieDetails);
      expect(component.trailerLink).toEqual(mockSafeResourceUrl);
    });

    it('should handle fetchMovieDetails error in openMovieModal', async () => {
      const uuid = '550';
      const error = new Error('Fetch Error');
      spyOn(component, 'fetchMovieDetails').and.returnValue(Promise.reject(error));
      spyOn(console, 'error');
      await expectAsync(component.openMovieModal(uuid)).toBeRejected();
    });
  });

  describe('closeModal', () => {
    it('should hide the modal by setting display to none', () => {
      component.myDivElement.nativeElement.style.display = 'block';
      component.closeModal();
      expect(component.myDivElement.nativeElement.style.display).toBe('none');
    });

    it('should work when modal is already hidden', () => {
      component.myDivElement.nativeElement.style.display = 'none';
      component.closeModal();
      expect(component.myDivElement.nativeElement.style.display).toBe('none');
    });
  });

  describe('DOM Sanitizer Integration', () => {
    it('should sanitize trailer link properly', async () => {
      const unsafeUrl = 'javascript:alert("xss")';
      const movieDetailsWithUnsafeUrl = { ...mockMovieDetails, trailerLink: unsafeUrl };
      spyOn(component, 'fetchMovieDetails').and.returnValue(Promise.resolve(movieDetailsWithUnsafeUrl));
      await component.openMovieModal('550');
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(unsafeUrl);
    });

    it('should handle empty trailer link', async () => {
      const movieDetailsWithoutTrailer = { ...mockMovieDetails, trailerLink: '' };
      spyOn(component, 'fetchMovieDetails').and.returnValue(Promise.resolve(movieDetailsWithoutTrailer));
      await component.openMovieModal('550');
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('');
    });

    it('should handle null trailer link', async () => {
      const movieDetailsWithNullTrailer = { ...mockMovieDetails, trailerLink: null as any };
      spyOn(component, 'fetchMovieDetails').and.returnValue(Promise.resolve(movieDetailsWithNullTrailer));
      await component.openMovieModal('550');
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('');
    });
  });

  describe('ViewChild Element', () => {
    it('should handle missing ViewChild element gracefully', () => {
      component.myDivElement = undefined as any;
      expect(() => component.closeModal()).toThrow();
    });

    it('should handle ViewChild with missing nativeElement', () => {
      component.myDivElement = {} as any;
      expect(() => component.closeModal()).toThrow();
    });
  });

  describe('Input Property', () => {
    it('should accept string uuid input', () => {
      component.uuid = '123';
      expect(component.uuid).toBe('123');
    });

    it('should accept number uuid input', () => {
      component.uuid = 123 as any; 
      expect(component.uuid).toBe(123);
    });

    it('should accept null uuid input', () => {
      component.uuid = null as any;
      expect(component.uuid).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle fetchMovieDetails returning null', async () => {
      const changes = {
        uuid: new SimpleChange(null, '550', true)
      };
      spyOn(component, 'fetchMovieDetails').and.returnValue(Promise.resolve(null as any));
      await component.ngOnChanges(changes);
      expect(component.movieDetails).toBeNull();
    });

    it('should handle fetchMovieDetails returning undefined', async () => {
      const changes = {
        uuid: new SimpleChange(null, '550', true)
      };
      spyOn(component, 'fetchMovieDetails').and.returnValue(Promise.resolve(undefined as any));
      await component.ngOnChanges(changes);
      expect(component.movieDetails).toBeUndefined();
    });

    it('should handle movie details without trailerLink property', async () => {
      const movieDetailsWithoutTrailer = { uuid: 550, title: 'Test Movie' } as any;
      const changes = {
        uuid: new SimpleChange(null, '550', true)
      };
      spyOn(component, 'fetchMovieDetails').and.returnValue(Promise.resolve(movieDetailsWithoutTrailer));
      await component.ngOnChanges(changes);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full flow from input change to modal display', async () => {
      const changes = {
        uuid: new SimpleChange(null, '550', true)
      };
      spyOn(component, 'fetchMovieDetails').and.returnValue(Promise.resolve(mockMovieDetails));
      await component.ngOnChanges(changes);
      expect(component.movieDetails).toEqual(mockMovieDetails);
      expect(component.trailerLink).toEqual(mockSafeResourceUrl);
      expect(component.myDivElement.nativeElement.style.display).toBe('block');
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(mockMovieDetails.trailerLink);
    });

    it('should complete full flow for openMovieModal', async () => {
      const uuid = '550';
      spyOn(component, 'fetchMovieDetails').and.returnValue(Promise.resolve(mockMovieDetails));
      await component.openMovieModal(uuid);
      expect(component.movieDetails).toEqual(mockMovieDetails);
      expect(component.trailerLink).toEqual(mockSafeResourceUrl);
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(mockMovieDetails.trailerLink);
    });
  });
});