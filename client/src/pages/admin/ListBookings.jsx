import React, {useState, useEffect} from 'react'
import Loading from '../../components/Loading';
import { dummyBookingData } from '../../assets/assets';
import Title from '../../components/admin/Title';
import { dateFormate } from '../../lib/dateFormate';
import { useAppContext } from '../../context/appContext';
import toast from 'react-hot-toast';

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const {axios, getToken, user, image_base_url} = useAppContext();

  const getAllBookings = async() => {
    try {
      const { data } = await axios.get("/api/admin/all-bookings", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      // console.log(data)
      if(data.success){
        setBookings(data.bookings);
      }else{
        toast.error("Failed to fetch bookings.")
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if(user){
      getAllBookings();
    }
  },[user])

  return !isLoading ? (
    <>
      <Title text1="List" text2="Bookings" />
      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md  overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/40 text-left text-white">
              <td className="p-2 font-medium pl-5">User Name</td>
              <td className="p-2 font-medium">Movie Name</td>
              <td className="p-2 font-medium">Show Time</td>
              <td className="p-2 font-medium">Seats</td>
              <td className="p-2 font-medium">Amount</td>
            </tr>
          </thead>
          <tbody>
            {bookings.map((item, index) => (
              <tr
                key={index}
                className="border-b border-primary/20 bg-primary/5 even:bg-primary/15"
              >
                <td className="p-2 min-w-45 pl-5">{item.user.name}</td>
                <td className="p-2">{item.show.movie.title}</td>
                <td className="p-2">{dateFormate(item.show.showDateTime)}</td>
                <td>
                  {Object.keys(item.bookedSeats)
                    .map((seat) => item.bookedSeats[seat])
                    .join(", ")}
                </td>
                {/* <td className="p-2">
                    {item.bookedSeats.join(", ")}
                   </td> */}
                <td className="p-2">
                  {currency} {item.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading />
  );
}

export default ListBookings