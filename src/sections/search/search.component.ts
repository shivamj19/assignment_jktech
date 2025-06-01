import { Component } from '@angular/core';
import { SearchResultComponent } from "../../components/search-result/search-result.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  imports: [SearchResultComponent, CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  searchVal: any = "";

  constructor(){ }

  setSearchText(searchText: any){
    this.searchVal = searchText;
  }

  closeMoods(){
    this.searchVal = "";
  }

}
