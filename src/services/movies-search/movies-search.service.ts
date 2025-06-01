import { Injectable } from '@angular/core';
import axios, { AxiosRequestConfig } from 'axios';
import { commonDetails, environment, urlElement } from '../../constants/constants';
import * as _ from 'lodash';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class MoviesSearchService {
  axiosConfig: AxiosRequestConfig = commonDetails.axiosConfig;
  movieDetails: any = {};
  castSet: any = [];
  recomendationSet: any = [];
  searchResultMovieNameorPerson: any = {};
  movieByGenreList: any = [];
  constructor() { }

  async fetchMovieDetails(uuid: any = ""): Promise<any> {
    this.movieDetails = {};
    this.movieDetails = await this.fetchDetailsById(uuid);
    this.movieDetails = await this.fetchTrailerById(uuid);
    this.movieDetails = await this.fetchCastById(uuid);
    this.movieDetails = await this.fetchRecommendtionById(uuid);

    return this.movieDetails;
  }

  async fetchDetailsById(uuid: any = ""): Promise<any> {
    let url = `${urlElement.movieBase}/${uuid}?api_key=${environment.tmdbApiKey}`;
    return axios.get(url, this.axiosConfig)
      .then((resp: any) => {
        if (resp && resp.data && !_.isEmpty(resp.data)) {
          this.movieDetails = {
            uuid: resp.data.id,
            title: resp.data.original_title,
            description: resp.data.overview,
            year: moment(resp.data.release_date, "YYYY-MM-DD").year(),
            posterImage: environment.imageBaseUrl + resp.data.poster_path,
            rating: resp.data.vote_average.toFixed(1),
            genre: resp.data.genre_ids,
            duration: String(resp.data.runtime) + ' min',
          }
          return this.movieDetails;
        } else {
          return this.movieDetails;
        }
      })
      .catch((err: any) => { return err });
  }
  async fetchTrailerById(uuid: any = ""): Promise<any> {
    let url = `${urlElement.movieBase}/${uuid}/${urlElement.movieTrailer}?api_key=${environment.tmdbApiKey}`;
    return axios.get(url, this.axiosConfig)
      .then((resp: any) => {
        if (resp && resp.data && !_.isEmpty(resp.data) && resp.data.results && !_.isEmpty(resp.data.results)) {
          let trailerElement = _.find(resp.data.results, {type: 'Trailer', site: 'YouTube', official: true})
          if(trailerElement && !_.isEmpty(trailerElement)){
            this.movieDetails = {
              ...this.movieDetails,
              trailerId: trailerElement.id,
              trailerLink: environment.youtubeBaseUrl + trailerElement.key,
              official: trailerElement.official
            }
          }
          return this.movieDetails;
        } else {
          return {
              ...this.movieDetails,
              trailerId: null,
              trailerLink: "",
              official: null
          }
        }
      })
      .catch((err: any) => { return err });
  }
  async fetchCastById(uuid: any = ""): Promise<any> {
    let url = `${urlElement.movieBase}/${uuid}/${urlElement.movieCast}?api_key=${environment.tmdbApiKey}`;
    return axios.get(url, this.axiosConfig)
      .then((resp: any) => {
        if (resp && resp.data && !_.isEmpty(resp.data) && resp.data.cast && !_.isEmpty(resp.data.cast)) {
          this.castSet = [];
          resp.data.cast.forEach((item: any) => {
            if(this.castSet.length <= 5 && item.order <= 5){
              this.castSet.push({
                uuid: item.id,
                castId: item.cast_id,
                creditId: item.credit_id,
                name: item.original_name,
                characterName: item.character,
                personImage: environment.imageBaseUrl + item.profile_path,
                knowFor: item.known_for_department,
              })
            }
          })
          return {...this.movieDetails, cast: this.castSet};
        } else {
          return this.movieDetails;
        }
      })
      .catch((err: any) => { return err });
  }
  async fetchRecommendtionById(uuid: any = ""): Promise<any> {
    let url = `${urlElement.movieBase}/${uuid}/${urlElement.movieRecom}?api_key=${environment.tmdbApiKey}&page=1`;
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
          return {...this.movieDetails, recomendations: this.recomendationSet};
        } else {
          return this.movieDetails;
        }
      })
      .catch((err: any) => { return err });
  }

  async searchByMovieNameorPerson(searchText: any = ""): Promise<any> {
    let url = `${urlElement.searchMulti}?api_key=${environment.tmdbApiKey}&query=${searchText}`;
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
              this.searchResultMovieNameorPerson.person.push({
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

  async fetchByGenre(searchText: any = ""): Promise<any> {
    let url = `${urlElement.discoverMovie}?api_key=${environment.tmdbApiKey}&${urlElement.withgenre}=${searchText}&page=1`;
    return axios.get(url, this.axiosConfig)
      .then((resp: any) => {
        this.movieByGenreList = []
        if (resp && resp.data && !_.isEmpty(resp.data) && resp.data.results && !_.isEmpty(resp.data.results)) {
          resp.data.results.forEach((item: any) => {
            this.movieByGenreList.push({
                  uuid: item.id,
                  title: item.original_title,
                  year: moment(item.release_date, "YYYY-MM-DD").year(),
                  posterImage: environment.imageBaseUrl + item.poster_path,
                  rating: item.vote_average.toFixed(1),
                  genre: item.genre_ids
            })
          })
        }
        return this.movieByGenreList;
      }).catch((err: any) => { return err });
  }
  
}
