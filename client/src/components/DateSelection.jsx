import React, { useState } from 'react'
import BlurCirle from './BlurCirle'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DateSelection = ({dateTime, id}) => {
    const [select, setSelect] = useState(null);
    const navigate = useNavigate();

    const handleBookShow = () => {
        if(!select){
            return toast.error("Please select a date")
        }
        navigate(`/movies/${id}/${select}`)
        scrollTo(0,0)
    }
  return (
    <div id="dateSelect" className="pt-30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
        <BlurCirle top="-100px" left="-100px" />
        <BlurCirle bottom="-100px" right="0" />
        <div>
          <p className="text-lg font-semibold">Choose Date</p>
          <div className="flex items-center gap-6 text-sm mt-5 ">
            <ChevronLeftIcon width={28} />
            <span className="grid grid-cols-3 md:flex flex-wrap gap-4">
              {Object.keys(dateTime).map((date) => (
                <button
                  key={date}
                  className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer ${select === date ? "bg-primary text-white": "border border-primary/7-"}`}
                  onClick={() => setSelect(date)}
                >
                  <span>{new Date(date).getDate()}</span>
                  <span>
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </span>
                </button>
              ))}
            </span>
            <ChevronRightIcon width={28} />
          </div>
        </div>
        <button
          onClick={handleBookShow}
          className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

export default DateSelection