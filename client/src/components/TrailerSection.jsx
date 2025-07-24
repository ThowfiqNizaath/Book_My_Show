import { dummyTrailers } from '../assets/assets'
import { useState } from 'react'
import BlurCirle from './BlurCirle'
import ReactPlayer from 'react-player'
import {PlayCircleIcon} from "lucide-react"

const TrailerSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
      <p className="text-gray-300 font-medium text-lg max-w-[960px]">
        Trailers
      </p>

      <div className="relative mt-6">
        <BlurCirle right="-100px" top="-100px" />
        <ReactPlayer src={currentTrailer.videoUrl} controls= {true} width="960px" height="540px" className="max-w-full mx-auto"/>
      </div>

      <div className="grid grid-cols-4 md:gap-8 mt-8 gap-4 max-w-3xl mx-auto group">
        {
          dummyTrailers.map((trailer) => (
            <div key={trailer.image} onClick= {() => setCurrentTrailer(trailer)}
             className="relative hover:-translate-y-1 group-hover:not-hover:opacity-50 transition duration-300 max-md:h-60 md:max-h-60 border border-white/30 cursor-pointer group">
              <img src={trailer.image} alt="trailer" className="rounded-lg w-full h-full object-cover brightness-75 group-hover:brightness-100" />
              <PlayCircleIcon strokeWidth={1.5} className="absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2"/>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default TrailerSection