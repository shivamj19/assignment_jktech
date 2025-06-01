import { Injectable } from '@angular/core';
import axios, { AxiosRequestConfig } from 'axios';
import { commonDetails, environment, urlElement } from '../../constants/constants';
import * as _ from 'lodash';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class PersonSearchService {
  axiosConfig: AxiosRequestConfig = commonDetails.axiosConfig;
  personDetails: any = {};
  movieSet: any = [];
  constructor() { }

  async fetchPersonDetails(uuid: any = ""): Promise<any> {
    this.personDetails = {};
    this.personDetails = await this.fetchDetailsById(uuid);
    this.personDetails = await this.fetchMoviePlayedByPersonById(uuid);

    return this.personDetails;
  }

  async fetchDetailsById(uuid: any = ""): Promise<any> {
    let url = `${urlElement.personBase}/${uuid}?api_key=${environment.tmdbApiKey}`;
    return axios.get(url, this.axiosConfig)
      .then((resp: any) => {
        if (resp && resp.data && !_.isEmpty(resp.data)) {
          this.personDetails = {
            uuid: resp.data.id,
            name: resp.data.name,
            description: resp.data.biography,
            profileImage: environment.imageBaseUrl + resp.data.profile_path,
          }
          return this.personDetails;
        } else {
          return this.personDetails;
        }
      })
      .catch((err: any) => { return err });
  }
  async fetchMoviePlayedByPersonById(uuid: any = ""): Promise<any> {
    let url = `${urlElement.personBase}/${uuid}/${urlElement.personMovies}?api_key=${environment.tmdbApiKey}`;
    return axios.get(url, this.axiosConfig)
      .then((resp: any) => {
        if (resp && resp.data && !_.isEmpty(resp.data) && resp.data.cast && !_.isEmpty(resp.data.cast)) {
          this.movieSet = [];
          resp.data.cast.forEach((item: any) => {
              this.movieSet.push({
                uuid: item.id,
                title: item.original_title,
                year: moment(item.release_date, "YYYY-MM-DD").year(),
                posterImage: environment.imageBaseUrl + item.poster_path,
                rating: item.vote_average.toFixed(1),
                characterPlayed: item.character,
                genre: item.genre_ids, 
                order: item.order
              })
          })
          this.movieSet = _.sortBy(this.movieSet, ['order']);
          return {...this.personDetails, movies: this.movieSet};
        } else {
          return this.personDetails;
        }
      })
      .catch((err: any) => { return err });
  }
  
}
