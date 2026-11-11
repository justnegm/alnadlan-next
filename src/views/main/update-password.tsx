"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Field as UIField, FieldLabel, FieldDescription, FieldSet, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { updatePassword } from "@/server/main"
import { toast } from "sonner"
import { Eye, EyeOff, Lock } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { updatePasswordSchema } from '@/lib/helpers'
import { useAuth } from '@/store/auth-slice'
import { useT } from "@/i18n/useT";

const UpdatePassword = () => {
  const lang_1 = useT();
    const { logout } = useAuth((state) => state)
    const [showPassword, setShowPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showNewPassword2, setShowNewPassword2] = useState(false)

    const form = useForm({
        defaultValues: {
            old_password: "",
            new_password1: "",
            new_password2: "",
        },
        onSubmit: async ({ value }) => {
            mutate(value)
        },
    })
    
    const { mutate, status } = useMutation({
        mutationFn: (body: any) => updatePassword(body),
        onSuccess: () => {
            toast.success(lang_1.profile.passwordChanged);
            // New password → sign in again (overrides the default go-home-on-logout).
            logout({ redirectTo: "/auth" });
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || err?.response?.data?.old_password?.[0] || err?.response?.data?.new_password1?.[0] || err?.response?.data?.new_password2?.[0] || lang_1.profile.passwordFailed;
            toast.error(message);
        },
    });

    return (
        <section className="mt-40 flex flex-col gap-20">
            <Breadcrumb className='max-w-400 w-[90%] mx-auto'>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">{lang_1.nav.home}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/profile">{lang_1.nav.profile}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{lang_1.profile.changePassword}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <div className='max-w-xl w-[90%] mx-auto bg-white border border-zinc-300 rounded-lg p-10 flex flex-col gap-10 mb-20'>
                <h3 className='text-2xl font-semibold'>{lang_1.profile.changePassword}</h3>
                <form 
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }} 
                    className='flex flex-col gap-6'
                >
                    <FieldSet className="w-full">
                        <FieldGroup>
                            <form.Field
                                name="old_password"
                                validators={{
                                    onChange: ({ value }) => {
                                        const result = updatePasswordSchema(lang_1).shape.old_password.safeParse(value)
                                        return result.success ? undefined : result.error.issues[0].message
                                    },
                                }}
                            >
                                {(field) => {
                                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                    return (
                                        <UIField>
                                            <FieldLabel htmlFor="old_password" className='flex items-center gap-2'><Lock size={16} /> {lang_1.profile.oldPassword}</FieldLabel>
                                            <div className='relative'>
                                                <Input 
                                                    id="old_password" 
                                                    className={`h-10 rounded-r-lg! pe-8 ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`} 
                                                    type={showPassword ? "text" : "password"} 
                                                    placeholder={lang_1.profile.oldPassword} 
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)} 
                                                />
                                                <Button type="button" variant="ghost" className='h-10 absolute left-0 top-1/5 -translate-y-1/5' onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</Button>
                                            </div>
                                            {hasError && (
                                                <FieldDescription className="text-red-500">
                                                    {field.state.meta.errors[0]}
                                                </FieldDescription>
                                            )}
                                        </UIField>
                                    )
                                }}
                            </form.Field>

                            <form.Field
                                name="new_password1"
                                validators={{
                                    onChange: ({ value }) => {
                                        const result = updatePasswordSchema(lang_1).shape.new_password1.safeParse(value)
                                        return result.success ? undefined : result.error.issues[0].message
                                    },
                                }}
                            >
                                {(field) => {
                                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                    return (
                                        <UIField>
                                            <FieldLabel htmlFor="new_password1" className='flex items-center gap-2'><Lock size={16} /> {lang_1.profile.newPassword}</FieldLabel>
                                            <div className='relative'>
                                                <Input 
                                                    id="new_password1" 
                                                    className={`h-10 rounded-r-lg! pe-8 ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`} 
                                                    type={showNewPassword ? "text" : "password"} 
                                                    placeholder={lang_1.profile.newPassword} 
                                                    value={field.state.value} 
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)} 
                                                />
                                                <Button type="button" variant="ghost" className='h-10 absolute left-0 top-1/5 -translate-y-1/5' onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <EyeOff /> : <Eye />}</Button>
                                            </div>
                                            {hasError && (
                                                <FieldDescription className="text-red-500">
                                                    {field.state.meta.errors[0]}
                                                </FieldDescription>
                                            )}
                                        </UIField>
                                    )
                                }}
                            </form.Field>

                            <form.Field
                                name="new_password2"
                                validators={{
                                    onChangeListenTo: ["new_password1"],
                                    onChange: ({ value, fieldApi }) => {
                                        const result = updatePasswordSchema(lang_1).shape.new_password2.safeParse(value)
                                        if (!result.success) return result.error.issues[0].message
                                        const password = fieldApi.form.getFieldValue("new_password1")
                                        if (!value || !password || value !== password) return lang_1.profile.passwordMismatch
                                        return undefined
                                    },
                                }}
                            >
                                {(field) => {
                                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                    return (
                                        <UIField>
                                            <FieldLabel htmlFor="new_password2" className='flex items-center gap-2'><Lock size={16} /> {lang_1.profile.confirmNewPassword}</FieldLabel>
                                            <div className='relative'>
                                                <Input 
                                                    id="new_password2" 
                                                    className={`h-10 rounded-r-lg! pe-8 ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`} 
                                                    type={showNewPassword2 ? "text" : "password"} 
                                                    placeholder={lang_1.profile.retypePassword} 
                                                    value={field.state.value} 
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)} 
                                                />
                                                <Button type="button" variant="ghost" className='h-10 absolute left-0 top-1/5 -translate-y-1/5' onClick={() => setShowNewPassword2(!showNewPassword2)}>{showNewPassword2 ? <EyeOff /> : <Eye />}</Button>
                                            </div>
                                            {hasError && (
                                                <FieldDescription className="text-red-500">
                                                    {field.state.meta.errors[0]}
                                                </FieldDescription>
                                            )}
                                        </UIField>
                                    )
                                }}
                            </form.Field>
                        </FieldGroup>
                    </FieldSet>

                    <Button type="submit" disabled={form.state.isSubmitting || status === 'pending'} className='bg-[#08182D] text-white h-10 mt-4'>
                        {status === 'pending' ? lang_1.profile.saving : lang_1.profile.saveChanges}
                    </Button>
                </form>
            </div>
        </section>
    )
}

export default UpdatePassword
