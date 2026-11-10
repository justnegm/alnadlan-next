"use client";

import { resetPasswordConfirmation } from '@/server/auth'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import logo from '@/assets/logo.jpeg'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { lang_1 } from '@/lib/lang_1'
import { Image } from "@/components/ui/image";

const ResetPasswordConfirmation = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false)
    const [showPassword2, setShowPassword2] = useState(false)

    // next/navigation returns raw (encoded) segments; decode like react-router did.
    const params = useParams<{ uid: string; token: string }>();
    const uid = params?.uid ? decodeURIComponent(params.uid) : undefined;
    const token = params?.token ? decodeURIComponent(params.token) : undefined;
    const form = useForm({
        defaultValues: {
            new_password1: "",
            new_password2: "",
        },
        onSubmit: async ({ value }) => {
            mutate(value)
        },
    })
    const { mutate, status } = useMutation({
        mutationFn: (formData: any) => resetPasswordConfirmation(formData, uid, token),
        onSuccess: (res: any) => {
            toast.success(res?.detail || lang_1.auth.passwordChanged);
            setTimeout(() => {
                router.push("/auth");
            }, 2000);
        },
        onError: (err: any) => {
            const message =
                err?.response?.data?.email?.[0] ||
                err?.response?.data?.username?.[0] ||
                err?.response?.data?.password?.[0] ||
                lang_1.auth.passwordChangeFailed;
            toast.error(message);
        },
    });
    return (
        <section className='max-w-400 w-[90%] mx-auto flex items-center h-full'>
            <div className='flex flex-col gap-4 max-w-125 w-full rounded-3xl bg-white p-4 py-8'>
                <Link href={'/'}>
                    <Image src={logo.src} alt="logo" className='w-50 mx-auto aspect-square' />
                </Link>
                <p className='text-xl font-semibold'>{lang_1.auth.changePassword}</p>
                <FieldSet className="w-full">
                    <FieldGroup>
                        <form.Field
                            name="new_password1"
                            validators={{
                                onChange: ({ value }) => {
                                    const res = z.string().min(6, lang_1.helpers.passwordMinLength).safeParse(value);
                                    return res.success ? undefined : res.error.issues[0].message;
                                },
                            }}
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel htmlFor="password">{lang_1.auth.password}</FieldLabel>
                                    <div className='relative'>
                                        <Input
                                            id="password"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className='h-10 rounded-r-lg! pe-8'
                                            type={showPassword ? "text" : "password"}
                                            placeholder={lang_1.auth.password}
                                        />
                                        <Button variant="ghost" className='h-10 absolute left-0 top-1/5 -translate-y-1/5' onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />} </Button>
                                    </div>

                                    {field.state.meta.isTouched && field.state.meta.errors?.[0] && (
                                        <FieldDescription className="text-red-500">
                                            {field.state.meta.errors?.[0] as string}
                                        </FieldDescription>
                                    )}
                                </Field>
                            )}
                        </form.Field>
                        <form.Field
                            name="new_password2"
                            validators={{
                                onChange: ({ value, fieldApi }) => {
                                    if (value !== fieldApi.form.getFieldValue('new_password1')) {
                                        return lang_1.helpers.passwordMismatch;
                                    }
                                    return undefined;
                                },
                            }}
                        >
                            {(field) => (
                                <Field>
                                    <FieldLabel htmlFor="confirmPassword">{lang_1.auth.confirmPasswordVariant}</FieldLabel>
                                    <div className='relative'>
                                        <Input
                                            id="confirmPassword"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className='h-10 rounded-r-lg! pe-8'
                                            type={showPassword2 ? "text" : "password"}
                                            placeholder={lang_1.auth.confirmPasswordVariant}
                                        />
                                        <Button variant="ghost" className='h-10 absolute left-0 top-1/5 -translate-y-1/5' onClick={() => setShowPassword2(!showPassword2)}>{showPassword2 ? <EyeOff /> : <Eye />} </Button>
                                    </div>

                                    {field.state.meta.isTouched && field.state.meta.errors?.[0] && (
                                        <FieldDescription className="text-red-500">
                                            {field.state.meta.errors?.[0] as string}
                                        </FieldDescription>
                                    )}
                                </Field>
                            )}
                        </form.Field>
                    </FieldGroup>
                </FieldSet>

                <Button onClick={() => form.handleSubmit()} disabled={status === "pending"} className="bg-[#131927] border-[#131927] text-white hover:opacity-75 w-full h-10">
                    {status === 'pending' ? <Spinner /> : lang_1.auth.changePassword}
                </Button>

            </div>

        </section>
    )
}

export default ResetPasswordConfirmation