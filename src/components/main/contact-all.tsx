"use client";

import { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { useAuth } from '@/store/auth-slice'
import { Link } from '@/i18n/navigation'
import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query'
import { getUser, getTypes, getAreasAndCities, createLeadMessageAll, getCities, getAllCities } from '@/server/main'
import { useForm, useStore } from '@tanstack/react-form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import SearchableSelect from '../ui/searchable-select'
import { contractTypes, contactAllSchema } from '@/lib/helpers'
import { Field as UIField, FieldLabel, FieldDescription } from '../ui/field'
import { toast } from 'sonner'
import { Spinner } from '../ui/spinner'
import { cn } from '@/lib/utils'
import { ChevronsUpDown, MessageCirclePlus } from 'lucide-react'
import { lang_1 } from '@/lib/lang_1'
import { useWindowSize } from '@/hooks/useWindowSize'
import { Slider } from '../ui/slider'

const ContactAll = () => {
    const { isAuth } = useAuth((state) => state)
    const [open, setOpen] = useState(false);
    const { width } = useWindowSize();
    const { data: user } = useQuery({
        queryKey: ["profile"],
        queryFn: () => getUser(),
        enabled: isAuth
    });

    const { data: types } = useQuery({
        queryKey: ["types"],
        queryFn: () => getTypes(),
        enabled: open
    });

    const { data: areasAndCities } = useQuery({
        queryKey: ["areas-and-cities"],
        queryFn: () => getAreasAndCities(),
        enabled: open
    });


    const { mutate, status } = useMutation({
        mutationFn: (body: any) => createLeadMessageAll(body),
        onSuccess: () => {
            toast.success(lang_1.contact.messageSentSuccess);
            setOpen(false);
            form.reset();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || err?.response?.data?.detail || lang_1.contact.sendError);
        }
    });

    const form = useForm({
        defaultValues: {
            message: "",
            property_type: "",
            contract_type: "",
            area: "",
            city: "",
            property_area_from: "",
            property_area_to: "",
            price_from: "",
            price_to: "",
        },

        onSubmit: async ({ value }) => {
            if (!user?.phone || !user?.email || !user?.full_name) {
                toast.error(lang_1.contact.completeProfile);
                return;
            }
            mutate({
                ...value,
                property_type: Number(value.property_type),
                area: Number(value.area),
                city: Number(value.city),
                name: user?.full_name,
                email: user?.email,
                phone: user?.phone
            });
        }
    })

    const areaId = useStore(form.store, (state) => state.values.area);

    const [cityName, setCityName] = useState("");
    const [searchVal, setSearchVal] = useState("");
    const [isPricePopoverOpen, setIsPricePopoverOpen] = useState(false);
    const [isAreaPopoverOpen, setIsAreaPopoverOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCityName(searchVal);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchVal]);

    const { data: citiesPagesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["cities", areaId, cityName],
        queryFn: ({ pageParam = 1 }) => {
            if (!areaId || areaId === "all") {
                return getAllCities(pageParam, cityName);
            }
            return getCities(String(areaId));
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
        enabled: open
    });

    const citiesList = citiesPagesData?.pages?.flatMap((page: any) => page?.results || page || []) || [];



    return (
        <div className='fixed lg:bottom-10 lg:left-10 left-5 bottom-5 z-50'>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div>
                        <Button variant="default" className='bg-[#A97A36] border-[#A97A36] hover:opacity-75 text-white w-14 h-14 rounded-full flex items-center justify-center'>
                            {/* <Image className='w-5 h-5' src={contactIcon} alt="contact" /> */}
                            <MessageCirclePlus className='w-6! h-6! text-white' />
                        </Button>
                    </div>
                </PopoverTrigger>
                <PopoverContent align="end" side={width > 1024 ? 'right' : 'bottom'} className="lg:w-[450px] w-[270px] max-h-[80vh] overflow-y-auto flex-col gap-4 p-4 bg-white z-50">
                    <p className="text-sm font-medium mb-3">{lang_1.contact.fillPropertyDetails}</p>

                    {!isAuth ? (
                        <div className="flex flex-col gap-4 py-8 items-center text-center">
                            <p className="text-zinc-600">{lang_1.contact.loginFirst}</p>
                            <Link href="/auth">
                                <Button className="bg-[#08182D] text-white h-10 w-full">{lang_1.auth.loginVariant}</Button>
                            </Link>
                        </div>
                    ) : (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                form.handleSubmit()
                            }}
                            className="flex flex-col gap-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <form.Field
                                    name="property_type"
                                    validators={{
                                        onSubmit: ({ value }) => {
                                            const res = contactAllSchema.shape.property_type.safeParse(value)
                                            return res.success ? undefined : res.error.issues[0].message
                                        }
                                    }}
                                >
                                    {(field) => {
                                        const hasError = field.state.meta.errors.length > 0;
                                        return (
                                            <UIField>
                                                <FieldLabel>{lang_1.filters.propertyType}</FieldLabel>
                                                <div className={cn(hasError && "border border-red-500 rounded-md")}>
                                                    <SearchableSelect
                                                        data={types?.results || types || []}
                                                        grouped={true}
                                                        groupKey="property_types"
                                                        value={field.state.value}
                                                        onChange={(v) => field.handleChange(v)}
                                                        placeholder={lang_1.filters.propertyType}
                                                        multi={true}
                                                    />
                                                </div>
                                                {hasError && <FieldDescription className="text-red-500 text-xs">{field.state.meta.errors[0]}</FieldDescription>}
                                            </UIField>
                                        )
                                    }}
                                </form.Field>

                                <form.Field
                                    name="contract_type"
                                    validators={{
                                        onSubmit: ({ value }) => {
                                            const res = contactAllSchema.shape.contract_type.safeParse(value)
                                            return res.success ? undefined : res.error.issues[0].message
                                        }
                                    }}
                                >
                                    {(field) => {
                                        const hasError = field.state.meta.errors.length > 0;
                                        return (
                                            <UIField>
                                                <FieldLabel>{lang_1.filters.contractType}</FieldLabel>
                                                <div className={cn(hasError && "border border-red-500 rounded-md")}>
                                                    <SearchableSelect
                                                        data={contractTypes}
                                                        value={field.state.value}
                                                        onChange={(v) => field.handleChange(v)}
                                                        placeholder={lang_1.filters.contractType}
                                                    />
                                                </div>
                                                {hasError && <FieldDescription className="text-red-500 text-xs">{field.state.meta.errors[0]}</FieldDescription>}
                                            </UIField>
                                        )
                                    }}
                                </form.Field>

                                <form.Field
                                    name="area"
                                    validators={{
                                        onSubmit: ({ value }) => {
                                            const res = contactAllSchema.shape.area.safeParse(value)
                                            return res.success ? undefined : res.error.issues[0].message
                                        }
                                    }}
                                >
                                    {(field) => {
                                        const hasError = field.state.meta.errors.length > 0;
                                        return (
                                            <UIField>
                                                <FieldLabel>{lang_1.filters.area}</FieldLabel>
                                                <div className={cn(hasError && "border border-red-500 rounded-md")}>
                                                    <SearchableSelect
                                                        data={areasAndCities?.results || areasAndCities || []}
                                                        value={field.state.value}
                                                        onChange={(v) => {
                                                            field.handleChange(v)
                                                            form.setFieldValue("city", "")
                                                            setSearchVal("")
                                                        }}
                                                        placeholder={lang_1.filters.area}
                                                    />
                                                </div>
                                                {hasError && <FieldDescription className="text-red-500 text-xs">{field.state.meta.errors[0]}</FieldDescription>}
                                            </UIField>
                                        )
                                    }}
                                </form.Field>

                                <form.Field
                                    name="city"
                                    validators={{
                                        onSubmit: ({ value }) => {
                                            const res = contactAllSchema.shape.city.safeParse(value)
                                            return res.success ? undefined : res.error.issues[0].message
                                        }
                                    }}
                                >
                                    {(field) => {
                                        const hasError = field.state.meta.errors.length > 0;
                                        return (
                                            <UIField>
                                                <FieldLabel>{lang_1.filters.city}</FieldLabel>
                                                <div className={cn(hasError && "border border-red-500 rounded-md")}>
                                                    <SearchableSelect
                                                        data={citiesList}
                                                        value={field.state.value}
                                                        onChange={(v) => {
                                                            field.handleChange(v)
                                                        }}
                                                        placeholder={lang_1.filters.city}
                                                        onLoadMore={fetchNextPage}
                                                        hasMore={hasNextPage}
                                                        isLoadingMore={isFetchingNextPage}
                                                        onSearchChange={(!form.getFieldValue("area") || form.getFieldValue("area") === "all") ? setSearchVal : undefined}
                                                    />
                                                </div>
                                                {hasError && <FieldDescription className="text-red-500 text-xs">{field.state.meta.errors[0]}</FieldDescription>}
                                            </UIField>
                                        )
                                    }}
                                </form.Field>


                                <form.Subscribe selector={(state) => [state.values.property_area_from, state.values.property_area_to]}>
                                    {([areaFrom, areaTo]) => (
                                        <UIField>
                                            <FieldLabel>{lang_1.contact.propertyArea}</FieldLabel>
                                            <Popover open={isAreaPopoverOpen} onOpenChange={setIsAreaPopoverOpen}>
                                                <PopoverTrigger asChild>
                                                    <div>
                                                        <Button variant="outline" className={cn("w-full justify-between font-normal px-3", (!areaFrom && !areaTo) ? "text-muted-foreground" : "")}>
                                                            <span className="truncate">
                                                                {areaFrom || areaTo
                                                                    ? `${areaFrom || 0} - ${areaTo || '∞'}`
                                                                    : lang_1.contact.propertyArea}
                                                            </span>
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent align='end' side='bottom' className="w-fit flex-col gap-4 p-4 lg:min-w-[300px] bg-white z-[60]">
                                                    <p className="text-sm font-medium mb-1">{lang_1.contact.propertyArea}</p>
                                                    <div className="flex lg:flex-row flex-col items-center gap-2">
                                                        <form.Field
                                                            name="property_area_from"
                                                            validators={{
                                                                onSubmit: ({ value }) => {
                                                                    const res = contactAllSchema.shape.property_area_from.safeParse(value)
                                                                    return res.success ? undefined : res.error.issues[0].message
                                                                }
                                                            }}
                                                        >
                                                            {(field) => (
                                                                <div className="relative w-full flex flex-col gap-1">
                                                                    <div className="relative">
                                                                        <Input
                                                                            type="text"
                                                                            placeholder={lang_1.filters.from}
                                                                            className={cn("h-8 text-xs text-center px-6", field.state.meta.errors.length > 0 && "border-red-500 border")}
                                                                            value={field.state.value ? Number(field.state.value).toLocaleString() : ""}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value.replace(/\D/g, '');
                                                                                field.handleChange(val)
                                                                            }}
                                                                            onBlur={field.handleBlur}
                                                                        />
                                                                    </div>
                                                                    {field.state.meta.errors.length > 0 && (
                                                                        <span className="text-[10px] text-red-500">{field.state.meta.errors[0]}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </form.Field>
                                                        <span className="text-zinc-500 hidden lg:block">-</span>
                                                        <form.Field
                                                            name="property_area_to"
                                                            validators={{
                                                                onSubmit: ({ value }) => {
                                                                    const res = contactAllSchema.shape.property_area_to.safeParse(value)
                                                                    return res.success ? undefined : res.error.issues[0].message
                                                                }
                                                            }}
                                                        >
                                                            {(field) => (
                                                                <div className="relative w-full flex flex-col gap-1">
                                                                    <div className="relative">
                                                                        <Input
                                                                            type="text"
                                                                            placeholder={lang_1.filters.to}
                                                                            className={cn("h-8 text-xs text-center px-6", field.state.meta.errors.length > 0 && "border-red-500 border")}
                                                                            value={field.state.value ? Number(field.state.value).toLocaleString() : ""}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value.replace(/\D/g, '');
                                                                                field.handleChange(val)
                                                                            }}
                                                                            onBlur={field.handleBlur}
                                                                        />
                                                                    </div>
                                                                    {field.state.meta.errors.length > 0 && (
                                                                        <span className="text-[10px] text-red-500">{field.state.meta.errors[0]}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </form.Field>
                                                    </div>
                                                    <div className="px-2 pt-2 pb-4">
                                                        <Slider
                                                            min={0}
                                                            max={1000}
                                                            step={50}
                                                            dir="rtl"
                                                            value={[
                                                                areaFrom ? Number(areaFrom) : 0,
                                                                areaTo ? Number(areaTo) : 10000
                                                            ]}
                                                            onValueChange={([min, max]) => {
                                                                form.setFieldValue('property_area_from', min.toString());
                                                                form.setFieldValue('property_area_to', max.toString());
                                                            }}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => setIsAreaPopoverOpen(false)}
                                                        className="w-full bg-[#A97A36] text-white hover:opacity-75 transition-opacity"
                                                    >
                                                        {lang_1.filters.ok}
                                                    </Button>
                                                </PopoverContent>
                                            </Popover>
                                        </UIField>
                                    )}
                                </form.Subscribe>

                                <form.Subscribe selector={(state) => [state.values.price_from, state.values.price_to]}>
                                    {([priceFrom, priceTo]) => (
                                        <UIField>
                                            <FieldLabel>{lang_1.filters.price}</FieldLabel>
                                            <Popover open={isPricePopoverOpen} onOpenChange={setIsPricePopoverOpen}>
                                                <PopoverTrigger asChild>
                                                    <div>
                                                        <Button variant="outline" className={cn("w-full justify-between font-normal px-3", (!priceFrom && !priceTo) ? "text-muted-foreground" : "")}>
                                                            <span className="truncate">
                                                                {priceFrom || priceTo
                                                                    ? `${priceFrom ? Number(priceFrom).toLocaleString() : 0} ₪ - ${priceTo ? Number(priceTo).toLocaleString() : '20,000,000+'} ₪`
                                                                    : lang_1.filters.price}
                                                            </span>
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent align='end' side='bottom' className="w-fit flex-col gap-4 p-4 lg:min-w-[300px] bg-white z-[60]">
                                                    <p className="text-sm font-medium mb-1">{lang_1.filters.selectPriceRange}</p>

                                                    <div className="flex lg:flex-row flex-col items-center gap-2">
                                                        <form.Field
                                                            name="price_from"
                                                            validators={{
                                                                onSubmit: ({ value }) => {
                                                                    const res = contactAllSchema.shape.price_from.safeParse(value)
                                                                    return res.success ? undefined : res.error.issues[0].message
                                                                }
                                                            }}
                                                        >
                                                            {(field) => (
                                                                <div className="relative w-full flex flex-col gap-1">
                                                                    <div className="relative">
                                                                        <Input
                                                                            type="text"
                                                                            placeholder={lang_1.filters.from}
                                                                            className={cn("h-8 text-xs text-center px-6", field.state.meta.errors.length > 0 && "border-red-500 border")}
                                                                            value={field.state.value ? Number(field.state.value).toLocaleString() : ""}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value.replace(/\D/g, '');
                                                                                field.handleChange(val)
                                                                            }}
                                                                            onBlur={field.handleBlur}
                                                                        />
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium">₪</span>
                                                                    </div>
                                                                    {field.state.meta.errors.length > 0 && (
                                                                        <span className="text-[10px] text-red-500">{field.state.meta.errors[0]}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </form.Field>
                                                        <span className="text-zinc-500 hidden lg:block">-</span>
                                                        <form.Field
                                                            name="price_to"
                                                            validators={{
                                                                onSubmit: ({ value }) => {
                                                                    const res = contactAllSchema.shape.price_to.safeParse(value)
                                                                    return res.success ? undefined : res.error.issues[0].message
                                                                }
                                                            }}
                                                        >
                                                            {(field) => (
                                                                <div className="relative w-full flex flex-col gap-1">
                                                                    <div className="relative">
                                                                        <Input
                                                                            type="text"
                                                                            placeholder={lang_1.filters.to}
                                                                            className={cn("h-8 text-xs text-center px-6", field.state.meta.errors.length > 0 && "border-red-500 border")}
                                                                            value={field.state.value ? Number(field.state.value).toLocaleString() : ""}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value.replace(/\D/g, '');
                                                                                field.handleChange(val)
                                                                            }}
                                                                            onBlur={field.handleBlur}
                                                                        />
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium">₪</span>
                                                                    </div>
                                                                    {field.state.meta.errors.length > 0 && (
                                                                        <span className="text-[10px] text-red-500">{field.state.meta.errors[0]}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </form.Field>
                                                    </div>
                                                    <div className="px-2 pt-2 pb-4">
                                                        <Slider
                                                            min={0}
                                                            max={20000000}
                                                            step={100000}
                                                            dir="rtl"
                                                            value={[
                                                                form.state.values.price_from ? Number(form.state.values.price_from) : 0,
                                                                form.state.values.price_to ? Number(form.state.values.price_to) : 20000000
                                                            ]}
                                                            onValueChange={(values) => {
                                                                form.setFieldValue("price_from", values[0] === 0 ? "" : String(values[0]));
                                                                form.setFieldValue("price_to", values[1] === 20000000 ? "" : String(values[1]));
                                                            }}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => setIsPricePopoverOpen(false)}
                                                        className="w-full bg-[#A97A36] text-white hover:opacity-75 transition-opacity"
                                                    >
                                                        {lang_1.filters.ok}
                                                    </Button>
                                                </PopoverContent>
                                            </Popover>
                                        </UIField>
                                    )}
                                </form.Subscribe>
                            </div>

                            <form.Field
                                name="message"
                                validators={{
                                    onSubmit: ({ value }) => {
                                        const res = contactAllSchema.shape.message.safeParse(value)
                                        return res.success ? undefined : res.error.issues[0].message
                                    }
                                }}
                            >
                                {(field) => {
                                    const hasError = field.state.meta.errors.length > 0;
                                    return (
                                        <UIField>
                                            <FieldLabel>{lang_1.contact.message}</FieldLabel>
                                            <Textarea
                                                value={field.state.value}
                                                onChange={e => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                                rows={4}
                                                placeholder={lang_1.contact.writeMessage}
                                                className={cn("resize-none", hasError && "border-red-500 focus-visible:ring-red-500")}
                                            />
                                            {hasError && <FieldDescription className="text-red-500 text-xs">{field.state.meta.errors[0]}</FieldDescription>}
                                        </UIField>
                                    )
                                }}
                            </form.Field>

                            <Button
                                type="submit"
                                disabled={form.state.isSubmitting || status === 'pending'}
                                className="bg-[#131927] border-[#131927] text-white hover:opacity-75 w-full h-10 mt-4"
                            >
                                {status === 'pending' ? <Spinner className='w-4 h-4' /> : lang_1.contact.sendMessage}
                            </Button>
                        </form>
                    )}

                </PopoverContent>
            </Popover>
        </div>
    )
}

export default ContactAll