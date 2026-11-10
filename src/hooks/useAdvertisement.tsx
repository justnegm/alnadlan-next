import { useQuery } from "@tanstack/react-query"
import { getAdvertisements } from "@/server/main"

const useAdvertisement = (adNumber: number) => {
    const { data: ads, isLoading, error } = useQuery({
        queryKey: ["advertisements"],
        queryFn: () => getAdvertisements(),
        staleTime: 1000 * 60 * 5,
    });

    const ad = ads?.find((ad: any) => ad?.ad_number === adNumber);

    return { ad, isLoading, error };
}

export default useAdvertisement;
