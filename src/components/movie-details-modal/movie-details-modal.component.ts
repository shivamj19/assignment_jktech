import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MoviesSearchService } from '../../services/movies-search/movies-search.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-details-modal',
  imports: [CommonModule],
  templateUrl: './movie-details-modal.component.html',
  styleUrl: './movie-details-modal.component.css'
})
export class MovieDetailsModalComponent implements OnInit, OnChanges {
  @Input() uuid: any = '';
  @ViewChild('movieModal') myDivElement!: ElementRef;
  movieDetails: any = {};
  trailerLink: any = "";

  constructor(private sanitizer: DomSanitizer){}

  async ngOnInit(){
    console.log("MovieDetailsModalComponent Initiliazed");
  }

  async ngOnChanges(changes: SimpleChanges){
    if(changes["uuid"] && changes["uuid"].currentValue){
      this.movieDetails = await this.fetchMovieDetails(this.uuid);
      this.trailerLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.movieDetails.trailerLink);
      this.myDivElement.nativeElement.style.display = "block";
    }
  }

  async fetchMovieDetails(uuid: any){
    let movieSearch = new MoviesSearchService();
    return await movieSearch.fetchMovieDetails(uuid);
  }

  async openMovieModal(uuid: any){
    this.movieDetails = {};
    this.trailerLink = "";
    this.movieDetails = await this.fetchMovieDetails(uuid);
    this.trailerLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.movieDetails.trailerLink);
  }

  closeModal(){
    this.myDivElement.nativeElement.style.display = "none";
  }

}
