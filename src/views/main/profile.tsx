"use client";

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import Advertisement from "@/components/ui/advertisement"
import { Bell, Calendar, Check, Loader2, Plus, X } from "lucide-react"
import { Field } from "@/components/ui/field"
import PropertyCard from '@/components/ui/property-card'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getProperties,
    getUser,
    updateUser,
    getFavoriteProperties,
    getFavoriteProjects,
    getMainInfo,
    getNotifications,
    getAppointmentLeads,
    updateAppointmentLeadStatus,
    getUserAppointmentHours,
    createUserAppointmentHours,
    updateUserAppointmentHours,
    type UserAppointmentHourPayload,
} from '@/server/main'
import { toast } from 'sonner'
import ListPagination from '@/components/main/pagination'
import placeholder from '@/assets/avatar.webp'
import SpecialPropertyCard from '@/components/ui/special-property-card'
import { useT } from "@/i18n/useT";
import { getCustomerProfileMedia } from '@/server/media'
import { Image } from "@/components/ui/image";
import { useAuth } from "@/store/auth-slice";
import AppointmentsModal from "@/components/main/appointments-modal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";

const formatTime24 = (timeStr?: string) => {
    if (!timeStr) return "-";
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    return timeStr;
};

const Profile = () => {
  const lang_1 = useT();
    const isAuth = useAuth(state => state.isAuth);
    const [current, setCurrent] = useState(1)
    const [page, setPage] = useState(1);
    const [premiumPage, setPremiumPage] = useState(1);
    const [notificationPage, setNotificationPage] = useState(1);
    const [appointmentPage, setAppointmentPage] = useState(1);
    const [favProjectPage, setFavProjectPage] = useState(1);
    const [favPropertyPage, setFavPropertyPage] = useState(1);
    const [acceptAds, setAcceptAds] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        appointmentId: number | string | null;
        status: "accepted" | "declined" | null;
    }>({
        open: false,
        appointmentId: null,
        status: null,
    });

    const queryClient = useQueryClient();
    const { data } = useQuery({
        queryKey: ["profile"],
        queryFn: () => getUser(),
        enabled: isAuth,
    });

    const userId = data?.pk ?? data?.id;

    const { data: mainInfo } = useQuery({
        queryKey: ["main-info"],
        queryFn: () => getMainInfo(),
    });

    const { data: myProperties } = useQuery({
        queryKey: ["properties-by-logged-in-user", page],
        queryFn: () => getProperties(page, { user: userId }),
        enabled: !!userId
    });

    const { data: notifications } = useQuery({
        queryKey: ["notifications", notificationPage],
        queryFn: () => getNotifications(notificationPage),
        enabled: !!userId
    });

    const { data: myAppointments } = useQuery({
        queryKey: ["my-appointments", userId, appointmentPage],
        queryFn: () => getAppointmentLeads(userId, { page: appointmentPage }),
        enabled: !!userId
    });

    const appointmentsList: any[] = Array.isArray(myAppointments)
        ? myAppointments
        : Array.isArray(myAppointments?.results)
        ? myAppointments.results
        : [];
    const appointmentsCount =
        typeof myAppointments?.count === "number"
            ? myAppointments.count
            : appointmentsList.length;

    const { data: premiumProperties } = useQuery({
        queryKey: ["premium-properties", premiumPage],
        queryFn: () => getProperties(premiumPage, { is_premium: true }),
    });

    const { data: favProperties } = useQuery({
        queryKey: ["favorite-properties", favPropertyPage],
        queryFn: () => getFavoriteProperties(favPropertyPage),
        enabled: !!userId
    });

    const { data: favProjects } = useQuery({
        queryKey: ["favorite-projects", favProjectPage],
        queryFn: () => getFavoriteProjects(favProjectPage),
        enabled: !!userId
    });

    const { data: media } = useQuery({
        queryKey: ["profile-media"],
        queryFn: () => getCustomerProfileMedia(),
    });


    useEffect(() => {
        if (data) {
            setAcceptAds(!!data.accept_ads);
        }
    }, [data]);

    const { mutate: updateAdsMutate, status: adsStatus } = useMutation({
        mutationFn: () => {
            const formData = new FormData();
            formData.append("accept_ads", String(acceptAds));
            return updateUser(formData);
        },
        onSuccess: () => {
            toast.success(lang_1.profile.adsSettingsUpdated);
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || lang_1.profile.errorOccurred);
        },
    });

    const { data: userAppointmentHoursData } = useQuery({
        queryKey: ["user-appointment-hours"],
        queryFn: () => getUserAppointmentHours(),
        enabled: isAuth,
    });

    const existingAppointmentHours: any[] = Array.isArray(userAppointmentHoursData)
        ? userAppointmentHoursData
        : Array.isArray(userAppointmentHoursData?.results)
        ? userAppointmentHoursData.results
        : Array.isArray(data?.appointment_hours)
        ? data.appointment_hours
        : [];

    const { mutateAsync: updateAppointmentsMutate, status: appointmentsStatus } = useMutation({
        mutationFn: (payload: UserAppointmentHourPayload[]) => {
            if (existingAppointmentHours.length > 0) {
                return updateUserAppointmentHours(payload);
            }
            return createUserAppointmentHours(payload);
        },
        onSuccess: () => {
            toast.success(lang_1.appointments.savedSuccess);
            queryClient.invalidateQueries({ queryKey: ["user-appointment-hours"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });

    const { mutate: updateLeadStatusMutate, status: leadStatusMutationState } = useMutation({
        mutationFn: ({
            appointmentId,
            status,
        }: {
            appointmentId: number | string;
            status: "accepted" | "declined";
        }) => updateAppointmentLeadStatus(appointmentId, status),
        onSuccess: () => {
            toast.success(lang_1.appointments.statusUpdatedSuccess);
            queryClient.invalidateQueries({ queryKey: ["my-appointments", userId] });
            setConfirmDialog({ open: false, appointmentId: null, status: null });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || lang_1.profile.errorOccurred);
        },
    });

    const getStatusLabel = (status?: string) => {
        const normalized = status?.toLowerCase();
        if (normalized === "accepted") return lang_1.appointments.statusAccepted;
        if (normalized === "declined" || normalized === "rejected")
            return lang_1.appointments.statusDeclined;
        return lang_1.appointments.statusPending;
    };

    const getStatusClasses = (status?: string) => {
        const normalized = status?.toLowerCase();
        if (normalized === "accepted")
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (normalized === "declined" || normalized === "rejected")
            return "bg-red-50 text-red-700 border-red-200";
        return "bg-amber-50 text-amber-700 border-amber-200";
    };

    return (
        <section className="lg:mt-40 mt-20 flex flex-col gap-20">
            <div className="flex flex-col justify-center gap-10 min-h-[30vh] max-w-400 w-[90%] mx-auto rounded-2xl border border-zinc-300  p-8 bg-white">
                <div className="relative flex lg:flex-row flex-col justify-between h-full gap-4">
                    <div className="flex lg:flex-row flex-col items-center gap-5">
                        <Image src={data?.image || placeholder.src} className='min-w-40 w-40 h-40 rounded-full object-cover' alt="avatar" />
                        <div className="flex flex-col gap-4 text-[#08182D] w-full">
                            <h3 className="font-bold text-center lg:text-start text-2xl">{data?.full_name}</h3>
                            <div className='flex flex-col lg:flex-row items-center gap-4'>
                                <p>{lang_1.profile.email}: {data?.email}</p>
                                {data?.phone && <p>{lang_1.profile.phone}: {data?.phone}</p>}
                            </div>
                            <div className='flex flex-col lg:flex-row items-center gap-4 w-full'>
                                <Link href={'/property/create'} className='w-full lg:w-fit'>
                                    <Button className='bg-[#08182D] text-white flex items-center gap-2 w-full'>{lang_1.profile.addHouse} <Plus /></Button>
                                </Link>
                                <Link href={'/profile/edit'} className='w-full lg:w-fit'>
                                    <Button className='bg-[#08182D] text-white flex items-center gap-2 w-full'>{lang_1.profile.editProfile}</Button>
                                </Link>
                                <AppointmentsModal
                                    initialData={existingAppointmentHours}
                                    onSubmitAppointments={async (appointments) => {
                                        await updateAppointmentsMutate(appointments);
                                    }}
                                    isSubmitting={appointmentsStatus === "pending"}
                                />
                                <Link href={'/profile/change-password'}>
                                    <Button className='bg-transparent text-[#08182D]'>{lang_1.profile.changePassword}</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex lg:flex-row flex-col gap-10 max-w-400 w-[90%] mx-auto">
                <div className="w-full flex flex-col gap-20">
                    <div className="flex flex-col gap-5">
                        <div className='flex border-b border-zinc-300 overflow-x-auto no-scrollbar'>
                            <button onClick={() => setCurrent(4)} className={cn(current === 4 && 'border-b-[#A97A36] text-[#A97A36]', 'font-semibold px-6 py-3 cursor-pointer border-b border-b-transparent flex items-center gap-2 relative whitespace-nowrap')}>
                                <span>{lang_1.profile.notifications}</span>
                                <span className='relative'>
                                    <span className='bg-green-500 text-white rounded-full min-w-4 h-4 px-1 inline-flex items-center justify-center text-[10px] leading-none font-bold tabular-nums absolute -top-2 -left-2'>0</span>
                                    <Bell />
                                </span>
                            </button>
                            <button onClick={() => setCurrent(5)} className={cn(current === 5 && 'border-b-[#A97A36] text-[#A97A36]', 'font-semibold px-6 py-3 cursor-pointer border-b border-b-transparent flex items-center gap-2 relative whitespace-nowrap')}>
                                <span>{lang_1.appointments.tabTitle}</span>
                                <span className='relative'>
                                    <span className='bg-[#A97A36] text-white rounded-full min-w-4 h-4 px-1 inline-flex items-center justify-center text-[10px] leading-none font-bold tabular-nums absolute -top-2 -left-2'>{appointmentsCount}</span>
                                    <Calendar className="size-5" />
                                </span>
                            </button>
                            <button onClick={() => setCurrent(1)} className={cn(current === 1 && 'border-b-[#A97A36] text-[#A97A36]', 'font-semibold px-6 py-3 cursor-pointer border-b border-b-transparent whitespace-nowrap')}>{lang_1.profile.myProperties}</button>
                            <button onClick={() => setCurrent(2)} className={cn(current === 2 && 'border-b-[#A97A36] text-[#A97A36]', 'font-semibold px-6 py-3 cursor-pointer border-b border-b-transparent whitespace-nowrap')}>{lang_1.profile.favorites}</button>
                            <button onClick={() => setCurrent(3)} className={cn(current === 3 && 'border-b-[#A97A36] text-[#A97A36]', 'font-semibold px-6 py-3 cursor-pointer border-b border-b-transparent whitespace-nowrap')}>{lang_1.profile.investProperties}</button>
                        </div>
                        {current === 1 && (<>
                            <div className="w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 ">
                                {myProperties?.results?.length ? myProperties.results.map((property: any, index: number) => (
                                    <PropertyCard data={property} grid key={property.id || index} />
                                )) : (
                                    <div className="col-span-full text-center text-[#08182D] py-10 font-bold">
                                        {lang_1.profile.noProperties}
                                    </div>
                                )}
                            </div>
                            <ListPagination
                                page={page}
                                setPage={setPage}
                                count={myProperties?.count}
                            />
                            <Advertisement ad={media?.advertisement} className="mt-5 lg:w-full h-60 bg-no-repeat bg-top bg-cover rounded-md" />
                        </>)}
                        {current === 2 && ((<>
                            <div className="flex flex-col gap-10 w-full">
                                <div className='flex flex-col gap-4'>
                                    <h3 className="font-bold text-xl">{lang_1.profile.favoriteProperties}</h3>
                                    <div className="w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 ">
                                        {favProperties?.results?.length ? favProperties.results.map((fav: any, index: number) => (
                                            <PropertyCard data={{ ...fav.property_details, is_favorite: true }} grid key={fav.id || index} />
                                        )) : (
                                            <div className="col-span-full text-center text-[#08182D] py-10 font-bold">
                                                {lang_1.profile.noFavoriteProperties}
                                            </div>
                                        )}
                                    </div>
                                    <ListPagination
                                        page={favPropertyPage}
                                        setPage={setFavPropertyPage}
                                        count={favProperties?.count}
                                    />
                                </div>
                                <div className='flex flex-col gap-4 border-t border-zinc-300 pt-10'>
                                    <h3 className="font-bold text-xl">{lang_1.profile.favoriteProjects}</h3>
                                    <div className="w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 ">
                                        {favProjects?.results?.length ? favProjects.results.map((fav: any, index: number) => (
                                            <SpecialPropertyCard data={{ ...fav.project_details, is_favorite: true }} project grid key={fav.id || index} />
                                        )) : (
                                            <div className="col-span-full text-center text-[#08182D] py-10 font-bold">
                                                {lang_1.profile.noFavoriteProjects}
                                            </div>
                                        )}
                                    </div>
                                    <ListPagination
                                        page={favProjectPage}
                                        setPage={setFavProjectPage}
                                        count={favProjects?.count}
                                    />
                                </div>
                                <Advertisement ad={media?.advertisement} className="mt-5 lg:w-full h-60 bg-no-repeat bg-top bg-cover rounded-md" />
                            </div>
                        </>))}
                        {current === 3 && (<>
                            <div className="w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 ">
                                {premiumProperties?.results?.length ? premiumProperties.results.map((property: any, index: number) => (
                                    <PropertyCard data={property} grid key={property.id || index} />
                                )) : (
                                    <div className="col-span-full text-center text-[#08182D] py-10 font-bold">
                                        {lang_1.profile.noProperties}
                                    </div>
                                )}
                            </div>
                            <ListPagination
                                page={premiumPage}
                                setPage={setPremiumPage}
                                count={premiumProperties?.count}
                            />
                            <Advertisement ad={media?.advertisement} className="mt-5 lg:w-full h-60 bg-no-repeat bg-top bg-cover rounded-md" />
                        </>)}
                        {current === 4 && (<>
                            <div className="w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 ">
                                <p className="font-semibold">{lang_1.profile.searchedProperties}</p>
                                {notifications?.results?.length ? notifications.results.map((property: any, index: number) => (
                                    <PropertyCard data={property} grid key={property.id || index} />
                                )) : (
                                    <div className="col-span-full text-center text-[#08182D] py-10 font-bold">
                                        {lang_1.profile.noProperties}
                                    </div>
                                )}
                            </div>
                            <ListPagination
                                page={notificationPage}
                                setPage={setNotificationPage}
                                count={notifications?.count}
                            />
                        </>)}
                        {current === 5 && (<>
                            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
                                {appointmentsList.length > 0 ? (
                                    <Table>
                                        <TableHeader className="bg-zinc-50">
                                            <TableRow>
                                                <TableHead className="px-4 py-3 font-bold text-[#08182D]">{lang_1.appointments.tableCustomer}</TableHead>
                                                <TableHead className="px-4 py-3 font-bold text-[#08182D]">{lang_1.appointments.tablePhone}</TableHead>
                                                <TableHead className="px-4 py-3 font-bold text-[#08182D]">{lang_1.appointments.tableEmail}</TableHead>
                                                <TableHead className="px-4 py-3 font-bold text-[#08182D]">{lang_1.appointments.tableProperty}</TableHead>
                                                <TableHead className="px-4 py-3 font-bold text-[#08182D]">{lang_1.appointments.tableDate}</TableHead>
                                                <TableHead className="px-4 py-3 font-bold text-[#08182D]">{lang_1.appointments.tableTime}</TableHead>
                                                <TableHead className="px-4 py-3 font-bold text-[#08182D]">{lang_1.appointments.tableStatus}</TableHead>
                                                <TableHead className="px-4 py-3 font-bold text-[#08182D] text-end">{lang_1.appointments.tableActions}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {appointmentsList.map((appointment: any, idx: number) => {
                                                const appointmentId = appointment.id ?? appointment.pk ?? idx;
                                                const normalizedStatus = appointment.status?.toLowerCase();
                                                const isPending = !normalizedStatus || normalizedStatus === "pending";

                                                return (
                                                    <TableRow key={appointmentId}>
                                                        <TableCell className="px-4 py-3 font-medium text-[#08182D]">
                                                            {appointment.name || "-"}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-zinc-600" dir="ltr">
                                                            {appointment.phone || "-"}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-zinc-600">
                                                            {appointment.email || "-"}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-zinc-600">
                                                            {appointment.property_slug ? (
                                                                <Link
                                                                    href={`/property/${appointment.property_slug}`}
                                                                    className="font-medium text-[#A97A36] hover:underline"
                                                                >
                                                                    {appointment.property_title || appointment.property_slug}
                                                                </Link>
                                                            ) : (
                                                                appointment.property_title || appointment.property || "-"
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 font-medium text-[#08182D]" dir="ltr">
                                                            {appointment.day || appointment.date || "-"}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-zinc-600" dir="ltr">
                                                            {formatTime24(appointment.time_from)} – {formatTime24(appointment.time_to)}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3">
                                                            <span
                                                                className={cn(
                                                                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                                                                    getStatusClasses(appointment.status)
                                                                )}
                                                            >
                                                                {getStatusLabel(appointment.status)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-end">
                                                            {isPending ? (
                                                                <div className="inline-flex items-center justify-end gap-2">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        disabled={leadStatusMutationState === "pending"}
                                                                        onClick={() =>
                                                                            setConfirmDialog({
                                                                                open: true,
                                                                                appointmentId,
                                                                                status: "accepted",
                                                                            })
                                                                        }
                                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs flex items-center gap-1"
                                                                    >
                                                                        <Check className="size-3.5" />
                                                                        <span>{lang_1.appointments.acceptBtn}</span>
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        disabled={leadStatusMutationState === "pending"}
                                                                        onClick={() =>
                                                                            setConfirmDialog({
                                                                                open: true,
                                                                                appointmentId,
                                                                                status: "declined",
                                                                            })
                                                                        }
                                                                        className="h-8 px-3 text-xs flex items-center gap-1"
                                                                    >
                                                                        <X className="size-3.5" />
                                                                        <span>{lang_1.appointments.declineBtn}</span>
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-zinc-400 text-xs">—</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center text-[#08182D] py-10 font-bold">
                                        {lang_1.appointments.noBookedAppointments}
                                    </div>
                                )}
                            </div>
                            {typeof myAppointments?.count === "number" && (
                                <ListPagination
                                    page={appointmentPage}
                                    setPage={setAppointmentPage}
                                    count={myAppointments?.count}
                                />
                            )}
                            <Advertisement ad={media?.advertisement} className="mt-5 lg:w-full h-60 bg-no-repeat bg-top bg-cover rounded-md" />

                            <Dialog
                                open={confirmDialog.open}
                                onOpenChange={(open) => {
                                    if (!open) {
                                        setConfirmDialog({
                                            open: false,
                                            appointmentId: null,
                                            status: null,
                                        });
                                    }
                                }}
                            >
                                <DialogContent className="sm:max-w-md p-6">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-bold text-[#08182D]">
                                            {confirmDialog.status === "accepted"
                                                ? lang_1.appointments.confirmAcceptTitle
                                                : lang_1.appointments.confirmDeclineTitle}
                                        </DialogTitle>
                                        <DialogDescription className="text-zinc-600">
                                            {confirmDialog.status === "accepted"
                                                ? lang_1.appointments.confirmAcceptDesc
                                                : lang_1.appointments.confirmDeclineDesc}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="-mx-6 -mb-6 mt-4 gap-2 sm:justify-end">
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline" className="h-9">
                                                {lang_1.appointments.cancel}
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="button"
                                            disabled={leadStatusMutationState === "pending"}
                                            variant={
                                                confirmDialog.status === "declined"
                                                    ? "destructive"
                                                    : "default"
                                            }
                                            onClick={() => {
                                                if (
                                                    confirmDialog.appointmentId !== null &&
                                                    confirmDialog.status
                                                ) {
                                                    updateLeadStatusMutate({
                                                        appointmentId: confirmDialog.appointmentId,
                                                        status: confirmDialog.status,
                                                    });
                                                }
                                            }}
                                            className={cn(
                                                "h-9",
                                                confirmDialog.status === "accepted" &&
                                                    "bg-emerald-600 hover:bg-emerald-700 text-white"
                                            )}
                                        >
                                            {leadStatusMutationState === "pending" ? (
                                                <Loader2 className="animate-spin size-4" />
                                            ) : confirmDialog.status === "accepted" ? (
                                                lang_1.appointments.acceptBtn
                                            ) : (
                                                lang_1.appointments.declineBtn
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>)}
                    </div>
                </div>

                <div className="max-w-120 w-full">
                    <div className="bg-white border border-zinc-300 p-5 rounded-lg flex flex-col gap-10">
                        <h3 className="font-bold text-2xl">{lang_1.profile.receiveAds}</h3>
                        <p>{mainInfo?.ad_text}</p>
                        <Field orientation="horizontal">
                            <Checkbox
                                id="terms-checkbox"
                                name="terms-checkbox"
                                checked={acceptAds}
                                onCheckedChange={(checked) => setAcceptAds(checked === true)}
                            />
                            <Label htmlFor="terms-checkbox">{lang_1.profile.agreeToAds}</Label>
                        </Field>
                        <Button
                            onClick={() => updateAdsMutate()}
                            disabled={adsStatus === 'pending'}
                            className="bg-[#131927] border-[#131927] text-white hover:opacity-75 py-2 lg:flex-1 h-10!">
                            {adsStatus === 'pending' ? <Loader2 className="animate-spin" /> : lang_1.profile.save}
                        </Button>
                    </div>
                </div>

            </div>


        </section>
    )
}

export default Profile
