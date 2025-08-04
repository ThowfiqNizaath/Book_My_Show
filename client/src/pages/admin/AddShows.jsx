import React, { useEffect, useState } from "react";
import { dummyDateTimeData, dummyShowsData } from "../../assets/assets";
import { CheckIcon, DeleteIcon, StarIcon } from "lucide-react";
import Title from "../../components/admin/Title";
import { kConverter } from "../../lib/kConverter";
import { useAppContext } from "../../context/appContext";
import toast from "react-hot-toast";

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [addShow, setAddShow] = useState(false)
  const {axios, getToken, user, image_base_url} = useAppContext();

  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get("/api/show/now-playing", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if(data.success){
        setNowPlayingMovies(data.movies)
        // console.log(data.movies)
      }else{
        console.log(data.message)
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    // console.log(date, " " , time)
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return {
          ...prev,
          [date]: [...times, time],
        };
      }
      return prev;
    });

    setDateTimeInput("")
  };

  const handleDateTimeRemove = (date, time) => {
      setDateTimeSelection(prev => {
        const updatedDateTime = prev[date].filter(t => t !== time)
        if(updatedDateTime.length === 0){
          delete prev[date]
          return {
              ...prev
          }
        }
        return {
          ...prev,
          [date]: updatedDateTime
        }
      })
  };

  const handleSubmit = async() => {
    try{
     setAddShow(true);
     if(!selectedMovie || Object.keys(dateTimeSelection).length === 0 || !showPrice){
      return toast('Missing required fields')
     }
     const showInput = Object.entries(dateTimeSelection).map(([date, time]) => ({date,time}));
     const payload = {
       movieId: selectedMovie,
       showInput,
       showPrice: Number(showPrice)
     }

     const { data } = await axios.post("/api/show/add", payload, {
       headers: {
         Authorization: `Bearer ${await getToken()}`,
       },
     });
     if(data.success){
      toast.success(data.message);
      setSelectedMovie(null)
      setDateTimeSelection({})
      setShowPrice("")
     }else{
      toast.error(data.message)
     }
    }catch(err){
      console.log(err)
      toast.error("Error occured. Please try again later.")
    }
    setAddShow(false)
  }

  useEffect(() => {
    if(user){
      fetchNowPlayingMovies();
    }
    // return () => console.log("Unmounted")
  }, []);

  // useEffect(() => {
  //   // console.clear()
  //   console.log(dateTimeSelection);
  //   console.log(dateTimeInput);
  //   console.log(selectedMovie);
  //   console.log(showPrice);
  // }, [dateTimeSelection, dateTimeInput, selectedMovie, showPrice]);

  return (
    <>
      <Title text1="Add" text2="Show" />
      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>
      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4 w-max">
          {nowPlayingMovies.map((movie, index) => (
            <div
              key={movie.id}
              onClick={() => {
                setSelectedMovie(movie.id);
              }}
              className="relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={`${image_base_url}${movie.poster_path}`}
                  alt=""
                  className="w-full object-cover brightness-90"
                />
                <div className="absolute text-sm flex items-center justify-between p-2 bg-black/70 w-full bottom-0 left-0">
                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="h-4 w-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                  </p>
                  <p className="text-gray-400">
                    {kConverter(movie.vote_count)} Votes
                  </p>
                </div>
                {selectedMovie === movie.id && (
                  <div className="absolute top-2 right-2 flex items-center justify-center bg-primary border h-6 aspect-square">
                    <CheckIcon
                      className="h-4 w-4 aspect-square"
                      strokeWidth={4}
                    />
                  </div>
                )}
              </div>
              <div className="mt-1 px-1">
                <p className="font-medium truncate">{movie.title}</p>
                <p className="text-gray-400 text-sm">{movie.release_date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Show Price</label>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-gray-400 text-sm">{currency}</p>
          <input
            min={0}
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter show price"
            className="outline-none "
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">
          Select Date and Time
        </label>
        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
          <input
            type= "datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md cursor-pointer"
          />
          <button
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
            onClick={handleDateTimeAdd}
          >
            Add Time
          </button>
        </div>
      </div>


      {
        Object.keys(dateTimeSelection).length > 0 && (
          <div className="mt-6">
             <h2 className="mb-2">Selected Date-Time</h2>
             <ul className="space-y-3">
              {
                Object.entries(dateTimeSelection).map(([date, times]) => (
                  <li key={date}>
                    <div className="font-medium">{date}</div>
                    <div className="flex flex-wrap gap-2 mt-1 text-sm">
                      {
                        times.map((time) => (
                          <div key={time} className="border border-primary px-2 py-1 flex items-center rounded">
                            <span>{time}</span>
                            <DeleteIcon onClick={() => handleDateTimeRemove(date, time)} 
                            width={15}
                            className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"/>
                          </div>
                        ))
                      }
                    </div>
                  </li>
                ))
              }
             </ul>
          </div>
        )
      }

      <button className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer"
      onClick={handleSubmit}
      disabled={addShow}
      >Add Show</button>
    </>
  );
};

export default AddShows;
