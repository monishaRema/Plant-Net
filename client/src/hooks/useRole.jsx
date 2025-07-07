import useAxiosSecure from './useAxiosSecure'
import useAuth from './useAuth'
// import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

const useRole = () => {
  const { user, loading } = useAuth()
  const [role, setRole] = useState(null)
  const [isRoleLoading, setIsRoleLoading] = useState(true)
  const axiosSecure = useAxiosSecure()

//   const { data: role, isLoading: isRoleLoading } = useQuery({
//     queryKey: ['role', user?.email],
//     enabled: !loading && !!user?.email,
//     queryFn: async () => {
//       const { data } = await axiosSecure(`/user/role/${user?.email}`)
//       return data
//     },
//   })

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return setIsRoleLoading(false)
      try {
        const { data } = await axiosSecure(
          `${import.meta.env.VITE_API_URL}/user/role/${user?.email}`
        )

       
        setRole(data?.role)
      } catch (err) {
        console.log(err)
      } finally {
        setIsRoleLoading(false)
      }
    }
    fetchUserRole()
  }, [user, axiosSecure])


  return [role, isRoleLoading]
}

export default useRole