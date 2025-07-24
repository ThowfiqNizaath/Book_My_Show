import React, { useEffect, useState } from 'react'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import BlurCirle from '../components/BlurCirle';
import timeFormate from '../lib/timeFormate';
import DateSelection from '../components/DateSelection';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';

const MovieDetails = () => {
  const {id} = useParams();
  const [show, setShow] = useState(null)
  const navigate = useNavigate()

  const getShow = async() => {
    const show = dummyShowsData.find(mov => mov._id === id);
    if(show){
      setShow({
        movie: show,
        dateTime: dummyDateTimeData,
      });
    }
  }

  useEffect(() => {
    getShow()
   } , [id])

  return show ? (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={show.movie.poster_path}
          alt="poster"
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCirle top="-100px" left="-100px" />
          <p className="text-primary">English</p>
          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average.toFixed(1)} User Rating
          </div>
          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-lg text-justify">
            {show.movie.overview}
          </p>

          <p className="flex items-center gap-2">
            {timeFormate(show.movie.runtime)}
            <span className="w-[8px] h-[8px] bg-gray-200 rounded-full"></span>
            {show.movie.genres.map((genre) => genre.name).join(", ")}
            <span className="w-[8px] h-[8px] bg-gray-200 rounded-full"></span>
            {show.movie.release_date.split("-")[0]}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm cursor-pointer bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium active:scale-95">
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>
            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              Buy Tickets
            </a>
            <button className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95">
              <Heart className={`w-5 h-5`} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-xl font-medium mt-20">Your Favorite Cast</p>
      <div className="flex items-center  gap-4 overflow-x-auto no-scrollbar mt-8 pb-4 px-4">
        {show.movie.casts.slice(0, 12).map((cast, index) => (
          <div key={index}  className="flex flex-col flex-shrink-0 items-center text-center">
            <img
              src={cast.profile_path}
              alt="cast-photo"
              className="rounded-full h-20 md:h-20 aspect-square object-cover object-center"
            />
            <p className="font-medium text-sm mt-2">{cast.name}</p>
          </div>
        ))}
      </div>

      <DateSelection dateTime={show.dateTime} id={show.movie._id}/>

      <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {
          dummyShowsData.slice(0,4).map((movie, index) => (
            <MovieCard key={index} movie={movie} />
          ))
        }
      </div>
      <div className="flex justify-center mt-20">
        <button className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition-all rounded-md font-medium cursor-pointer'
        onClick={() => {
          navigate("/movies");
          scrollTo(0,0)
        }}
        >
          Show more
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
}

export default MovieDetails