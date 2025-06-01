import { Injectable } from '@angular/core';
import axios from 'axios';
import { commonDetails, environment, prodUrlElement, urlElement } from '../../constants/constants';
import * as _ from 'lodash';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class PopularMoviesService {
  popularSet: any[] = [];
  constructor() { }

  async fetchPopularMovies(body: any = {}): Promise<any> {
    let url = environment.tmdbBaseUrl + prodUrlElement.popularMovies + '?api_key=' + environment.tmdbApiKey + '&page=1';
    return axios.get(url, commonDetails.axiosConfig)
      .then((resp: any) => {
        if (resp && resp.data && !_.isEmpty(resp.data) && resp.data.results && !_.isEmpty(resp.data.results)) {
          this.popularSet = [];
          resp.data.results.forEach((item: any) => {
            if(this.popularSet.length <= 5){
              this.popularSet.push({
                uuid: item.id,
                title: item.original_title,
                year: moment(item.release_date, "YYYY-MM-DD").year(),
                posterImage: environment.imageBaseUrl + item.poster_path,
                rating: item.vote_average.toFixed(1),
                genre: item.genre_ids
              })
            }
          })
          return this.popularSet;
        } else {
          return resp.data;
        }
      })
      .catch((err: any) => { return err });
  }

}
