"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useRef, useEffect } from "react"
import type { ChangeEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getUser, updateUser } from "@/server/main"
import { toast } from "sonner"
import { useRouter } from "@/i18n/navigation"
import { User, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { useT } from "@/i18n/useT";
import { Image } from "@/components/ui/image";

const ProfileEdit = () => {
  const lang_1 = useT();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: userData } = useQuery({
        queryKey: ["profile"],
        queryFn: () => getUser(),
    });

    const [userForm, setUserForm] = useState({
        full_name: "",
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (userData) {
            setUserForm({
                full_name: userData.full_name || "",
            });
            if (userData.image) {
                setImagePreview(userData.image);
            }
        }
    }, [userData]);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const { mutate, status } = useMutation({
        mutationFn: (formData: any) => updateUser(formData),
        onSuccess: () => {
            toast.success(lang_1.profile.profileUpdated);
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            router.push("/profile");
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || lang_1.profile.errorOccurred;
            toast.error(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();

        if (userForm.full_name) formData.append("full_name", userForm.full_name);

        if (imageFile) {
            formData.append("image", imageFile);
        } else if (!imagePreview && userData?.image) {
            formData.append("image", "");
        }

        mutate(formData);
    };

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
                        <BreadcrumbPage>{lang_1.profile.editProfile}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className='max-w-2xl w-[90%] mx-auto bg-white border border-zinc-300 rounded-lg p-10 flex flex-col gap-10 mb-20'>
                <h3 className='text-2xl font-semibold'>{lang_1.profile.editProfile}</h3>
                <form onSubmit={handleSubmit} className='flex flex-col gap-6'>

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border border-gray-300 overflow-hidden relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                                        <ImageIcon size={32} />
                                        <span className="text-xs mt-2">{lang_1.profile.chooseImage}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-sm font-semibold">{lang_1.profile.changeImage}</span>
                                </div>
                            </div>
                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setImagePreview(null);
                                        setImageFile(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = "";
                                        }
                                    }}
                                    className="absolute top-0 right-0 bg-[#08182D] text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                    </div>

                    <Field>
                        <FieldLabel htmlFor="full_name" className='flex items-center gap-2'><User size={16} /> {lang_1.profile.fullName}</FieldLabel>
                        <Input
                            id="full_name"
                            className="h-10"
                            placeholder={lang_1.profile.fullName}
                            value={userForm.full_name}
                            onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                        />
                    </Field>

                    <Button type="submit" disabled={status === 'pending'} className='bg-[#08182D] text-white h-10 mt-4'>
                        {status === 'pending' ? <Loader2 className='animate-spin' /> : lang_1.profile.saveChanges}
                    </Button>
                </form>
            </div>
        </section>
    )
}

export default ProfileEdit
