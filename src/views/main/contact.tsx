"use client";

import placeholderAsset from '@/assets/placeholder.webp'
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createContact, getMainInfo } from "@/server/main";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { contactSchema } from '@/lib/helpers';
import { Link } from '@/i18n/navigation';
import logoAsset from '@/assets/logo.jpeg'
import { Textarea } from '@/components/ui/textarea';
import { FaFacebook, FaInstagram, FaWhatsapp, FaLinkedin, FaTiktok, FaTwitter } from 'react-icons/fa';
import { Spinner } from '@/components/ui/spinner';
import { lang_1 } from '@/lib/lang_1';
import { getContactUsMedia } from '@/server/media';
import { Image } from "@/components/ui/image";

const placeholder = (placeholderAsset as any)?.src ?? (placeholderAsset as any);
const logo = (logoAsset as any)?.src ?? (logoAsset as any);

export type ContactInitialData = {
    mainInfo?: any;
    media?: any;
};

const Contact = ({ initialData }: { initialData?: ContactInitialData }) => {
    const { data } = useQuery({
        queryKey: ['main-info'],
        queryFn: getMainInfo,
        initialData: initialData?.mainInfo ?? undefined,
    });
    const { mutate, isPending } = useMutation({
        mutationFn: createContact,
        onSuccess: () => {
            toast.success(lang_1.contact.messageSentSuccess);
            form.reset();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || lang_1.contact.sendError);
        }
    });

    const { data: media } = useQuery({
        queryKey: ["contact-media"],
        queryFn: () => getContactUsMedia(),
        initialData: initialData?.media ?? undefined,
    });

    const form = useForm({
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            message: "",
        },
        onSubmit: async ({ value }) => {
            mutate(value);
        },
    });
    return (
        <section className='w-full min-h-screen bg-center bg-no-repeat bg-cover flex items-center mt-20 -mb-20' style={{ backgroundImage: `url(${media?.image ?? placeholder})` }}>
            <div className='max-w-400 w-[90%] mx-auto my-20 flex items-center h-full'>
                <div className='flex flex-col gap-4 max-w-125 w-full rounded-3xl bg-white p-4 py-8'>
                    <Image src={logo} alt="logo" className='w-30 mx-auto aspect-square' />
                    <p className='text-xl font-semibold'>{lang_1.footer.contact}</p>
                    <FieldSet className="w-full">
                        <FieldGroup>
                            <form.Field
                                name="name"
                                validators={{
                                    onChange: ({ value }) => {
                                        const result = contactSchema.shape.name.safeParse(value)
                                        return result.success ? undefined : result.error.issues[0].message
                                    },
                                }}
                            >
                                {(field) => {
                                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                                    return (
                                        <Field>
                                            <FieldLabel htmlFor="name">{lang_1.contact.fullName}</FieldLabel>
                                            <Input value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} id="name" className={`h-10 ${hasError ? "border-red-500 focus-visible:ring-red-500" : ""}`} type="text" placeholder={lang_1.contact.fullName} />
                                            {hasError && (
                                                <FieldDescription className="text-red-500">
                                                    {field.state.meta.errors[0] as string}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    )
                                }}
                            </form.Field>
                            <form.Field
                                name="email"
                                validators={{
                                    onChange: ({ value }) => {
                                        const result = contactSchema.shape.email.safeParse(value)
                                        return result.success ? undefined : result.error.issues[0].message
                                    },
                                }}
                            >
                                {(field) => {
                                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                                    return (
                                        <Field>
                                            <FieldLabel htmlFor="email">{lang_1.contact.email}</FieldLabel>
                                            <Input value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} id="email" className={`h-10 ${hasError ? "border-red-500 focus-visible:ring-red-500" : ""}`} type="email" placeholder={lang_1.contact.email} />
                                            {hasError && (
                                                <FieldDescription className="text-red-500">
                                                    {field.state.meta.errors[0] as string}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    )
                                }}
                            </form.Field>
                            <form.Field
                                name="phone"
                                validators={{
                                    onChange: ({ value }) => {
                                        const result = contactSchema.shape.phone.safeParse(value)
                                        return result.success ? undefined : result.error.issues[0].message
                                    },
                                }}
                            >
                                {(field) => {
                                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                                    return (
                                        <Field>
                                            <FieldLabel htmlFor="phone">{lang_1.contact.phone}</FieldLabel>
                                            <Input value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} id="phone" className={`h-10 ${hasError ? "border-red-500 focus-visible:ring-red-500" : ""}`} type="text" placeholder={lang_1.contact.phone} />
                                            {hasError && (
                                                <FieldDescription className="text-red-500">
                                                    {field.state.meta.errors[0] as string}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    )
                                }}
                            </form.Field>

                            <form.Field
                                name="message"
                                validators={{
                                    onChange: ({ value }) => {
                                        const result = contactSchema.shape.message.safeParse(value)
                                        return result.success ? undefined : result.error.issues[0].message
                                    },
                                }}
                            >
                                {(field) => {
                                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                                    return (
                                        <Field>
                                            <FieldLabel htmlFor="message">{lang_1.contact.message}</FieldLabel>
                                            <Textarea value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} id="message" className={`${hasError ? "border-red-500 focus-visible:ring-red-500" : ""} min-h-30`} placeholder={lang_1.contact.message} />
                                            {hasError && (
                                                <FieldDescription className="text-red-500">
                                                    {field.state.meta.errors[0] as string}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    )
                                }}
                            </form.Field>

                        </FieldGroup>
                    </FieldSet>


                    <div className='flex justify-center flex-wrap gap-4'>
                        {data?.address && (
                            <p className='text-xs font-semibold'>{data.address}</p>
                        )}
                        {data?.phone && (
                            <Link href={`tel:${data.phone}`} target="_blank" className='text-xs font-semibold' style={{ direction: 'ltr' }}>{data.phone}</Link>
                        )}
                        {data?.email && (
                            <Link href={`mailto:${data.email}`} target="_blank" className='text-xs font-semibold'>{data.email}</Link>
                        )}
                    </div>
                    <div className='flex justify-center flex-wrap gap-4 mt-2 mb-4'>
                        {data?.whatsapp && (
                            <Link href={`https://wa.me/${data.whatsapp.replace(/\+/g, '')}`} target="_blank">
                                <FaWhatsapp size={24} />
                            </Link>
                        )}
                        {data?.facebook && (
                            <Link href={data.facebook} target="_blank">
                                <FaFacebook size={24} />
                            </Link>
                        )}
                        {data?.instagram && (
                            <Link href={data.instagram} target="_blank">
                                <FaInstagram size={24} />
                            </Link>
                        )}
                        {data?.linkedin && (
                            <Link href={data.linkedin} target="_blank">
                                <FaLinkedin size={24} />
                            </Link>
                        )}
                        {data?.tiktok && (
                            <Link href={data.tiktok} target="_blank">
                                <FaTiktok size={24} />
                            </Link>
                        )}
                        {data?.x && (
                            <Link href={data.x} target="_blank">
                                <FaTwitter size={24} />
                            </Link>
                        )}
                    </div>
                    <Button disabled={isPending} onClick={(e) => { e.preventDefault(); form.handleSubmit(); }} className="bg-[#131927] border-[#131927] text-white hover:opacity-75 w-full h-10">
                        {isPending ? <Spinner /> : lang_1.contact.send}
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default Contact