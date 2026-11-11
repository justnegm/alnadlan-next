'use client';

import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from '../ui/field'
import { useForm } from '@tanstack/react-form';
import { Input } from '../ui/input';
import { contactSchema } from '@/lib/helpers';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import placeholder from '@/assets/avatar.webp'
import { useMutation, useQuery } from '@tanstack/react-query';
import { createLeadMessageAll, getUser } from '@/server/main';
import { toast } from 'sonner';
import { Spinner } from '../ui/spinner';
import { cn } from '@/lib/utils';
import { useT } from "@/i18n/useT";
// import SocialMediaList from '../ui/social-media-list';
import { Image } from "@/components/ui/image";
import { useEffect } from 'react';
// import { useWindowSize } from '@/hooks/useWindowSize';
import { useAuth } from '@/store/auth-slice';

const ContactForm = ({ user, title, url }: any) => {
  const lang_1 = useT();
    const { isAuth } = useAuth((state) => state);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // location.state doesn't exist in Next; the return URL is carried in ?next=
    const search = searchParams.toString();
    const returnTo = pathname + (search ? `?${search}` : "");
    const address = user?.address ?? user?.street;
    const phone = user?.phone;
    const email = user?.email;
    const providerId = user?.id ?? user?.pk ?? 0;
    const draftKey = `contact_draft_${providerId}`;
    // const { width } = useWindowSize();
    // const [showPhone, setShowPhone] = useState(false);

    const { data: currentUser } = useQuery({
        queryKey: ["profile"],
        queryFn: () => getUser(),
        enabled: isAuth
    });

    const { mutate, status } = useMutation({
        mutationFn: (body: any) => createLeadMessageAll(body),
        onSuccess: () => {
            toast.success(lang_1.contact.messageSentSuccess);
            sessionStorage.removeItem(draftKey);
            form.reset();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || err?.response?.data?.detail || lang_1.contact.sendError);
        }
    });

    const form = useForm({
        defaultValues: {
            name: currentUser?.full_name || "",
            email: currentUser?.email || "",
            phone: currentUser?.phone || "",
            message: "",
        },
        onSubmit: async ({ value }) => {
            if (!isAuth) {
                const currentValues = form.state.values;
                const hasAnyInput = Object.values(currentValues).some(
                    (v) => typeof v === 'string' && v.trim().length > 0
                );
                if (hasAnyInput) {
                    sessionStorage.setItem(draftKey, JSON.stringify(currentValues));
                }
                toast.info(lang_1.contact.loginFirstContact);
                router.push(`/auth?next=${encodeURIComponent(returnTo)}`);
                return;
            }
            mutate({
                ...value,
                service_provider: providerId
            });
        },
    });

    useEffect(() => {
        const savedDraft = sessionStorage.getItem(draftKey);
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                if (parsed.name) form.setFieldValue("name", parsed.name);
                else if (currentUser?.full_name) form.setFieldValue("name", currentUser.full_name);

                if (parsed.email) form.setFieldValue("email", parsed.email);
                else if (currentUser?.email) form.setFieldValue("email", currentUser.email);

                if (parsed.phone) form.setFieldValue("phone", parsed.phone);
                else if (currentUser?.phone) form.setFieldValue("phone", currentUser.phone);

                if (parsed.message) form.setFieldValue("message", parsed.message);
            } catch (e) {
                console.error("Failed to restore contact draft:", e);
            } finally {
                // Ensure the draft is removed so it is only restored in this scenario, not always
                sessionStorage.removeItem(draftKey);
            }
        } else if (currentUser && isAuth) {
            if (currentUser.full_name && !form.state.values.name) {
                form.setFieldValue("name", currentUser.full_name);
            }
            if (currentUser.email && !form.state.values.email) {
                form.setFieldValue("email", currentUser.email);
            }
            if (currentUser.phone && !form.state.values.phone) {
                form.setFieldValue("phone", currentUser.phone);
            }
        }
    }, [currentUser, isAuth, draftKey]);

    const OuterContainer = (children: any) => {
        if (url) return <Link href={`/${url}`} className="flex items-center gap-5">{children}</Link>
        return <div className="flex items-center gap-5">{children}</div>
    }

    return (
        <div className="lg:max-w-150 w-full flex flex-col gap-5">
            <div className="bg-white border border-zinc-300 p-4 rounded-lg flex flex-col gap-5">
                {user && (
                    <>
                        {OuterContainer(
                            <>
                                <Image src={user?.image ?? placeholder} className="min-w-24 w-24 h-24 rounded-full object-cover" alt="avatar" />
                                <h3 className="text-2xl font-bold">{user?.full_name || user?.name || user?.title || (typeof user === 'string' ? user : '-')}</h3>
                            </>
                        )}
                        <hr />
                    </>
                )}
                <h3 className="font-bold text-2xl">{title}</h3>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isAuth) {
                            const currentValues = form.state.values;
                            const hasAnyInput = Object.values(currentValues).some(
                                (v) => typeof v === 'string' && v.trim().length > 0
                            );
                            if (hasAnyInput) {
                                sessionStorage.setItem(draftKey, JSON.stringify(currentValues));
                            }
                            toast.info(lang_1.contact.loginFirstContact);
                            router.push(`/auth?next=${encodeURIComponent(returnTo)}`);
                            return;
                        }
                        form.handleSubmit();
                    }}
                >
                    <FieldSet className="w-full">
                        <FieldGroup>
                            <form.Field
                                name="name"
                                validators={{
                                    onSubmit: ({ value }) => {
                                        const res = contactSchema(lang_1).shape.name.safeParse(value)
                                        return res.success ? undefined : res.error.issues[0].message
                                    }
                                }}
                            >
                                {(field) => {
                                    const hasError = field.state.meta.errors.length > 0;
                                    return (
                                        <Field>
                                            <FieldLabel htmlFor="name">{lang_1.contact.fullName}</FieldLabel>
                                            <Input id="name" className={cn('h-10', hasError && "border-red-500")} type="text" placeholder={lang_1.contact.fullName} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
                                            {hasError && (
                                                <FieldDescription className="text-red-500 text-xs">
                                                    {field.state.meta.errors[0]}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    )
                                }}
                            </form.Field>
                            <form.Field
                                name="phone"
                                validators={{
                                    onSubmit: ({ value }) => {
                                        const res = contactSchema(lang_1).shape.phone.safeParse(value)
                                        return res.success ? undefined : res.error.issues[0].message
                                    }
                                }}
                            >
                                {(field) => {
                                    const hasError = field.state.meta.errors.length > 0;
                                    return (
                                        <Field>
                                            <FieldLabel htmlFor="phone">{lang_1.contact.phone}</FieldLabel>
                                            <Input id="phone" className={cn('h-10', hasError && "border-red-500")} type="text" placeholder={lang_1.contact.phone} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
                                            {hasError && (
                                                <FieldDescription className="text-red-500 text-xs">
                                                    {field.state.meta.errors[0]}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    )
                                }}
                            </form.Field>
                            <form.Field
                                name="email"
                                validators={{
                                    onSubmit: ({ value }) => {
                                        const res = contactSchema(lang_1).shape.email.safeParse(value)
                                        return res.success ? undefined : res.error.issues[0].message
                                    }
                                }}
                            >
                                {(field) => {
                                    const hasError = field.state.meta.errors.length > 0;
                                    return (
                                        <Field>
                                            <FieldLabel htmlFor="email">{lang_1.contact.email}</FieldLabel>
                                            <Input id="email" className={cn('h-10', hasError && "border-red-500")} type="text" placeholder={lang_1.contact.email} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
                                            {hasError && (
                                                <FieldDescription className="text-red-500 text-xs">
                                                    {field.state.meta.errors[0]}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    )
                                }}
                            </form.Field>
                            <form.Field
                                name="message"
                                validators={{
                                    onSubmit: ({ value }) => {
                                        const res = contactSchema(lang_1).shape.message.safeParse(value)
                                        return res.success ? undefined : res.error.issues[0].message
                                    }
                                }}
                            >
                                {(field) => {
                                    const hasError = field.state.meta.errors.length > 0;
                                    return (
                                        <Field>
                                            <FieldLabel htmlFor="message">{lang_1.contact.message}</FieldLabel>
                                            <Textarea id="message" className={cn("resize-none", hasError && "border-red-500")} placeholder={lang_1.contact.message} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
                                            {hasError && (
                                                <FieldDescription className="text-red-500 text-xs">
                                                    {field.state.meta.errors[0]}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    )
                                }}
                            </form.Field>

                        </FieldGroup>
                    </FieldSet>

                    <div className="flex flex-col gap-4 mt-6 items-center">

                        {isAuth && (
                            <>
                                {(address || phone || email) && (
                                    <div className='flex items-center gap-6'>
                                        {/* {address && <p className='font-semibold'>{address} </p>} */}
                                        {/* {phone && <p className='font-semibold'>{phone} </p>} */}
                                        {/* {email && <p className='font-semibold'>{email} </p>} */}
                                    </div>
                                )}
                                {/* {user?.social_links?.length > 0 && <SocialMediaList list={user?.social_links} />} */}
                            </>
                        )}

                        {!isAuth && (
                            <p className="text-xs text-zinc-500 text-center">
                                {lang_1.contact.loginFirstContact}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={status === 'pending'}
                            className="bg-[#131927] border-[#131927] text-white hover:opacity-75 w-full h-10"
                        >
                            {status === 'pending' ? (
                                <Spinner className='w-4 h-4' />
                            ) : !isAuth ? (
                                lang_1.contact.loginToSend
                            ) : (
                                lang_1.contact.send
                            )}
                        </Button>

                        {/* {isAuth && (
                            <>
                                {width > 1024 ? (
                                    <>
                                        {phone && (
                                            <Button type="button" onClick={() => setShowPhone(true)} className="bg-[#A97A36] text-white hover:opacity-75 w-full h-10">
                                                {showPhone ? phone : lang_1.contact.contactUsNow}
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {phone && (
                                            <a href={`tel:${phone}`} className="w-full">
                                                <Button type="button" className="bg-[#A97A36] text-white hover:opacity-75 w-full h-10">
                                                    {lang_1.contact.contactUsNow}
                                                </Button>
                                            </a>
                                        )}
                                    </>
                                )}
                            </>
                        )} */}

                    </div>
                </form>
            </div>

        </div>
    )
}

export default ContactForm
