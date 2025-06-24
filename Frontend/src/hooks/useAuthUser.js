import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const { data: authUser, isLoading, error, refetch } = useQuery({
    queryKey: ["auth"],
    queryFn: getAuthUser,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
    refetchOnWindowFocus: true,
  });

  return {
    authUser: authUser?.user, // Extract user data from response
    isLoading,
    error,
    isAuthenticated: !!authUser?.success,
    refetch,
  };
};

export default useAuthUser;
