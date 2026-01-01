import { getCountries } from "@/services/country";
import { CountryQueryParams } from "@/types/country";
import { useQuery } from "@tanstack/react-query";


export function useCountries(
  params: CountryQueryParams = {
    page: 1,
    limit: 20,
  }
){
    return useQuery({
        queryKey: ['countries', params],
        queryFn: () => getCountries(params)
    })
}