import { Component, Input, OnInit } from '@angular/core';
import { MoviesSearchService } from '../../services/movies-search/movies-search.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-details-modal',
  imports: [CommonModule],
  templateUrl: './movie-details-modal.component.html',
  styleUrl: './movie-details-modal.component.css'
})
export class MovieDetailsModalComponent implements OnInit {
  @Input() uuid: any = '';
  movieDetails: any = {};
  trailerLink: any = "";

  constructor(private sanitizer: DomSanitizer) {}

  async ngOnInit(){
    console.log("MovieDetailsModalComponent Initiliazed");
    this.movieDetails = await this.fetchMovieDetails(950387);
    this.trailerLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.movieDetails.trailerLink);
    console.log("movie details", this.movieDetails);
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

}
