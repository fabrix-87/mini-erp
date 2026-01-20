import { getCountries } from "@/services/client/country";
import { CountryQueryInput } from "@/types/country";
import { useQuery } from "@tanstack/react-query";


export function useCountries(
  params: CountryQueryInput = {
    page: 1,
    limit: 20,
  }
){
    return useQuery({
        queryKey: ['countries', params],
        queryFn: () => getCountries(params)
    })
}