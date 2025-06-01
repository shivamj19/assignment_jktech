import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MoviesSearchService } from '../../services/movies-search/movies-search.service';
import { MovieDetailsModalComponent } from "../movie-details-modal/movie-details-modal.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mood-finds',
  imports: [MovieDetailsModalComponent, CommonModule],
  templateUrl: './mood-finds.component.html',
  styleUrl: './mood-finds.component.css'
})
export class MoodFindsComponent implements OnChanges{

    @Input("moodType") moodType: any;
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
      if(changes["moodType"] && changes["moodType"].currentValue){
        await this.fetchData(this.genreListBasisMood[this.moodType]);
      }
    }
  
    async fetchData(genre: any){
      this.movieData = await this.movieSearch.fetchByGenre(genre);
    }
  
    openModal(id: any){
      this.uuid = id;
    }
}
