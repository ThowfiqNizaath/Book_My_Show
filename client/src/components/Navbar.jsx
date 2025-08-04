import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { assets } from "../assets/assets";
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from "lucide-react";
import { SignIn, useAuth, useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useAppContext } from "../context/appContext";

const Navbar = () => {
  
  const [isOpen, setIsOpen] = useState(false)
  const {user} = useUser();
  const {openSignIn} = useClerk();
  const navigate = useNavigate();
  const {sessionId} = useAuth();
  const {favoriteMovies} = useAppContext()
  //Functions
  function handleOpen(){
     setIsOpen(prev => !prev)
  }
  function scrollToTop(){
     scrollTo(0,0);
     handleOpen();
  }

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center md:justify-around py-5 max-md:px-10">
      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo} alt="logo" className="w-36 h-auto" />
      </Link>

      <div
        className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col max-md:h-screen gap-8 border max-md:justify-center
        py-3 md:flex-row items-center min-md:px-8 min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${
          isOpen ? "max-md:w-full" : "max-md:w-0"
        }`}
      >
        <XIcon
          className="min-md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={handleOpen}
        />
        <Link onClick={scrollToTop} to="/" className="text-sm">
          HOME
        </Link>
        <Link onClick={scrollToTop} to="/movies" className="text-sm">
          MOVIES
        </Link>
        <Link onClick={scrollToTop} to="/" className="text-sm">
          THEATERS
        </Link>
        <Link onClick={scrollToTop} to="/" className="text-sm">
          RELEASES
        </Link>
        {favoriteMovies.length > 0 && (
          <Link onClick={scrollToTop} to="/favorite" className="text-sm">
            FAVORITE
          </Link>
        )}
      </div>

      <div className="flex items-center gap-8">
        <SearchIcon className="max-md:hidden w-6 h-6 cursor-pointer" />
        {!user ? (
          <button
            onClick={openSignIn}
            className="bg-primary hover:bg-primary-dull cursor-pointer px-4 py-1 sm:px-7 transition rounded-full font-medium"
          >
            Login
          </button>
        ) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<TicketPlus width="15" />}
                onClick={() => {
                  navigate("/my-bookings");
                }}
              ></UserButton.Action>
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>

      <MenuIcon
        className="md:hidden max-md:ml-4 w-8 h-9 cursor-pointer"
        onClick={handleOpen}
      />
    </div>
  );
};

export default Navbar;
