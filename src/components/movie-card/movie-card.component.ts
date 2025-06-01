import { Component } from '@angular/core';
import { PopularMoviesService } from '../../services/popular-movies/popular-movies.service';
import { CommonModule } from '@angular/common';
import { MovieDetailsModalComponent } from '../movie-details-modal/movie-details-modal.component';

@Component({
  selector: 'app-movie-card',
  imports: [CommonModule, MovieDetailsModalComponent],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.css'
})
export class MovieCardComponent {

  movieData: any = [];
  popularMovie: any = new PopularMoviesService();

  constructor() { 
    this.fetchData();
  }

  async fetchData(){
    this.movieData = await this.popularMovie.fetchPopularMovies();
  }

  openModal(id: any){
    console.log("modal opened:  ", id);
  }

}
