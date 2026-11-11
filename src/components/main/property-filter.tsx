"use client";

import { Input } from '../ui/input'
import Reveal from '../ui/reveal'
import { getAreasAndCities, getTypes, getCities, getAllCities } from '@/server/main'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Slider } from '../ui/slider'

import SearchableSelect from '../ui/searchable-select'
import { contractTypes } from '@/lib/helpers'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { ChevronsUpDown } from 'lucide-react'
import { useT } from "@/i18n/useT";

import { useSearchParams } from 'next/navigation'

interface PropertyFilterProps {
    title?: string;
    text?: string;
    handleFilters: (filters: any) => void;
    currentFilters?: any
}

const PropertyFilter = ({ title, text, handleFilters, currentFilters }: PropertyFilterProps) => {
  const lang_1 = useT();
    const searchParams = useSearchParams();
    const emptyFilters = {
        property_type: "",
        area: "",
        city: "",
        contract_type: "",
        price_from: "",
        price_to: "",
        query: ""
    };
    const [filters, setFilters] = useState(emptyFilters)

    const { data: types } = useQuery({
        queryKey: ["types"],
        queryFn: () => getTypes(),
    });

    const { data: areasAndCities } = useQuery({
        queryKey: ["areas-and-cities"],
        queryFn: () => getAreasAndCities(),
    });

    const [cityName, setCityName] = useState("");
    const [searchVal, setSearchVal] = useState("");
    const [isPricePopoverOpen, setIsPricePopoverOpen] = useState(false);

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
                } catch {
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
        const hasQueryParams = searchParams.toString() !== "";
        if (hasQueryParams) {
            handleFilters(emptyFilters);
        }
    };

    const hasActiveFilters = Object.values(filters).some(
        (value) => value !== "" && value !== null && value !== undefined
    );

    return (
        <div className="max-w-3xl w-[90%] mx-auto flex flex-col justify-center align-center text-center gap-4">
            {title && <Reveal><h3 className="text-3xl font-bold text-white">{title}</h3></Reveal>}
            {text && <Reveal delay={0.1}><p className="lg:text-lg text-sm text-white">{text}</p></Reveal>}

            <div className="grid md:grid-cols-4 grid-cols-2 lg:grid-cols-5 gap-4">
                <SearchableSelect
                    placeholder={lang_1.filters.propertyType}
                    data={types?.results || types || []}
                    onChange={(value: any) => setFilters({ ...filters, property_type: value })}
                    value={filters.property_type}
                    grouped={true}
                    groupKey="property_types"
                    multi={true}
                />
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
                    onSearchChange={(value: any) => { setSearchVal(value); setFilters({ ...filters, city: "" }); }}
                    shouldFilter={!!filters.area && filters.area !== "all"}
                />
                <SearchableSelect
                    placeholder={lang_1.filters.contractType}
                    data={contractTypes(lang_1)}
                    onChange={(value: any) => { setFilters({ ...filters, contract_type: value }); }}
                    value={filters.contract_type}
                />
                <div className='lg:col-span-1 md:col-span-4 col-span-2'>
                    <Popover open={isPricePopoverOpen} onOpenChange={setIsPricePopoverOpen}>
                        <PopoverTrigger asChild>
                            <div>
                                <Button variant="outline" className="w-full justify-between font-normal">
                                    <span className="truncate">
                                        {filters.price_from || filters.price_to
                                            ? `${filters.price_from ? Number(filters.price_from).toLocaleString() : 0} ₪ - ${filters.price_to ? Number(filters.price_to).toLocaleString() : '20,000,000+'} ₪`
                                            : lang_1.filters.price}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent align='start' className="w-fit flex-col gap-4 p-4 lg:min-w-[300px] bg-white z-50">
                            <p className="text-sm font-medium mb-1">{lang_1.filters.selectPriceRange}</p>



                            <div className="flex lg:flex-row flex-col items-center gap-2">
                                <div className="relative w-full">
                                    <Input
                                        type="text"
                                        placeholder={lang_1.filters.from}
                                        className="h-8 text-xs text-center px-6"
                                        value={filters.price_from ? Number(filters.price_from).toLocaleString() : ""}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setFilters({ ...filters, price_from: val });
                                        }}
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium">₪</span>
                                </div>
                                <span className="text-zinc-500 hidden lg:block">-</span>
                                <div className="relative w-full">
                                    <Input
                                        type="text"
                                        placeholder={lang_1.filters.to}
                                        className="h-8 text-xs text-center px-6"
                                        value={filters.price_to ? Number(filters.price_to).toLocaleString() : ""}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setFilters({ ...filters, price_to: val });
                                        }}
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium">₪</span>
                                </div>
                            </div>
                            <div className="px-2 pt-2 pb-4">
                                <Slider
                                    min={0}
                                    max={20000000}
                                    step={100000}
                                    dir="rtl"
                                    value={[
                                        filters.price_from ? Number(filters.price_from) : 0,
                                        filters.price_to ? Number(filters.price_to) : 20000000
                                    ]}
                                    onValueChange={(values) => {
                                        setFilters({
                                            ...filters,
                                            price_from: values[0] === 0 ? "" : String(values[0]),
                                            price_to: values[1] === 20000000 ? "" : String(values[1])
                                        })
                                    }}
                                />
                            </div>
                            <Button
                                onClick={() => setIsPricePopoverOpen(false)}
                                className="w-full bg-[#A97A36] text-white hover:opacity-75 transition-opacity"
                            >
                                {lang_1.filters.ok}
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="w-full bg-white rounded-xl overflow-hidden relative flex">
                <Input
                    onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                    value={filters?.query}
                    placeholder={lang_1.filters.discoverProperty}
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

export default PropertyFilter