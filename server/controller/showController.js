import axios from "axios";
import movieModel from "../models/movieSchema.js";
import showModel from "../models/showSchema.js";
import { err } from "inngest/types";
import { inngest } from "../inngest/index.js";

export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1",
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );
    const movies = data.results;
    res.json({ success: true, movies: movies });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

export const addShow = async (req, res) => {
  try {
    const { movieId, showInput, showPrice } = req.body;
    let movie = await movieModel.findById(movieId);
    if (!movie) {
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
          {
            headers: {
              Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
          }
        ),
        axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`,
          {
            headers: {
              Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
          }
        ),
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      };
     movie = await movieModel.create(movieDetails)
    }

    const showsToCreate = [];
      showInput.forEach(show => {
        const showDate = show.date;
        show.time.forEach((time) => {
          const dateTimeString = `${showDate}T${time}`
          showsToCreate.push({
            movie: movieId,
            showDateTime: new Date(dateTimeString),
            showPrice,
            occupiedSeats: {}
          })
        })
      })

      if(showsToCreate.length > 0){
        await showModel.insertMany(showsToCreate)
      }

      await inngest.send({
        name: "app/show.added",
        data: {
          movieTitle: movie.title
        }
      })

      res.json({success: true, message: 'Show Added successfully.'})
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};


export const getShows = async(req, res) => {
  try {
      const shows = await showModel.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({showDateTime: 1})
      const uniqueShows = new Set(shows.map(show => show.movie))
      return res.json({success: true, shows: Array.from(uniqueShows)})
  } catch (error) {
      console.error(error);
      return res.json({success: false, message: error.message});
  }
}

export const getShow = async(req, res) => {
  try {
    const {movieId} = req.params;
    const shows = await showModel.find({movie: movieId, showDateTime: {$gte: new Date()}})
    const movie = await movieModel.findById(movieId)
    const dateTime = {}
    shows.map((show, index) => {
      const [date, time] = show.showDateTime.toISOString().split("T")
      if(!dateTime[date]){
        dateTime[date] = []
      }
      dateTime[date].push({time: show.showDateTime, showId: show._id})
    })
    return res.json({success: true, movie, dateTime})
  } catch (error) {
    console.error(error);
    return res.json({success: false, message: error.message})
  }
}

