import { ArrowRight } from 'lucide-react'
import React from 'react'
import {useNavigate} from "react-router-dom"
import BlurCirle from './BlurCirle'
import { dummyShowsData } from '../assets/assets'
import MovieCard from './MovieCard'
import { useAppContext } from '../context/appContext'

const FeaturedSection = () => {
  const {shows, image_base_url} = useAppContext()
  const navigate = useNavigate()
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
        <div className="relative flex items-center justify-between pt-20  pb-10">
            <p className='text-gray-300 font-medium text-lg'>Now Showing</p>
            <button className="flex gap-2 items-center group text-sm text-gray-300 cursor-pointer"
            onClick={() => navigate("/movies")}
            >
                View All
                <ArrowRight className="group-hover:translate-x-0.5 transition w-4.5 h-4.5"/>
            </button>

            <BlurCirle top="0" right="-80px"/>
        </div>
        <div className="flex gap-8 flex-wrap justify-center lg:justify-start">
          {
           shows.slice(0,4).map(show => (
              <MovieCard key={show._id} movie={show}/>
            ))
          }
        </div>
        <div className="flex justify-center mt-20">
          <button 
           onClick={() => {
            navigate("/movies");
            scrollTo(0,0)
           }}
           className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull cursor-pointer transition 
          rounded-md">
            Show more
          </button>
        </div>
    </div>
  )
}

export default FeaturedSection