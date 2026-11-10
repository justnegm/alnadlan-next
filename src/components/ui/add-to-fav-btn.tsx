"use client";

import { Button } from './button'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner';
import { lang_1 } from '@/lib/lang_1';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFavorite, removeFavoriteProject, removeFavoriteProperty } from '@/server/main';



const AddToFavBtn = ({ project, data, black }: { project: any, data: any, black?: boolean }) => {

    const queryClient = useQueryClient();

    const { mutate: handleFavoriteMutate, status: favStatus } = useMutation({
        mutationFn: async () => {
            if (data?.is_favorite) {
                if (project) {
                    return removeFavoriteProject(data.slug);
                } else {
                    return removeFavoriteProperty(data.slug);
                }
            } else {
                if (project) {
                    return addFavorite({ project: data.slug });
                } else {
                    return addFavorite({ property: data.slug });
                }
            }
        },
        onSuccess: () => {
            toast.success(data?.is_favorite ? lang_1.details.removedFromFavorites : lang_1.details.addedToFavorites)
            queryClient.invalidateQueries()
        },
        onError: () => {
            toast.error(lang_1.details.loginFirstError)
        }
    })
    return (
        <Button disabled={favStatus === 'pending'} onClick={() => handleFavoriteMutate()} className={cn('bg-transparent w-10 p-0 hover:bg-transparent', black ? 'text-black' : 'text-white')}>
            <Heart className={cn(data?.is_favorite && 'fill-[#A97A36] text-[#A97A36]')} />
        </Button>
    )
}

export default AddToFavBtn