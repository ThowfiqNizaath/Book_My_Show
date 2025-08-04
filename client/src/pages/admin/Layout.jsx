import React, { useEffect } from 'react'
import Header from '../../components/admin/Header'
import Sidebar from '../../components/admin/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/appContext'
import Loading from '../../components/Loading'


const Layout = () => {
  const {isAdmin, fetchIsAdmin} = useAppContext();

  useEffect(() => {
    fetchIsAdmin();
  },[])

  return isAdmin ? (
    <>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className=" flex-1 px-4 md:px-10 py-10 h-[calc(100vh-64px)] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  ) : <Loading />
}

export default Layout