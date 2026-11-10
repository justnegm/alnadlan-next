import { Link, useNavigate, useParams } from 'react-router';
import logo from '@/assets/logo.jpeg'
import { useMutation } from '@tanstack/react-query';
import { verify } from '@/server/auth';
import { toast } from 'sonner';
import { useEffect } from 'react';
import Loader from '@/components/ui/loader';
import { lang_1 } from '@/lib/lang_1';
import { Image } from "@/components/ui/image";
const VerifyEmail = () => {
    const navigate = useNavigate();
    const { key } = useParams();
    const { mutate, status } = useMutation({
        mutationFn: () => verify({ key }),
        onSuccess: (res) => {
            toast.success(res?.detail || lang_1.auth.accountActivated);
            setTimeout(() => {
                navigate("/auth");
            }, 3000);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || lang_1.auth.errorOccurred);
        },
    });


    useEffect(() => {
        if (key) {
            mutate()
        }
    }, [])

    if (status === "pending") {
        return (
            <Loader />
        )
    }

    return (
        <section className='max-w-400 w-[90%] mx-auto flex items-center h-full'>
            <div className='flex flex-col gap-4 max-w-125 w-full rounded-3xl bg-white p-4 py-8'>
                <Link to={'/'}>
                    <Image src={logo} alt="logo" className='w-50 mx-auto aspect-square' />
                </Link>
                <p className='text-xl font-semibold text-center'>{lang_1.auth.accountActivated}</p>
                <Link to={'/auth'} className='text-sm underline underline-offset-2 text-zinc-600 text-center'>
                    {lang_1.auth.loginVariant}
                </Link>
            </div>
        </section>
    )
}

export default VerifyEmail