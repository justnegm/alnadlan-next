"use client";

import bgAsset from '@/assets/placeholder.webp'
import Advertisement from "@/components/ui/advertisement"
import { useSearchParams } from 'next/navigation'
import { isInitialListState, type ListInitialData } from '@/lib/list-initial'
import SpecialPropertyCard from "@/components/ui/special-property-card"
import { getProjects } from "@/server/main"
import { useQuery } from "@tanstack/react-query"
import Loader from "@/components/ui/loader"
import Error from "../error"
import { useState } from "react"
import ListPagination from "@/components/main/pagination"
import PropertyFilter from "@/components/main/property-filter"
import useFilterNavigation from '@/hooks/useFilterNavigation'
import NoData from '@/components/ui/no-data'
import { useT } from "@/i18n/useT";
import { getProjectsMedia } from '@/server/media'

const bg = (bgAsset as any)?.src ?? (bgAsset as any);

const Projects = ({ initialData }: { initialData?: ListInitialData }) => {
  const lang_1 = useT();
    const searchParams = useSearchParams();
    const { handleFilters } = useFilterNavigation();

    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        property_type: searchParams.get("property_type"),
        area: searchParams.get("area"),
        city: searchParams.get("city"),
        contract_type: searchParams.get("contract_type"),
        property_price: searchParams.get("property_price"),
        query: searchParams.get("query"),
    });


    const { data, isPending, error } = useQuery({
        queryKey: ["projects", page, filters],
        queryFn: () => getProjects(page, filters),
        initialData: isInitialListState(page, filters, initialData?.filters) ? (initialData?.list ?? undefined) : undefined,
    });

    const { data: media } = useQuery({
        queryKey: ["projects-media"],
        queryFn: () => getProjectsMedia(),
        initialData: initialData?.media ?? undefined,
    });

    const handlePropertiesFilters = (filters: any) => {
        setFilters(filters);
        handleFilters(filters, "/projects");
        setPage(1);
    }


    if (isPending) return <Loader />
    if (error) return <Error />


    return (
        <section className="mt-20 flex flex-col gap-20">
            <div className="min-h-[50vh] bg-no-repeat bg-top bg-cover flex justify-center items-center" style={{ backgroundImage: `url(${media?.image ?? bg})` }}>
                <PropertyFilter handleFilters={handlePropertiesFilters} currentFilters={filters} title={lang_1.sections.underConstruction} />
            </div>
            <div className="lg:w-full flex flex-col gap-8">
                <h3 className="max-w-400 w-[90%] mx-auto font-bold lg:text-2xl text-xl">{lang_1.sections.latest}</h3>
                {data?.results?.length > 0 && <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-4 ">
                    {data?.results?.slice(0, 8).map((item: any) => (
                        <SpecialPropertyCard grid project data={item} key={item?.id} />
                    ))}
                </div>}
                {data?.results?.length === 0 && <NoData />}

                <Advertisement ad={media?.advertisement} className="lg:w-full h-75 bg-no-repeat bg-top bg-cover" />
                {data?.results?.length > 8 && <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-4 ">
                    {data?.results?.slice(8, data?.results?.length).map((item: any) => (
                        <SpecialPropertyCard grid project data={item} key={item?.id} />
                    ))}
                </div>}
                {data?.results?.length === 0 && <NoData />}

                <ListPagination
                    page={page}
                    setPage={setPage}
                    count={data?.count}
                />

            </div>
        </section>
    )
}

export default Projects