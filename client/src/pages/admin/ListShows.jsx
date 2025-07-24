import React, { useState, useEffect } from 'react'
import { dummyShowsData } from '../../assets/assets'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { dateFormate } from '../../lib/dateFormate'

const ListShows = () => {
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const currency = import.meta.env.VITE_CURRENCY;

  const getAllShows = async() => {
    try{
      setShows([
        {
          movie: dummyShowsData[0],
          showDateTime: "2025-07-24T01:00:00.000Z",
          showPrice: 59,
          occupiedSeats: {
            A1: "user_1",
            B1: "user_2",
            C1: "user_3",
          },
        },
        {
          movie: dummyShowsData[0],
          showDateTime: "2025-07-24T01:00:00.000Z",
          showPrice: 59,
          occupiedSeats: {
            A1: "user_1",
            B1: "user_2",
            C1: "user_3",
          },
        },
      ]);
      setLoading(false)
    }catch(error){
        console.log(error)
    }
  }

  useEffect(() => {
    getAllShows()
  },[])
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
            {
              shows.map((show, index) => (
                <tr key={index} className="border-b border-primary/10 bg-primary/5 even:bg-primary/15">
                    <td className="p-2 min-w-45">{show.movie.title}</td>
                    <td className="p-2">{dateFormate(show.showDateTime)}</td>
                    <td className="p-2">{Object.keys(show.occupiedSeats).length}</td>
                    <td className="p-2">{currency} {Object.keys(show.occupiedSeats).length * show.showPrice}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading />
  );
}

export default ListShows