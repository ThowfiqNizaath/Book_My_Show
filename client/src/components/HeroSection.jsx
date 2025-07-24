import React from 'react'
import { assets } from '../assets/assets'
import { ArrowBigLeft, ArrowRight, Calendar, ClockIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
    const navigate = useNavigate();
  return (
    <div className="flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url('/backgroundImage.png')] h-screen bg-center bg-cover">
        <img src={assets.marvelLogo} alt="marvel-logo" className="max-h-10 lg:h-full mt-20"/>

        <h1 className={`text-5xl md:text-[70px] md:leading-18 font-semibold `}>
            Guardians <br /> of the Galaxy
        </h1>

        <div className="flex gap-4 items-center text-gray-300">
            <span className="">
                Action | Adventure | Sci-Fi
            </span>
            <div className="flex items-center gap-1">
                <Calendar className="w-4.5 h-4.5"/> 2018
            </div>
            <div className="flex items-center gap-1">
                <ClockIcon className="w-4.5 h-4.5"/> 2h 8m
            </div>
        </div>
        <p className="max-w-md text-gray-300">
            In a post-apocalyptic world where cities ride on wheels and consume each other to survive, two people meet in London and try to stop a conspiracy.
        </p>
        <button
         onClick={() => navigate("/movies")}
         className="flex items-center gap-1 px-8 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer duration-200 group">
            Explore Movies 
            <ArrowRight className="group-hover:translate-x-1 transition duration-200"/>
        </button>
    </div>
  )
}

export default HeroSection
