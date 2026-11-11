"use client";

import bgAsset from '@/assets/placeholder.webp'
import PropertyCard from '@/components/ui/property-card'
import Advertisement from "@/components/ui/advertisement"
import { useSearchParams } from 'next/navigation'
import { isInitialListState, type ListInitialData } from '@/lib/list-initial'
import SpecialPropertyCard from "@/components/ui/special-property-card"
import { getProperties, getSpecialProperties } from "@/server/main"
import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import Loader from "@/components/ui/loader"
import Error from "../error"
import { useState, useRef } from "react"
import { useHorizontalDragScroll } from "@/lib/helpers"
import ListPagination from "@/components/main/pagination"
import PropertyFilter from "@/components/main/property-filter"
import useFilterNavigation from '@/hooks/useFilterNavigation'
import NoData from '@/components/ui/no-data'
import { useT } from "@/i18n/useT";
import { getPropertiesMedia } from '@/server/media'

const bg = (bgAsset as any)?.src ?? (bgAsset as any);

const Properties = ({ initialData }: { initialData?: ListInitialData }) => {
  const lang_1 = useT();
    const searchParams = useSearchParams();
    const { handleFilters } = useFilterNavigation();

    const scrollRefa = useRef<HTMLDivElement>(null);
    useHorizontalDragScroll(scrollRefa);

    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        property_type: searchParams.get("property_type"),
        area: searchParams.get("area"),
        city: searchParams.get("city"),
        contract_type: searchParams.get("contract_type"),
        property_price: searchParams.get("property_price"),
        query: searchParams.get("query"),
    });



    const isInitial = isInitialListState(page, filters, initialData?.filters);
    const { data, isPending, error } = useQuery({
        queryKey: ["properties", page, filters],
        queryFn: () => getProperties(page, filters),
        initialData: isInitial ? (initialData?.list ?? undefined) : undefined,
    });
    const { data: specialPagesData, fetchNextPage: fetchNextSpecialPage, hasNextPage: hasNextSpecialPage, isFetchingNextPage: isFetchingNextSpecialPage } = useInfiniteQuery({
        queryKey: ["special-properties", filters],
        queryFn: ({ pageParam = 1 }) => getSpecialProperties(pageParam, filters),
        initialPageParam: 1,
        initialData: isInitialListState(1, filters, initialData?.filters) && initialData?.special
            ? { pages: [initialData.special], pageParams: [1] }
            : undefined,
        getNextPageParam: (lastPage: any) => {
            if (lastPage?.next) {
                try {
                    const url = new URL(lastPage.next);
                    const page = url.searchParams.get("page");
                    return page ? Number(page) : undefined;
                } catch {
                    const match = lastPage.next.match(/[?&]page=(\d+)/);
                    return match ? Number(match[1]) : undefined;
                }
            }
            return undefined;
        },
    });

    const specialPropertiesList = specialPagesData?.pages?.flatMap((page: any) => page?.results || page || []) || [];

    const { data: media } = useQuery({
        queryKey: ["properties-media"],
        queryFn: () => getPropertiesMedia(),
        initialData: initialData?.media ?? undefined,
    });

    const handlePropertiesFilters = (filters: any) => {
        setFilters(filters);
        handleFilters(filters, "/properties");
        setPage(1);
    }

    const contractType = searchParams.get("contract_type");
    const title = contractType === "1"
        ? lang_1.sections.rent
        : contractType === "2"
            ? lang_1.sections.sale
            : lang_1.sections.featuredProperties;

    if (isPending) return <Loader />
    if (error) return <Error />


    return (
        <section className="mt-20 flex flex-col gap-20">
            <div className="min-h-[50vh] bg-no-repeat bg-top bg-cover flex justify-center items-center" style={{ backgroundImage: `url(${media?.image ?? bg})` }}>
                <PropertyFilter handleFilters={handlePropertiesFilters} currentFilters={filters} title={title} />
            </div>
            <div className="lg:w-full flex flex-col gap-8">
                <h3 className="max-w-400 w-[90%] mx-auto font-bold lg:text-2xl text-xl">
                    {title}
                </h3>

                {specialPropertiesList?.length > 0 && <div className="max-w-400 w-[90%] mx-auto">
                    <div ref={scrollRefa} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 select-none cursor-grab">
                        {specialPropertiesList?.map((item: any) => (
                            <div key={item?.id} className="min-w-[280px] lg:min-w-[320px] shrink-0">
                                <SpecialPropertyCard grid={false} shorter data={item?.property_details} />
                            </div>
                        ))}
                    </div>
                    {hasNextSpecialPage && (
                        <div className="flex justify-center mt-4">
                            <Button
                                onClick={() => fetchNextSpecialPage()}
                                disabled={isFetchingNextSpecialPage}
                                className="bg-[#A97A36] text-white hover:opacity-75 rounded-xl px-8"
                            >
                                {isFetchingNextSpecialPage ? lang_1.propertyForm.adding : lang_1.sections.showMore}
                            </Button>
                        </div>
                    )}
                </div>}
                {specialPropertiesList?.length === 0 && <NoData />}

                <Advertisement ad={media?.advertisement} className="lg:w-full h-75 bg-no-repeat bg-top bg-cover" />
                <h3 className="max-w-400 w-[90%] mx-auto font-bold lg:text-2xl text-xl">{lang_1.sections.latestProperties}</h3>
                {data?.results?.length > 0 && <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-4 ">
                    {data?.results?.map((item: any) => (
                        <PropertyCard grid key={item?.id} data={item} />
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

export default Properties