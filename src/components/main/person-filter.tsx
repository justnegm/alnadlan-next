"use client";

import { Input } from '../ui/input'
import { getAreasAndCities, getCities, getAllCities } from '@/server/main'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import SearchableSelect from '../ui/searchable-select'
import { experiencesInYears } from '@/lib/helpers'
import { lang_1 } from '@/lib/lang_1'

interface PersonFilterProps {
    title?: string;
    text?: string;
    handleFilters: (filters: any) => void;
    currentFilters?: any
}

const PersonFilter = ({ title, text, handleFilters, currentFilters }: PersonFilterProps) => {
    const emptyFilters = {
        expertise: "",
        area: "",
        city: "",
        query: ""
    };

    const [filters, setFilters] = useState(emptyFilters)

    const { data: areasAndCities } = useQuery({
        queryKey: ["areas-and-cities"],
        queryFn: () => getAreasAndCities(),
    });

    const [cityName, setCityName] = useState("");
    const [searchVal, setSearchVal] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setCityName(searchVal);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchVal]);

    const { data: citiesPagesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["cities", filters.area, cityName],
        queryFn: ({ pageParam = 1 }) => {
            if (!filters.area || filters.area === "all") {
                return getAllCities(pageParam, cityName);
            }
            return getCities(String(filters.area));
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage: any) => {
            if (lastPage?.next) {
                try {
                    const url = new URL(lastPage.next);
                    const page = url.searchParams.get("page");
                    return page ? Number(page) : undefined;
                } catch (e) {
                    const match = lastPage.next.match(/[?&]page=(\d+)/);
                    return match ? Number(match[1]) : undefined;
                }
            }
            return undefined;
        },
    });

    const citiesList = citiesPagesData?.pages?.flatMap((page: any) => page?.results || page || []) || [];

    useEffect(() => {
        if (currentFilters) {
            setFilters(currentFilters)
        }
    }, [JSON.stringify(currentFilters)])

    const handleClearFilters = () => {
        setFilters(emptyFilters);
        handleFilters(emptyFilters);
    };

    const hasActiveFilters = Object.values(filters).some(
        (value) => value !== "" && value !== null && value !== undefined
    );

    return (
        <div className="max-w-3xl w-[90%] mx-auto flex flex-col justify-center align-center text-center gap-4">
            {title && <h3 className="text-3xl font-bold text-white">{title}</h3>}
            {text && <p className="lg:text-lg text-sm text-white">{text}</p>}

            <div className="grid md:grid-cols-3 grid-cols-2 lg:grid-cols-3 gap-4">
                <SearchableSelect
                    placeholder={lang_1.filters.area}
                    data={areasAndCities?.results || areasAndCities || []}
                    onChange={(value: any) => {
                        setFilters({ ...filters, area: value, city: "" });
                        setSearchVal("");
                    }}
                    value={filters.area}
                />
                <SearchableSelect
                    placeholder={lang_1.filters.city}
                    data={citiesList}
                    onChange={(value: any) => { setFilters({ ...filters, city: value }); }}
                    value={filters.city}
                    onLoadMore={fetchNextPage}
                    hasMore={hasNextPage}
                    isLoadingMore={isFetchingNextPage}
                    onSearchChange={(!filters.area || filters.area === "all") ? setSearchVal : undefined}
                />
                <SearchableSelect
                    placeholder={lang_1.filters.yearsOfExperience}
                    data={experiencesInYears}
                    onChange={(value: any) => setFilters({ ...filters, expertise: value })}
                    value={filters.expertise}
                />
            </div>

            <div className="w-full bg-white rounded-xl overflow-hidden relative flex">
                <Input
                    onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                    value={filters?.query}
                    placeholder={lang_1.filters.searchPerson}
                    className={`${hasActiveFilters ? 'pe-40' : 'pe-25'} h-10 rounded-xl w-full transition-all duration-300`}
                />

                <div className="absolute top-1/2 -translate-y-1/2 left-2 flex gap-1 h-[calc(100%-8px)]">
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 flex items-center justify-center rounded-lg cursor-pointer hover:bg-zinc-300 transition-colors text-sm animate-in fade-in zoom-in duration-200"
                        >
                            {lang_1.filters.clearAll}
                        </button>
                    )}

                    <button
                        onClick={() => handleFilters(filters)}
                        className="px-6 py-2 bg-[#A97A36] flex items-center justify-center rounded-lg text-white cursor-pointer hover:opacity-75 transition-opacity text-sm"
                    >
                        {lang_1.filters.search}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PersonFilter