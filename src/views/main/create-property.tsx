"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Accessibility, BrickWall, ChevronsUpDown, Flame, House, Image as ImageIcon, Video, MapPin, PawPrint, ShieldCheck, Snowflake, Upload, Warehouse } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FaTrafficLight } from 'react-icons/fa'
import { Empty, EmptyContent, EmptyHeader } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import Advertisement from "@/components/ui/advertisement"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import SearchableSelect from "@/components/ui/searchable-select"
import { useState, useRef, useEffect } from "react"
import type { ChangeEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createProperty, getAreasAndCities, getTypes, updateProperty, getProperty, deleteProperty, getStreets, getCities } from "@/server/main"
import { contractTypes, createNumberArray, propertyConditions } from "@/lib/helpers"
import { toast } from "sonner"
import { useT } from "@/i18n/useT";
import { getPropertyAddMedia } from "@/server/media"
import { Image } from "@/components/ui/image";

const PropertyForm = () => {
  const lang_1 = useT();
    const queryClient = useQueryClient();
    // Rendered by both /property/create (no id) and /property/edit/[id].
    // next/navigation returns the raw (encoded) segment; decode like react-router did.
    const params = useParams<{ id?: string }>();
    const id = typeof params?.id === "string" ? decodeURIComponent(params.id) : undefined;
    const router = useRouter();
    const { data: areasAndCities } = useQuery({
        queryKey: ["areas-and-cities"],
        queryFn: () => getAreasAndCities(),
    });

    const { data: types } = useQuery({
        queryKey: ["types"],
        queryFn: () => getTypes(),
    });

    const { data: existingProperty } = useQuery({
        queryKey: ["property", id],
        queryFn: () => getProperty(String(id)),
        enabled: !!id
    });

    const { data: media } = useQuery({
        queryKey: ["create-property-media"],
        queryFn: () => getPropertyAddMedia(),
    });


    const [errors, setErrors] = useState<Record<string, string>>({});






    const [property, setProperty] = useState({
        contract_type: "",
        title: "",
        desc: "",
        street: "",
        property_number: "",
        rooms_number: 0,
        floor: 0,
        condition: "",
        property_area: "",
        land_area: "",
        entry_time: "",
        parking_number: 0,
        property_price: "",
        special_entrance: false,
        air_conditioner: false,
        elevator: false,
        storehouse: false,
        water_heater: false,
        restored_property: false,
        security: false,
        pets_allowed: false,
        property_type: "",
        area: "",
        city: "",
    })

    const { data: cities } = useQuery({
        queryKey: ["cities", property.area],
        queryFn: () => getCities(String(property.area)),
        enabled: !!property.area
    });

    const { data: streets } = useQuery({
        queryKey: ["streets", property.city],
        queryFn: () => getStreets(String(property.city)),
        enabled: !!property.city
    });


    const parking_spots = createNumberArray(1, 10);

    const [images, setImages] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [videos, setVideos] = useState<string[]>([]);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const videoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (existingProperty) {
            setProperty((prev) => ({
                ...prev,
                contract_type: existingProperty.contract_type?.id?.toString() || existingProperty.contract_type?.toString() || "",
                title: existingProperty.title || "",
                desc: existingProperty.desc || "",
                street: existingProperty.street_id?.toString() || existingProperty.street?.toString() || "",
                property_number: existingProperty.property_number || "",
                rooms_number: existingProperty.rooms_number || 0,
                floor: existingProperty.floor || 0,
                condition: existingProperty.condition || "",
                property_area: existingProperty.property_area || "",
                land_area: existingProperty.land_area || "",
                entry_time: existingProperty.entry_time || "",
                parking_number: existingProperty.parking_number || 0,
                property_price: existingProperty.property_price || "",
                special_entrance: existingProperty.special_entrance || false,
                air_conditioner: existingProperty.air_conditioner || false,
                elevator: existingProperty.elevator || false,
                storehouse: existingProperty.storehouse || false,
                water_heater: existingProperty.water_heater || false,
                restored_property: existingProperty.restored_property || false,
                security: existingProperty.security || false,
                pets_allowed: existingProperty.pets_allowed || false,
                property_type: existingProperty.property_type_id?.toString() || "",
                area: existingProperty.area_id?.toString() || "",
                city: existingProperty.city_id?.toString() || "",
            }));
            if (existingProperty.images) {
                setImages(existingProperty.images.map((img: any) => img.image || img));
            }
            if (existingProperty.videos) {
                setVideos(existingProperty.videos.map((vid: any) => vid.video || vid));
            }
        }
    }, [existingProperty, areasAndCities]);

    const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setVideoFiles((prev) => [...prev, ...files]);
        setErrors((prev) => ({ ...prev, videos: '' }));

        const videoPromises = files.map((file) => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(videoPromises).then((videoUrls) => {
            setVideos((prevVideos) => [...prevVideos, ...videoUrls]);
        });
    };

    const removeVideo = (index: number) => {
        setVideos((prevVideos) => prevVideos.filter((_, i) => i !== index));
        setVideoFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setImageFiles((prev) => [...prev, ...files]);
        setErrors((prev) => ({ ...prev, images: '' }));

        const imagePromises = files.map((file) => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises).then((imageUrls) => {
            setImages((prevImages) => [...prevImages, ...imageUrls]);
        });
    };

    const removeImage = (index: number) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
        setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handlePropertySubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        const requiredFields = ['contract_type', 'title', 'desc', 'street', 'property_number', 'rooms_number', 'floor', 'condition', 'property_area', 'land_area', 'entry_time', 'parking_number', 'property_price', 'property_type', 'area', 'city'];
        let hasError = false;

        requiredFields.forEach(field => {
            const val = property[field as keyof typeof property];
            if (val === "" || val === null || val === undefined) {
                newErrors[field] = lang_1.propertyForm.requiredField;
                hasError = true;
            }
        });

        if (images.length === 0) {
            newErrors.images = lang_1.propertyForm.photosRequired;
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) {
            toast.error(lang_1.propertyForm.fillRequired);
            return;
        }

        const formData = new FormData();
        Object.entries(property).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                formData.append(key, typeof value === 'boolean' ? String(value) : String(value));
            }
        });

        imageFiles.forEach((file) => {
            formData.append('uploaded_images', file);
        });

        videoFiles.forEach((file) => {
            formData.append('uploaded_videos', file);
        });

        if (id) {
            updateMutate(formData);
        } else {
            mutate(formData);
        }
    };


    const { mutate, status } = useMutation({
        mutationFn: (formData: any) => createProperty(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["properties"] });
            toast.success(lang_1.propertyForm.propertyAdded);
            router.push("/profile");
        },
        onError: (err: any) => {
            const message =
                err?.response?.data?.message
            toast.error(message);
        },
    });

    const { mutate: updateMutate, status: updateStatus } = useMutation({
        mutationFn: (formData: any) => updateProperty(String(id), formData),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["property", id] });
            queryClient.invalidateQueries({ queryKey: ["properties"] });
            toast.success(lang_1.propertyForm.editSuccess);
            router.push("/profile");
        },
        onError: (err: any) => {
            const message =
                err?.response?.data?.message
            toast.error(message);
        },
    });
    const { mutate: deleteMutate, status: deleteStatus } = useMutation({
        mutationFn: () => deleteProperty(String(id)),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["property", id] });
            queryClient.invalidateQueries({ queryKey: ["properties"] });
            toast.success(lang_1.propertyForm.deleteSuccess);
            router.push("/profile");
        },
        onError: (err: any) => {
            const message =
                err?.response?.data?.message
            toast.error(message);
        },
    });

    return (
        <section className="mt-40 flex flex-col gap-20">
            <Breadcrumb className='max-w-400 w-[90%] mx-auto'>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">{lang_1.propertyForm.home}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/profile">{lang_1.propertyForm.profile}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{lang_1.propertyForm.addProperty}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className='max-w-400 w-[90%] mx-auto bg-white border border-zinc-300 rounded-lg p-10 flex flex-col gap-10'>
                <h3 className='text-2xl font-semibold'>{lang_1.propertyForm.addProperty}</h3>
                <div className='grid lg:grid-cols-2 grid-cols-1 gap-5'>
                    <div className='flex flex-col gap-5'>
                        <h3 className='text-xl font-semibold'>{lang_1.propertyForm.propertyDetails}</h3>
                        <Field>
                            <FieldLabel htmlFor="title" className='flex items-center gap-2'>{lang_1.propertyForm.propertyAddress}</FieldLabel>
                            <Input id="title" placeholder={lang_1.propertyForm.propertyAddress} className={`h-10 ${errors.title ? 'border-red-500' : ''}`} value={property.title} onChange={(e) => { setProperty({ ...property, title: e.target.value }); setErrors({ ...errors, title: '' }) }} />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="desc" className='flex items-center gap-2'>{lang_1.propertyForm.description}</FieldLabel>
                            <Textarea id="desc" placeholder={lang_1.propertyForm.description} className={`h-40 ${errors.desc ? 'border-red-500' : ''}`} value={property.desc} onChange={(e) => { setProperty({ ...property, desc: e.target.value }); setErrors({ ...errors, desc: '' }) }} />
                            {errors.desc && <p className="text-red-500 text-sm mt-1">{errors.desc}</p>}
                        </Field>

                        <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
                            <Field>
                                <FieldLabel htmlFor="property_type" className='flex items-center gap-2'><House size={16} />{lang_1.propertyForm.propertyType} </FieldLabel>
                                <div className={errors.property_type ? 'border border-red-500 rounded-md p-0.5' : ''}>
                                    <SearchableSelect
                                        placeholder={lang_1.propertyForm.propertyType}
                                        data={types?.results || types || []}
                                        onChange={(value: any) => { setProperty({ ...property, property_type: value }); setErrors({ ...errors, property_type: '' }) }}
                                        value={property.property_type}
                                        grouped={true}
                                        groupKey="property_types"
                                    />
                                </div>
                                {errors.property_type && <p className="text-red-500 text-sm mt-1">{errors.property_type}</p>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="area" className='flex items-center gap-2'><MapPin size={16} />{lang_1.filters.area} </FieldLabel>
                                <div className={errors.area ? 'border border-red-500 rounded-md p-0.5' : ''}>
                                    <SearchableSelect
                                        placeholder={lang_1.filters.area}
                                        data={areasAndCities?.results || areasAndCities || []}
                                        onChange={(value: any) => {
                                            setProperty({ ...property, area: value, city: "", street: "" });
                                            setErrors({ ...errors, area: '' });
                                        }}
                                        value={property.area}
                                    />
                                </div>
                                {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="city" className='flex items-center gap-2'><MapPin size={16} />{lang_1.filters.city} </FieldLabel>
                                <div className={errors.city ? 'border border-red-500 rounded-md p-0.5' : ''}>
                                    <SearchableSelect
                                        placeholder={lang_1.filters.city}
                                        data={cities?.results || cities || []}
                                        onChange={(value: any) => { setProperty({ ...property, city: value, street: "" }); setErrors({ ...errors, city: '' }) }}
                                        value={property.city}
                                    />
                                </div>
                                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="street" className='flex items-center gap-2'><FaTrafficLight size={16} />{lang_1.propertyForm.street} </FieldLabel>
                                <div className={errors.street ? 'border border-red-500 rounded-md p-0.5' : ''}>
                                    <SearchableSelect
                                        placeholder={lang_1.propertyForm.street}
                                        data={streets?.results || streets || []}
                                        onChange={(value: any) => { setProperty({ ...property, street: value }); setErrors({ ...errors, street: '' }) }}
                                        value={property.street}
                                    />
                                </div>
                                {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                            </Field>


                            <Field>
                                <FieldLabel htmlFor="building" className='flex items-center gap-2'><House size={16} />{lang_1.propertyForm.buildingNumber} </FieldLabel>
                                <Input id="building" className={`h-10 ${errors.property_number ? 'border-red-500' : ''}`} type="text" placeholder={lang_1.propertyForm.buildingNumber} value={property.property_number} onChange={(e) => { setProperty({ ...property, property_number: e.target.value }); setErrors({ ...errors, property_number: '' }) }} />
                                {errors.property_number && <p className="text-red-500 text-sm mt-1">{errors.property_number}</p>}
                            </Field>

                        </div>
                        <div className='grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-5'>
                            <Field>
                                <FieldLabel htmlFor="image" className='flex items-center gap-2'><ImageIcon size={16} />{lang_1.propertyForm.photos} </FieldLabel>
                                <Empty className={`border border-dashed ${errors.images ? 'border-red-500' : 'border-zinc-300'} min-h-60`}>
                                    <EmptyHeader>
                                        <Upload />
                                    </EmptyHeader>
                                    <EmptyContent>
                                        {
                                            images.length === 0 ? (
                                                <>
                                                    <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                                                    <Button id='image' variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                                        {lang_1.propertyForm.uploadFile}
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col gap-5">
                                                    {images.map((image, index) => (
                                                        <div key={index} className="flex items-center gap-5">
                                                            <Image src={image} alt="" className="w-20 h-20" />
                                                            <Button variant="outline" size="sm" onClick={() => removeImage(index)}>
                                                                {lang_1.propertyForm.delete}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                                                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>{lang_1.propertyForm.searchMore}</Button>
                                                </div>
                                            )
                                        }
                                    </EmptyContent>
                                </Empty>
                                {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="video" className='flex items-center gap-2'><Video size={16} />{lang_1.propertyForm.videos} </FieldLabel>
                                <Empty className={`border border-dashed ${errors.videos ? 'border-red-500' : 'border-zinc-300'} min-h-60`}>
                                    <EmptyHeader>
                                        <Upload />
                                    </EmptyHeader>
                                    <EmptyContent>
                                        {
                                            videos.length === 0 ? (
                                                <>
                                                    <input type="file" accept="video/*" multiple className="hidden" ref={videoInputRef} onChange={handleVideoUpload} />
                                                    <Button id='video' variant="outline" size="sm" onClick={() => videoInputRef.current?.click()}>
                                                        {lang_1.propertyForm.uploadVideo}
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col gap-5 w-full">
                                                    {videos.map((video, index) => (
                                                        <div key={index} className="flex items-center gap-5 w-full mx-auto justify-center">
                                                            <video src={video} className="w-40 h-28 object-cover rounded-md" controls />
                                                            <Button variant="outline" size="sm" onClick={() => removeVideo(index)}>
                                                                {lang_1.propertyForm.delete}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <input type="file" accept="video/*" multiple className="hidden" ref={videoInputRef} onChange={handleVideoUpload} />
                                                    <Button variant="outline" size="sm" onClick={() => videoInputRef.current?.click()}>{lang_1.propertyForm.searchMore}</Button>
                                                </div>
                                            )
                                        }
                                    </EmptyContent>
                                </Empty>
                                {errors.videos && <p className="text-red-500 text-sm mt-1">{errors.videos}</p>}
                            </Field>
                        </div>
                    </div>
                    <div className='flex flex-col gap-5'>
                        <h3 className='text-xl font-semibold'>{lang_1.propertyForm.additionalInfo}</h3>
                        <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
                            <Field>
                                <FieldLabel htmlFor="type" className='flex items-center gap-2'>{lang_1.propertyForm.transactionType} </FieldLabel>
                                <Select value={property.contract_type} onValueChange={(val) => { setProperty({ ...property, contract_type: val }); setErrors({ ...errors, contract_type: '' }) }}>
                                    <SelectTrigger id="type" className={`h-10! bg-white text-black ${errors.contract_type ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder={lang_1.propertyForm.transactionType} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {contractTypes(lang_1).map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.contract_type && <p className="text-red-500 text-sm mt-1">{errors.contract_type}</p>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="condition" className='flex items-center gap-2'>{lang_1.propertyForm.propertyStatus} </FieldLabel>
                                <Select value={property.condition} onValueChange={(val) => { setProperty({ ...property, condition: val }); setErrors({ ...errors, condition: '' }) }}>
                                    <SelectTrigger id="condition" className={`h-10! bg-white text-black ${errors.condition ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder={lang_1.propertyForm.propertyStatus} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {propertyConditions(lang_1).map((condition) => (
                                                <SelectItem key={condition.id} value={condition.id}>
                                                    {condition.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="space" className='flex items-center gap-2'>{lang_1.propertyForm.houseArea} </FieldLabel>
                                <Input id="space" className={`h-10 ${errors.property_area ? 'border-red-500' : ''}`} type="text" placeholder={lang_1.propertyForm.houseArea} value={property.property_area} onChange={(e) => { setProperty({ ...property, property_area: e.target.value }); setErrors({ ...errors, property_area: '' }) }} />
                                {errors.property_area && <p className="text-red-500 text-sm mt-1">{errors.property_area}</p>}
                            </Field>
                        </div>
                        <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
                            <Field>
                                <FieldLabel htmlFor="rooms" className='flex items-center gap-2'>{lang_1.propertyForm.roomsCount} </FieldLabel>
                                <Input id="rooms" className={`h-10 ${errors.rooms_number ? 'border-red-500' : ''}`} type="text" placeholder={lang_1.propertyForm.roomsCount} value={property.rooms_number} onChange={(e) => { setProperty({ ...property, rooms_number: Number(e.target.value.replace(/[^0-9]/g, '')) }); setErrors({ ...errors, rooms_number: '' }) }} />
                                {errors.rooms_number && <p className="text-red-500 text-sm mt-1">{errors.rooms_number}</p>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="floor" className='flex items-center gap-2'>{lang_1.propertyForm.floor} </FieldLabel>
                                <Input id="floor" className={`h-10 ${errors.floor ? 'border-red-500' : ''}`} type="text" placeholder={lang_1.propertyForm.floor} value={property.floor} onChange={(e) => { setProperty({ ...property, floor: Number(e.target.value.replace(/[^0-9]/g, '')) }); setErrors({ ...errors, floor: '' }) }} />
                                {errors.floor && <p className="text-red-500 text-sm mt-1">{errors.floor}</p>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="floorspace" className='flex items-center gap-2'>{lang_1.propertyForm.landArea} </FieldLabel>
                                <Input id="floorspace" className={`h-10 ${errors.land_area ? 'border-red-500' : ''}`} type="text" placeholder={lang_1.propertyForm.landArea} value={property.land_area} onChange={(e) => { setProperty({ ...property, land_area: e.target.value }); setErrors({ ...errors, land_area: '' }) }} />
                                {errors.land_area && <p className="text-red-500 text-sm mt-1">{errors.land_area}</p>}
                            </Field>
                        </div>
                        <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
                            <Field>
                                <FieldLabel htmlFor="duedate" className='flex items-center gap-2'>{lang_1.propertyForm.entryDate} </FieldLabel>
                                <Input id="duedate" className={`h-10 ${errors.entry_time ? 'border-red-500' : ''}`} type="text" placeholder={lang_1.propertyForm.entryDate} value={property.entry_time} onChange={(e) => { setProperty({ ...property, entry_time: e.target.value }); setErrors({ ...errors, entry_time: '' }) }} />
                                {errors.entry_time && <p className="text-red-500 text-sm mt-1">{errors.entry_time}</p>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="pricepermeter" className='flex items-center gap-2'>{lang_1.propertyForm.pricePerMeter} </FieldLabel>
                                <Input id="pricepermeter" className={`h-10 ${errors.property_price ? 'border-red-500' : ''}`} type="text" placeholder={lang_1.propertyForm.pricePerMeter} value={property.property_price} onChange={(e) => { setProperty({ ...property, property_price: e.target.value }); setErrors({ ...errors, meter_price: '' }) }} />
                                {errors.property_price && <p className="text-red-500 text-sm mt-1">{errors.property_price}</p>}
                            </Field>
                        </div>
                        <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
                            <Field>
                                <FieldLabel htmlFor="parkingspots" className='flex items-center gap-2'>{lang_1.propertyForm.parkingCount} </FieldLabel>
                                <Select value={property.parking_number ? String(property.parking_number) : undefined} onValueChange={(val) => { setProperty({ ...property, parking_number: Number(val) }); setErrors({ ...errors, parking_number: '' }) }}>
                                    <SelectTrigger id="parkingspots" className={`h-10! bg-white text-black ${errors.parking_number ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder={lang_1.propertyForm.parkingCount} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {parking_spots.map((spot) => (
                                                <SelectItem key={spot} value={spot.toString()}>
                                                    {spot}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.parking_number && <p className="text-red-500 text-sm mt-1">{errors.parking_number}</p>}
                            </Field>
                        </div>
                        <div className='flex flex-col gap-5 my-auto'>
                            <h3 className='text-xl font-semibold'>{lang_1.propertyForm.whatDoesItContain}</h3>
                            <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="disabled" className='flex items-center gap-2  me-auto'><Accessibility size={16} />{lang_1.propertyForm.accessible} </Label>
                                    <Switch id="disabled" checked={property.special_entrance as boolean} onCheckedChange={(val) => setProperty({ ...property, special_entrance: val })} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="pets" className='flex items-center gap-2 me-auto'><PawPrint size={16} />{lang_1.propertyForm.petsAllowed} </Label>
                                    <Switch id="pets" checked={property.pets_allowed as boolean} onCheckedChange={(val) => setProperty({ ...property, pets_allowed: val })} />
                                </div>
                            </div>
                            <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="elevator" className='flex items-center gap-2 me-auto'><ChevronsUpDown size={16} />{lang_1.propertyForm.elevator} </Label>
                                    <Switch id="elevator" checked={property.elevator as boolean} onCheckedChange={(val) => setProperty({ ...property, elevator: val })} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="aircondition" className='flex items-center gap-2 me-auto'><Snowflake size={16} />{lang_1.propertyForm.ac} </Label>
                                    <Switch id="aircondition" checked={property.air_conditioner as boolean} onCheckedChange={(val) => setProperty({ ...property, air_conditioner: val })} />
                                </div>
                            </div>
                            <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="warehouse" className='flex items-center gap-2 me-auto'><Warehouse size={16} />{lang_1.propertyForm.storage} </Label>
                                    <Switch id="warehouse" checked={property.storehouse as boolean} onCheckedChange={(val) => setProperty({ ...property, storehouse: val })} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="fire" className='flex items-center gap-2 me-auto'><Flame size={16} />{lang_1.propertyForm.waterHeater} </Label>
                                    <Switch id="fire" checked={property.water_heater as boolean} onCheckedChange={(val) => setProperty({ ...property, water_heater: val })} />
                                </div>
                            </div>
                            <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="brick" className='flex items-center gap-2 me-auto'><BrickWall size={16} />{lang_1.propertyForm.renovated} </Label>
                                    <Switch id="brick" checked={property.restored_property as boolean} onCheckedChange={(val) => setProperty({ ...property, restored_property: val })} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="safe" className='flex items-center gap-2 me-auto'><ShieldCheck size={16} />{lang_1.propertyForm.protection} </Label>
                                    <Switch id="safe" checked={property.security as boolean} onCheckedChange={(val) => setProperty({ ...property, security: val })} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-5">
                    <Button className='bg-[#08182D] text-white h-10 flex-1' onClick={handlePropertySubmit}>{status === 'pending' || updateStatus === 'pending' ? lang_1.propertyForm.adding : lang_1.propertyForm.uploading}</Button>
                    {id && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className='h-10 flex-1'>{lang_1.propertyForm.deleteProperty}</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{lang_1.propertyForm.areYouSureDelete}</DialogTitle>
                                    <DialogDescription>{lang_1.propertyForm.deleteWarning}</DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2 mt-4">
                                    <DialogClose asChild>
                                        <Button variant="outline">{lang_1.propertyForm.cancel}</Button>
                                    </DialogClose>
                                    <Button variant="destructive" onClick={() => deleteMutate()} disabled={deleteStatus === 'pending'}>
                                        {deleteStatus === 'pending' ? lang_1.propertyForm.deleting : lang_1.propertyForm.confirmDeleteDialog}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            <Advertisement ad={media?.advertisement} className="h-80 bg-no-repeat bg-top bg-cover" />
        </section>
    )
}

export default PropertyForm