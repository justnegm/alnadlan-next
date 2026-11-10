"use client";

import { isInitialListState, type ListInitialData } from "@/lib/list-initial"
import bgAsset from '@/assets/placeholder.webp'
import PropertyCard from '@/components/ui/property-card'
import Advertisement from "@/components/ui/advertisement"
import { useSearchParams } from 'next/navigation'
import { getBrokers } from "@/server/main"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import Loader from "@/components/ui/loader"
import ListPagination from "@/components/main/pagination"
import useFilterNavigation from "@/hooks/useFilterNavigation"
import Error from "../error"
import PersonFilter from "@/components/main/person-filter"
import NoData from "@/components/ui/no-data"
import { lang_1 } from "@/lib/lang_1"
import { getBrokersMedia } from '@/server/media'

const bg = (bgAsset as any)?.src ?? (bgAsset as any);

const Brokers = ({ initialData }: { initialData?: ListInitialData }) => {

    const searchParams = useSearchParams();
    const { handleFilters } = useFilterNavigation();
    const [page, setPage] = useState(1);

    const [filters, setFilters] = useState({
        expertise: searchParams.get("expertise"),
        area: searchParams.get("area"),
        city: searchParams.get("city"),
        query: searchParams.get("query"),
    });

    const { data, isPending, error } = useQuery({
        queryKey: ["brokers", page, filters],
        queryFn: () => getBrokers(page, filters),
        initialData: isInitialListState(page, filters, initialData?.filters) ? (initialData?.list ?? undefined) : undefined,
    });

    const { data: media } = useQuery({
        queryKey: ["brokers-media"],
        queryFn: () => getBrokersMedia(),
        initialData: initialData?.media ?? undefined,
    });

    const handleFiltersAndSearch = (filters: any) => {
        setFilters(filters);
        handleFilters(filters, "/brokers");
        setPage(1);
    }

    if (isPending) return <Loader />
    if (error) return <Error />
    return (
        <section className="mt-20 flex flex-col gap-20">
            <div className="min-h-[50vh] bg-no-repeat bg-top bg-cover flex justify-center items-center" style={{ backgroundImage: `url(${media?.image ?? bg})` }}>
                <PersonFilter
                    title={lang_1.header.brokers}
                    currentFilters={filters}
                    handleFilters={handleFiltersAndSearch}
                />
            </div>
            <div className="w-full flex flex-col gap-8">
                <h3 className="max-w-400 w-[90%] mx-auto font-bold lg:text-2xl text-xl">{lang_1.header.brokers}</h3>
                <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-4 ">
                    {data?.results?.length > 0 && data?.results?.slice(0, 10).map((item: any) => (
                        <PropertyCard
                            key={item?.id}
                            data={item}
                            personUrl={`/brokers/${item?.slug}`}
                            person
                            grid
                        />
                    ))}
                </div>
                {data?.results?.length === 0 && <NoData />}


                <Advertisement ad={media?.advertisement} className="w-full h-75 bg-no-repeat bg-top bg-cover" />

                <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-4 ">
                    {data?.results?.length > 10 && data?.results?.slice(10, data?.results?.length).map((item: any) => (
                        <PropertyCard
                            key={item?.id}
                            data={item}
                            personUrl={`/brokers/${item?.slug}`}
                            person
                            grid
                        />
                    ))}
                </div>

                {data?.results?.length <= 10 && <NoData />}

                <ListPagination
                    page={page}
                    setPage={setPage}
                    count={data?.count}
                />
            </div>
        </section>
    )
}

export default Brokers