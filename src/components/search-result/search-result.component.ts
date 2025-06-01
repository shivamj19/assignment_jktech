import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MoviesSearchService } from '../../services/movies-search/movies-search.service';
import { MovieDetailsModalComponent } from "../movie-details-modal/movie-details-modal.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-result',
  imports: [MovieDetailsModalComponent, CommonModule],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.css'
})
export class SearchResultComponent implements OnChanges {

  @Input("searchText") searchText: any;
  movieData: any = [];
  movieSearch: any = new MoviesSearchService();
  uuid: any = "";
  
  constructor() { }

  async ngOnChanges(changes: SimpleChanges){
    if(changes["searchText"] && changes["searchText"].currentValue){
      await this.fetchData(this.searchText);
    }
  }

  async fetchData(searchText: any){
    this.movieData = await this.movieSearch.searchByMovieNameorPerson(searchText);
  }

  openModal(id: any){
    this.uuid = id;
  }

}
