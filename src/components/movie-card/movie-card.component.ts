import { ApplicationModule, Component } from '@angular/core';
import { PopularMoviesService } from '../../services/popular-movies/popular-movies.service';
import { CommonModule, NgForOf } from '@angular/common';

@Component({
  selector: 'app-movie-card',
  imports: [CommonModule, ApplicationModule],
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

  }

}
