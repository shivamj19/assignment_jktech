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
  castSet: any = [];
  recomendationSet: any = [];
  searchResultMovieNameorPerson: any = {};
  constructor() { }

  async fetchPersonDetails(uuid: any = ""): Promise<any> {
    this.personDetails = {};
    this.personDetails = await this.fetchDetailsById(uuid);
    this.personDetails = await this.fetchTrailerById(uuid);
    this.personDetails = await this.fetchCastById(uuid);
    this.personDetails = await this.fetchRecommendtionById(uuid);

    return this.personDetails;
  }

  async fetchDetailsById(uuid: any = ""): Promise<any> {
    let url = `/api${urlElement.movieBase}/${uuid}?api_key=${environment.tmdbApiKey}`;
    return axios.get(url, this.axiosConfig)
      .then((resp: any) => {
        if (resp && resp.data && !_.isEmpty(resp.data)) {
          this.personDetails = {
            uuid: resp.data.id,
            title: resp.data.original_title,
            description: resp.data.overview,
            year: moment(resp.data.release_date, "YYYY-MM-DD").year(),
            posterImage: environment.imageBaseUrl + resp.data.poster_path,
            rating: resp.data.vote_average.toFixed(1),
            genre: resp.data.genre_ids,
            duration: String(resp.data.runtime) + ' min',
          }
          return this.personDetails;
        } else {
          return this.personDetails;
        }
      })
      .catch((err: any) => { return err });
  }
  async fetchTrailerById(uuid: any = ""): Promise<any> {
    let url = `/api${urlElement.movieBase}/${uuid}/${urlElement.movieTrailer}?api_key=${environment.tmdbApiKey}`;
    return axios.get(url, this.axiosConfig)
      .then((resp: any) => {
        if (resp && resp.data && !_.isEmpty(resp.data) && resp.data.results && !_.isEmpty(resp.data.results)) {
          let trailerElement = _.find(resp.data.results, {type: 'Trailer', site: 'YouTube', official: true})
          if(trailerElement && !_.isEmpty(trailerElement)){
            this.personDetails = {
              ...this.personDetails,
              trailerId: trailerElement.id,
              trailerLink: environment.youtubeBaseUrl + trailerElement.key,
              official: trailerElement.official
            }
          }
          return this.personDetails;
        } else {
          return {
              ...this.personDetails,
              trailerId: null,
              trailerLink: "",
              official: null
          }
        }
      })
      .catch((err: any) => { return err });
  }
  async fetchCastById(uuid: any = ""): Promise<any> {
    let url = `/api${urlElement.movieBase}/${uuid}/${urlElement.movieCast}?api_key=${environment.tmdbApiKey}`;
    return axios.get(url, this.axiosConfig)
      .then((resp: any) => {
        if (resp && resp.data && !_.isEmpty(resp.data) && resp.data.cast && !_.isEmpty(resp.data.cast)) {
          this.castSet = [];
          resp.data.cast.forEach((item: any) => {
            if(this.castSet.length <= 5 && item.order <= 5){
              this.castSet.push({
                uuid: item.cast_id,
                creditId: item.credit_id,
                name: item.original_name,
                characterName: item.character,
                personImage: environment.imageBaseUrl + item.profile_path,
                knowFor: item.known_for_department,
              })
            }
          })
          return {...this.personDetails, cast: this.castSet};
        } else {
          return this.personDetails;
        }
      })
      .catch((err: any) => { return err });
  }
  async fetchRecommendtionById(uuid: any = ""): Promise<any> {
    let url = `/api${urlElement.movieBase}/${uuid}/${urlElement.movieRecom}?api_key=${environment.tmdbApiKey}&page=1`;
    return axios.get(url, this.axiosConfig)
      .then((resp: any) => {
        if (resp && resp.data && !_.isEmpty(resp.data) && resp.data.results && !_.isEmpty(resp.data.results)) {
          this.recomendationSet = [];
          resp.data.results.forEach((item: any) => {
            if(this.recomendationSet.length <= 4){
              this.recomendationSet.push({
                uuid: item.id,
                title: item.original_title,
                year: moment(item.release_date, "YYYY-MM-DD").year(),
                posterImage: environment.imageBaseUrl + item.poster_path,
                rating: item.vote_average.toFixed(1),
                genre: item.genre_ids
              })
            }
          })
          return {...this.personDetails, recomendations: this.recomendationSet};
        } else {
          return this.personDetails;
        }
      })
      .catch((err: any) => { return err });
  }

  async searchByMovieNameorPerson(searchText: any = ""): Promise<any> {
    let url = `/api${urlElement.searchMulti}?api_key=${environment.tmdbApiKey}&query=${searchText}`;
    return axios.get(url, this.axiosConfig)
      .then((resp: any) => {
        this.searchResultMovieNameorPerson = {
          person: [],
          movies: []
        };
        if (resp && resp.data && !_.isEmpty(resp.data) && resp.data.results && !_.isEmpty(resp.data.results)) {
          resp.data.results.forEach((item: any) => {
            if(item.media_type === "movie"){
              this.searchResultMovieNameorPerson.movies.push({
                  uuid: item.id,
                  title: item.original_title,
                  year: moment(item.release_date, "YYYY-MM-DD").year(),
                  posterImage: environment.imageBaseUrl + item.poster_path,
                  rating: item.vote_average.toFixed(1),
                  genre: item.genre_ids
              })
            } else if(item.media_type === "person"){
              this.searchResultMovieNameorPerson.movies.push({
                uuid: item.id,
                name: item.original_name,
                personImage: environment.imageBaseUrl + item.profile_path,
                knowFor: item.known_for_department,
              })
            }
          })
          return this.searchResultMovieNameorPerson;
        } else {
          return this.searchResultMovieNameorPerson;
        }
      })
      .catch((err: any) => { return err });
  }
  
}
