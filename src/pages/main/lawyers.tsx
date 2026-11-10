import bg from '@/assets/placeholder.webp'
import PropertyCard from '@/components/ui/property-card'
import Advertisement from "@/components/ui/advertisement"
import { useSearchParams } from 'react-router'
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getLawyers } from "@/server/main"
import ListPagination from "@/components/main/pagination"
import Loader from "@/components/ui/loader"
import Error from "../error"
import PersonFilter from "@/components/main/person-filter"
import useFilterNavigation from '@/hooks/useFilterNavigation'
import NoData from '@/components/ui/no-data'
import { lang_1 } from '@/lib/lang_1'
import { getLawyersMedia } from '@/server/media'

const Lawyers = () => {
    const [searchParams] = useSearchParams();
    const { handleFilters } = useFilterNavigation();
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        expertise: searchParams.get("expertise"),
        area: searchParams.get("area"),
        city: searchParams.get("city"),
        query: searchParams.get("query"),
    });

    const { data, status, error } = useQuery({
        queryKey: ["lawyers", page, filters],
        queryFn: () => getLawyers(page, filters),
    });

    const { data: media } = useQuery({
        queryKey: ["lawyers-media"],
        queryFn: () => getLawyersMedia(),
    });

    const handlePropertiesFilters = (filters: any) => {
        setFilters(filters);
        handleFilters(filters, "/lawyers");
        setPage(1);
    }

    if (status === 'pending') return <Loader />
    if (error) return <Error />
    return (
        <section className="mt-20 flex flex-col gap-20">
            <div className="min-h-[50vh] bg-no-repeat bg-top bg-cover flex justify-center items-center" style={{ backgroundImage: `url(${media?.image ?? bg})` }}>
                <PersonFilter
                    title={lang_1.sections.lawyers}
                    currentFilters={filters}
                    handleFilters={handlePropertiesFilters}
                />
            </div>
            <div className="w-full flex flex-col gap-8">
                <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-4 ">
                    {data?.results?.length > 0 && data?.results?.slice(0, 10).map((item: any) => (
                        <PropertyCard
                            key={item?.id}
                            data={item}
                            personUrl={`/lawyer/${item?.slug}`}
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
                            personUrl={`/lawyer/${item?.slug}`}
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

export default Lawyers