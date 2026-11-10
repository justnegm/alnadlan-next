import { useState, useMemo, useCallback, useEffect } from "react";
import {
    ArrowRight,
    Calendar as CalendarIcon,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createAppointmentLead, getAppointmentLeads } from "@/server/main";
import { lang_1 } from "@/lib/lang_1";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-slice";
import type { DayKey } from "./appointments-modal";

export interface AppointmentHourSlot {
    id?: number;
    day: string;
    time_from: string;
    time_to: string;
}

interface BookedAppointment {
    id?: number;
    day?: string;
    date?: string;
    time_from?: string;
    time_to?: string;
    status?: string;
}

interface GeneratedSlot {
    fromMin: number;
    toMin: number;
    time_from: string;
    time_to: string;
    isBooked: boolean;
}

interface PropertyAppointmentCalendarProps {
    appointmentHours?: AppointmentHourSlot[];
    propertyId?: number | string;
    brokerId?: number | string;
    currentUser?: any;
    userDuration?: number;
}

const DAY_INDEX_TO_KEY: DayKey[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

const formatTime24 = (timeStr?: string) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    return timeStr;
};

const timeToMinutes = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    const hours = Number(parts[0]) || 0;
    const minutes = Number(parts[1]) || 0;
    return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const formatDateYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const PropertyAppointmentCalendar = ({
    appointmentHours = [],
    propertyId,
    brokerId,
    currentUser,
    userDuration,
}: PropertyAppointmentCalendarProps) => {
    const { isAuth } = useAuth((state) => state);
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    // Duration in minutes (defaults to 60; will come from backend property user object)
    const duration = Number(userDuration) > 0 ? Number(userDuration) : 60;

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const [step, setStep] = useState<1 | 2>(1);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<GeneratedSlot | null>(null);

    // Fetch booked appointments with status=accepted for this broker without filtering to single day
    const { data: bookedData } = useQuery({
        queryKey: ["booked-appointments", brokerId],
        queryFn: () =>
            getAppointmentLeads(brokerId!, {
                status: "accepted",
            }),
        enabled: !!brokerId,
    });

    const bookedAppointments: BookedAppointment[] = useMemo(() => {
        if (Array.isArray(bookedData)) return bookedData;
        if (Array.isArray(bookedData?.results)) return bookedData.results;
        return [];
    }, [bookedData]);

    const slotsByDay = useMemo(() => {
        const map: Record<string, AppointmentHourSlot[]> = {};
        if (Array.isArray(appointmentHours)) {
            for (const slot of appointmentHours) {
                const key = slot?.day?.toLowerCase()?.trim();
                if (!key) continue;
                if (!map[key]) map[key] = [];
                map[key].push(slot);
            }
        }
        return map;
    }, [appointmentHours]);

    // Split each day's working hour ranges into `duration`-minute slots and flag individually booked slots
    const getSlotsForDate = useCallback(
        (date: Date): GeneratedSlot[] => {
            const dayKey = DAY_INDEX_TO_KEY[date.getDay()];
            const daySlots = slotsByDay[dayKey] || [];
            if (daySlots.length === 0) return [];

            const dateStr = formatDateYYYYMMDD(date);
            const generated: GeneratedSlot[] = [];

            for (const slot of daySlots) {
                const startMin = timeToMinutes(slot.time_from);
                const endMin = timeToMinutes(slot.time_to);
                if (endMin <= startMin) continue;

                for (let m = startMin; m + duration <= endMin; m += duration) {
                    const slotFrom = m;
                    const slotTo = m + duration;

                    const isBooked = bookedAppointments.some((booked) => {
                        const bookedDay = (booked.day || booked.date || "").slice(0, 10);
                        if (bookedDay !== dateStr) return false;
                        const bFrom = timeToMinutes(booked.time_from);
                        const bTo = timeToMinutes(booked.time_to);
                        return slotFrom < bTo && slotTo > bFrom;
                    });

                    const existingIndex = generated.findIndex(
                        (g) => g.fromMin === slotFrom && g.toMin === slotTo
                    );

                    if (existingIndex === -1) {
                        generated.push({
                            fromMin: slotFrom,
                            toMin: slotTo,
                            time_from: minutesToTime(slotFrom),
                            time_to: minutesToTime(slotTo),
                            isBooked,
                        });
                    } else if (!isBooked) {
                        // If defined in another range and available, mark as available
                        generated[existingIndex].isBooked = false;
                    }
                }
            }

            return generated.sort((a, b) => a.fromMin - b.fromMin);
        },
        [slotsByDay, bookedAppointments, duration]
    );

    // Find the first month starting from today that actually has working days
    const firstAvailableMonth = useMemo(() => {
        const defaultMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        if (Object.keys(slotsByDay).length === 0) return defaultMonth;

        const cursor = new Date(today);
        for (let i = 0; i < 365; i++) {
            if (getSlotsForDate(cursor).length > 0) {
                return new Date(cursor.getFullYear(), cursor.getMonth(), 1);
            }
            cursor.setDate(cursor.getDate() + 1);
        }

        return defaultMonth;
    }, [today, slotsByDay, getSlotsForDate]);

    const [viewMonth, setViewMonth] = useState<Date>(() => firstAvailableMonth);

    useEffect(() => {
        setViewMonth(firstAvailableMonth);
    }, [firstAvailableMonth]);

    const calendarDays = useMemo(() => {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startWeekday = firstDayOfMonth.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const cells: (Date | null)[] = [];
        for (let i = 0; i < startWeekday; i++) {
            cells.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push(new Date(year, month, d));
        }
        return cells;
    }, [viewMonth]);

    const slotsForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return getSlotsForDate(selectedDate);
    }, [selectedDate, getSlotsForDate]);

    const customerId = currentUser?.pk ?? currentUser?.id;

    const { mutate: bookMutate, status } = useMutation({
        mutationFn: (payload: {
            customer: number | string;
            broker: number | string;
            property: number | string;
            name: string;
            email: string;
            phone: string;
            day: string;
            time_from: string;
            time_to: string;
        }) => createAppointmentLead(brokerId ?? "", payload),
        onSuccess: () => {
            toast.success(lang_1.appointments.bookingSuccess);
            queryClient.invalidateQueries({
                queryKey: ["booked-appointments", brokerId],
            });
            setSelectedSlot(null);
            setSelectedDate(null);
            setStep(1);
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                lang_1.appointments.bookingError
            );
        },
    });

    const handlePrevMonth = () => {
        setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
        const slots = getSlotsForDate(date);
        const availableSlots = slots.filter((s) => !s.isBooked);
        setSelectedSlot(availableSlots.length === 1 ? availableSlots[0] : null);
        setStep(2);
    };

    const handleBackToCalendar = () => {
        setStep(1);
    };

    const handleBookAppointment = () => {
        if (!isAuth || !customerId) {
            toast.info(lang_1.contact.logincalenderToSend);
            navigate("/auth", { state: { from: location.pathname + location.search } });
            return;
        }

        if (!selectedDate || !selectedSlot) {
            toast.error(lang_1.appointments.pleaseSelectDateAndTime);
            return;
        }

        if (selectedSlot.isBooked) {
            toast.error(lang_1.appointments.slotUnavailableOrBooked);
            return;
        }

        const fromMin = timeToMinutes(selectedSlot.time_from);
        const toMin = timeToMinutes(selectedSlot.time_to);

        if (fromMin >= toMin) {
            toast.error(lang_1.appointments.invalidTimeRange);
            return;
        }

        const isStillValid = slotsForSelectedDate.some(
            (slot) =>
                slot.time_from === selectedSlot.time_from &&
                slot.time_to === selectedSlot.time_to &&
                !slot.isBooked
        );

        if (!isStillValid) {
            toast.error(lang_1.appointments.slotUnavailableOrBooked);
            return;
        }

        bookMutate({
            customer: customerId,
            broker: brokerId ?? "",
            property: propertyId ?? "",
            name: currentUser?.full_name || "",
            email: currentUser?.email || "",
            phone: currentUser?.phone || "",
            day: formatDateYYYYMMDD(selectedDate),
            time_from: formatTime24(selectedSlot.time_from),
            time_to: formatTime24(selectedSlot.time_to),
        });
    };

    const canGoPrevMonth =
        viewMonth.getFullYear() > firstAvailableMonth.getFullYear() ||
        (viewMonth.getFullYear() === firstAvailableMonth.getFullYear() &&
            viewMonth.getMonth() > firstAvailableMonth.getMonth());

    const hasAnyAppointments = Object.keys(slotsByDay).length > 0;

    return (
        <div className="bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 flex flex-col gap-5 transition-all">
            {/* Header & Step Pill */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-[#08182D]">
                        <CalendarIcon className="size-4.5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg tracking-tight text-[#1D1D1F]">
                            {lang_1.appointments.bookTitle}
                        </h3>
                        {hasAnyAppointments && (
                            <p className="text-xs text-[#86868B]">
                                {step === 1
                                    ? lang_1.appointments.selectDateHint
                                    : lang_1.appointments.selectTimeSlot}
                            </p>
                        )}
                    </div>
                </div>

                {hasAnyAppointments && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-3 py-1 text-xs font-medium text-[#1D1D1F]">
                        <span
                            className={cn(
                                "size-2 rounded-full transition-colors",
                                step === 1 ? "bg-[#08182D]" : "bg-[#A97A36]"
                            )}
                        />
                        <span>{step}/2</span>
                    </div>
                )}
            </div>

            {!hasAnyAppointments ? (
                <div className="rounded-2xl bg-[#F5F5F7]/70 py-8 px-4 text-center">
                    <p className="text-sm text-[#86868B] font-medium">
                        {lang_1.appointments.noAvailableAppointments}
                    </p>
                </div>
            ) : (
                <div className="min-h-[340px] flex flex-col">
                    {step === 1 ? (
                        /* STEP 1: Calendar View */
                        <div className="flex-1 rounded-2xl bg-[#F5F5F7]/70 p-4 flex flex-col justify-between gap-4 animate-in fade-in duration-200">
                            <div className="flex flex-col gap-4">
                                {/* Month Selector */}
                                <div className="flex items-center justify-between px-1">
                                    <button
                                        type="button"
                                        disabled={!canGoPrevMonth}
                                        onClick={handlePrevMonth}
                                        className="size-8 rounded-full bg-[#08182D] text-white shadow-xs flex items-center justify-center hover:bg-[#A97A36] disabled:bg-zinc-200 disabled:text-zinc-400 disabled:pointer-events-none transition-all cursor-pointer"
                                    >
                                        <ChevronRight className="size-4 rtl:rotate-0 ltr:rotate-180" />
                                    </button>
                                    <span className="font-semibold text-sm tracking-tight text-[#1D1D1F]">
                                        {lang_1.appointments.months[viewMonth.getMonth()]}{" "}
                                        {viewMonth.getFullYear()}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleNextMonth}
                                        className="size-8 rounded-full bg-[#08182D] text-white shadow-xs flex items-center justify-center hover:bg-[#A97A36] transition-all cursor-pointer"
                                    >
                                        <ChevronLeft className="size-4 rtl:rotate-0 ltr:rotate-180" />
                                    </button>
                                </div>

                                {/* Weekday Names (Sunday -> Saturday) */}
                                <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                                    {DAY_INDEX_TO_KEY.map((dayKey) => (
                                        <div key={dayKey} className="py-1">
                                            {lang_1.appointments.daysShort[dayKey]}
                                        </div>
                                    ))}
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 gap-1.5 text-center">
                                    {calendarDays.map((date, idx) => {
                                        if (!date) {
                                            return (
                                                <div
                                                    key={`empty-${idx}`}
                                                    className="aspect-square"
                                                />
                                            );
                                        }

                                        const isPast = date < today;
                                        const slots = !isPast ? getSlotsForDate(date) : [];
                                        const isWorkDay = slots.length > 0;
                                        const isAllBooked = isWorkDay && slots.every((s) => s.isBooked);
                                        const canSelect = isWorkDay && !isAllBooked;

                                        const isSelected =
                                            selectedDate &&
                                            formatDateYYYYMMDD(selectedDate) ===
                                            formatDateYYYYMMDD(date);

                                        return (
                                            <button
                                                key={formatDateYYYYMMDD(date)}
                                                type="button"
                                                disabled={!canSelect}
                                                onClick={() => handleSelectDate(date)}
                                                title={isAllBooked ? lang_1.appointments.allSlotsBooked : undefined}
                                                className={cn(
                                                    "aspect-square w-full rounded-2xl text-xs font-medium flex flex-col items-center justify-center transition-all duration-150 relative select-none",
                                                    isSelected
                                                        ? "bg-[#08182D] text-white font-semibold shadow-sm scale-[0.98]"
                                                        : canSelect
                                                            ? "bg-white text-[#1D1D1F] hover:bg-[#08182D] hover:text-white shadow-2xs border border-zinc-200/60 cursor-pointer font-semibold active:scale-95 group"
                                                            : isAllBooked
                                                                ? "bg-zinc-100 text-zinc-400 line-through cursor-not-allowed opacity-60"
                                                                : "text-[#86868B]/40 cursor-not-allowed"
                                                )}
                                            >
                                                <span>{date.getDate()}</span>
                                                {canSelect && (
                                                    <span
                                                        className={cn(
                                                            "size-1 rounded-full mt-0.5 transition-colors",
                                                            isSelected
                                                                ? "bg-[#A97A36]"
                                                                : "bg-[#A97A36] group-hover:bg-white"
                                                        )}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* STEP 2: Time Slots View */
                        <div className="flex-1 flex flex-col justify-between gap-4 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            <div className="flex flex-col gap-4">
                                {/* Back button + Selected Date Summary Pill */}
                                <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#F5F5F7] p-3">
                                    <button
                                        type="button"
                                        onClick={handleBackToCalendar}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#08182D] hover:opacity-75 transition-opacity cursor-pointer"
                                    >
                                        <ArrowRight className="size-3.5 rtl:rotate-0 ltr:rotate-180" />
                                        <span>{lang_1.appointments.backToCalendar}</span>
                                    </button>

                                    {selectedDate && (
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1D1D1F] shadow-2xs border border-zinc-200/60">
                                            {
                                                lang_1.appointments.days[
                                                DAY_INDEX_TO_KEY[
                                                selectedDate.getDay()
                                                ]
                                                ]
                                            }{" "}
                                            · {formatDateYYYYMMDD(selectedDate)}
                                        </span>
                                    )}
                                </div>

                                {/* Time Slots Grid (each choice is a single `from - to` interval of `duration` minutes) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[210px] overflow-y-auto pr-0.5">
                                    {slotsForSelectedDate.map((slot) => {
                                        const isSlotSelected =
                                            selectedSlot?.time_from === slot.time_from &&
                                            selectedSlot?.time_to === slot.time_to &&
                                            !slot.isBooked;

                                        return (
                                            <button
                                                key={`${slot.time_from}-${slot.time_to}`}
                                                type="button"
                                                dir="ltr"
                                                disabled={slot.isBooked}
                                                onClick={() => !slot.isBooked && setSelectedSlot(slot)}
                                                className={cn(
                                                    "flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                                                    slot.isBooked
                                                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/60 opacity-60"
                                                        : isSlotSelected
                                                            ? "bg-[#08182D] text-white shadow-sm ring-2 ring-[#08182D]/20 cursor-pointer"
                                                            : "bg-[#F5F5F7]/80 text-[#1D1D1F] hover:bg-[#F5F5F7] border border-transparent hover:border-zinc-300/80 cursor-pointer"
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Clock
                                                        className={cn(
                                                            "size-4 shrink-0",
                                                            slot.isBooked
                                                                ? "text-zinc-400"
                                                                : isSlotSelected
                                                                    ? "text-[#A97A36]"
                                                                    : "text-[#86868B]"
                                                        )}
                                                    />
                                                    <span className={cn("tracking-tight font-semibold", slot.isBooked && "line-through")}>
                                                        {formatTime24(slot.time_from)} –{" "}
                                                        {formatTime24(slot.time_to)}
                                                    </span>
                                                </div>

                                                <div
                                                    className={cn(
                                                        "size-5 rounded-full flex items-center justify-center transition-colors text-[10px] font-bold",
                                                        slot.isBooked
                                                            ? "bg-zinc-200 text-zinc-500 border border-zinc-300"
                                                            : isSlotSelected
                                                                ? "bg-[#A97A36] text-white"
                                                                : "border border-zinc-300 bg-white"
                                                    )}
                                                >
                                                    {isSlotSelected ? (
                                                        <Check className="size-3 stroke-[2.5]" />
                                                    ) : slot.isBooked ? (
                                                        "✕"
                                                    ) : null}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Submit Button pinned to bottom */}
                            <Button
                                type="button"
                                disabled={
                                    status === "pending" ||
                                    (isAuth && (!selectedDate || !selectedSlot || selectedSlot.isBooked))
                                }
                                onClick={handleBookAppointment}
                                className="bg-[#08182D] hover:bg-[#08182D]/90 text-white w-full h-11 rounded-full font-semibold text-sm shadow-xs transition-all"
                            >
                                {status === "pending" ? (
                                    <Loader2 className="animate-spin size-4" />
                                ) : !isAuth ? (
                                    lang_1.contact.logincalenderToSend
                                ) : (
                                    lang_1.appointments.confirmBooking
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PropertyAppointmentCalendar;
