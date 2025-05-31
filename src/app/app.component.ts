import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../sections/header/header.component';
import { MoodComponent } from '../sections/mood/mood.component';
import { SearchComponent } from "../sections/search/search.component";
import { PopularMoviesComponent } from "../sections/popular-movies/popular-movies.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, MoodComponent, SearchComponent, PopularMoviesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Assignment';

  // Sample movie data
  ngOnInit(): void {
      console.log("");
  }
}
