import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MoviesSearchService } from '../../services/movies-search/movies-search.service';

@Component({
  selector: 'app-search-result',
  imports: [],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.css'
})
export class SearchResultComponent implements OnChanges {

  @Input("searchText") searchText: any;
    movieData: any = [];
    movieSearch: any = new MoviesSearchService();
    uuid: any = "";
    genreListBasisMood: any = {
      "feelGood": '35,18,14,10749',
      "actionFix": '10752,27,80,28',
      "mindBenders": '80,9648,878,53'
    }
  
    constructor() { }

    async ngOnChanges(changes: SimpleChanges){
      if(changes["searchText"] && changes["searchText"].currentValue){
        await this.fetchData(this.searchText);
      }
    }
  
    async fetchData(searchText: any){
      this.movieData = await this.movieSearch.fetchMoviePlayedByPersonById(searchText);
    }
  
    openModal(id: any){
      this.uuid = id;
    }

}
