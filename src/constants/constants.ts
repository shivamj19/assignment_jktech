export const environment = {
    production: false,
    tmdbApiKey: '59f7b9bca39a9c7229703835cf614288',
    tmdbBaseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
    youtubeBaseUrl: 'https://www.youtube.com/embed/'
};

export const commonDetails = {
    axiosConfig: {
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OWY3YjliY2EzOWE5YzcyMjk3MDM4MzVjZjYxNDI4OCIsIm5iZiI6MTc0ODYzMjQ4Ny40MTgsInN1YiI6IjY4M2EwM2E3NGFiZGM2NGQyMjNkMjJjZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.H25UPqkskCEdgRH5VKDILNVTLqtgKjk2mN3QiMXqQLA",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
        }
      },
}

export const urlElement = {
    popularMovies: '/api/movie/popular',
    movieBase: '/api/movie',
    personBase: '/api/person',
    personMovies: '/movie_credits',
    movieCast: '/credits',
    movieRecom: '/recommendations',
    movieTrailer: 'videos',
    searchMulti: '/api/search/multi',
    discoverMovie: '/api/discover/movie',
    withgenre: 'with_genres'
}
export const prodUrlElement = {
    popularMovies: '/movie/popular',
    movieBase: '/movie',
    personBase: '/person',
    personMovies: '/movie_credits',
    movieCast: '/credits',
    movieRecom: '/recommendations',
    movieTrailer: 'videos',
    searchMulti: '/search/multi',
    discoverMovie: '/discover/movie',
    withgenre: 'with_genres'
}