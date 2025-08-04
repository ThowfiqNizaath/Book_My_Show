import React, { useState, useEffect } from 'react'
import { dummyShowsData } from '../../assets/assets'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { dateFormate } from '../../lib/dateFormate'
import toast from 'react-hot-toast'
import { useAppContext } from '../../context/appContext'

const ListShows = () => {
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loading2, setLoading2] = useState(false)
  const currency = import.meta.env.VITE_CURRENCY;
  const {axios, getToken, user} = useAppContext();

  const getAllShows = async() => {
    try{
      const { data } = await axios.get("/api/admin/all-shows", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      console.log(data)
      if(data.success){
        setShows(data.shows)
      }else{
        toast.error(data.message)
      }
      setLoading(false)
    }catch(error){
        console.log(error)
    }
  }

  const handleDeletePrev = async() => {
    setLoading2(true);
    try {
      const {data} = await axios.delete("/api/admin/delete-shows",{
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      })
      if(data.success){
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
    }
    setLoading2(false)
  }

  useEffect(() => {
    if(user){
      getAllShows();
    }
  },[user])
  return !loading ? (
    <>
      <Title text1="List" text2="Shows" />
      <div className=" max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-callapse rounded-md overflow-hidden text-wrap">
          <thead>
            <tr className="bg-primary/40 text-left text-white">
              <th className="p-2 font-medium pl-5">Movie Name</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Total Bookings</th>
              <th className="p-2 font-medium">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {shows.map((show, index) => (
              <tr
                key={index}
                className="border-b border-primary/10 bg-primary/5 even:bg-primary/15"
              >
                <td className="p-2 min-w-45">{show.movie.title}</td>
                <td className="p-2">{dateFormate(show.showDateTime)}</td>
                <td className="p-2">
                  {Object.keys(show.occupiedSeats).length}
                </td>
                <td className="p-2">
                  {currency}{" "}
                  {Object.keys(show.occupiedSeats).length * show.showPrice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button 
        onClick={handleDeletePrev}
        className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer"
        disabled={loading2}
        >
          Delete Prev Movies
        </button>
      </div>
    </>
  ) : (
    <Loading />
  );
}

export default ListShows