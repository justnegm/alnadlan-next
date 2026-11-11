"use client";

import { useState, useEffect } from "react";
import { CalendarClock, Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import type { UserAppointmentHourPayload } from "@/server/main";

export type DayKey =
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday";

export interface TimeSlot {
    from: string;
    to: string;
}

export interface DayAppointment {
    day: DayKey;
    checked: boolean;
    slots: TimeSlot[];
}

const FIXED_DAYS: DayKey[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

const HOURS_24 = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
);

const MINUTES = Array.from({ length: 12 }, (_, i) =>
    String(i * 5).padStart(2, "0")
);

const normalizeToHHMM = (timeStr?: string, fallback = "09:00") => {
    if (!timeStr) return fallback;
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    return fallback;
};

interface TimePicker24hProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
}

const TimePicker24h = ({ id, value, onChange }: TimePicker24hProps) => {
    const [rawHour = "09", rawMinute = "00"] = (value || "09:00").split(":");
    const hour = HOURS_24.includes(rawHour) ? rawHour : "09";
    const minute = MINUTES.includes(rawMinute) ? rawMinute : "00";

    return (
        <div
            id={id}
            dir="ltr"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-input bg-white px-2.5 text-sm text-[#08182D] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
        >
            <select
                aria-label="Hours (24h)"
                value={hour}
                onChange={(e) => onChange(`${e.target.value}:${minute}`)}
                className="bg-transparent font-medium outline-none cursor-pointer appearance-none text-center px-0.5"
            >
                {HOURS_24.map((h) => (
                    <option key={h} value={h}>
                        {h}
                    </option>
                ))}
            </select>
            <span className="font-semibold text-zinc-400 select-none">:</span>
            <select
                aria-label="Minutes"
                value={minute}
                onChange={(e) => onChange(`${hour}:${e.target.value}`)}
                className="bg-transparent font-medium outline-none cursor-pointer appearance-none text-center px-0.5"
            >
                {MINUTES.map((m) => (
                    <option key={m} value={m}>
                        {m}
                    </option>
                ))}
            </select>
            <Clock className="size-3.5 text-zinc-400 ms-1 pointer-events-none shrink-0" />
        </div>
    );
};

const getDefaultSchedule = (): DayAppointment[] =>
    FIXED_DAYS.map((day) => ({
        day,
        checked: false,
        slots: [{ from: "09:00", to: "17:00" }],
    }));

interface AppointmentsModalProps {
    initialData?: any[];
    onSubmitAppointments?: (
        payload: UserAppointmentHourPayload[]
    ) => Promise<void> | void;
    isSubmitting?: boolean;
}

const AppointmentsModal = ({
    initialData,
    onSubmitAppointments,
    isSubmitting = false,
}: AppointmentsModalProps) => {
  const lang_1 = useT();
    const [open, setOpen] = useState(false);
    const [schedule, setSchedule] = useState<DayAppointment[]>(getDefaultSchedule);

    useEffect(() => {
        if (initialData && Array.isArray(initialData) && initialData.length > 0) {
            setSchedule(
                FIXED_DAYS.map((day) => {
                    const matchingItems = initialData.filter(
                        (item) => item?.day?.toLowerCase()?.trim() === day
                    );

                    if (matchingItems.length === 0) {
                        return {
                            day,
                            checked: false,
                            slots: [{ from: "09:00", to: "17:00" }],
                        };
                    }

                    // Support both flat [{ day, time_from, time_to }] and nested [{ day, checked, slots }]
                    const first = matchingItems[0];
                    if (Array.isArray(first?.slots)) {
                        return {
                            day,
                            checked: first.checked ?? true,
                            slots:
                                first.slots.length > 0
                                    ? first.slots.map((s: any) => ({
                                          from: normalizeToHHMM(
                                              s?.from || s?.time_from,
                                              "09:00"
                                          ),
                                          to: normalizeToHHMM(
                                              s?.to || s?.time_to,
                                              "17:00"
                                          ),
                                      }))
                                    : [{ from: "09:00", to: "17:00" }],
                        };
                    }

                    return {
                        day,
                        checked: true,
                        slots: matchingItems.map((item) => ({
                            from: normalizeToHHMM(
                                item?.time_from || item?.from,
                                "09:00"
                            ),
                            to: normalizeToHHMM(
                                item?.time_to || item?.to,
                                "17:00"
                            ),
                        })),
                    };
                })
            );
        }
    }, [initialData]);

    const handleToggleDay = (day: DayKey, checked: boolean) => {
        setSchedule((prev) =>
            prev.map((item) =>
                item.day === day
                    ? {
                          ...item,
                          checked,
                          slots:
                              item.slots.length > 0
                                  ? item.slots
                                  : [{ from: "09:00", to: "17:00" }],
                      }
                    : item
            )
        );
    };

    const handleSlotTimeChange = (
        day: DayKey,
        slotIndex: number,
        field: "from" | "to",
        value: string
    ) => {
        setSchedule((prev) =>
            prev.map((item) =>
                item.day === day
                    ? {
                          ...item,
                          slots: item.slots.map((slot, idx) =>
                              idx === slotIndex
                                  ? { ...slot, [field]: value }
                                  : slot
                          ),
                      }
                    : item
            )
        );
    };

    const handleAddSlot = (day: DayKey) => {
        setSchedule((prev) =>
            prev.map((item) => {
                if (item.day !== day) return item;
                const lastSlot = item.slots[item.slots.length - 1];
                const lastToHour = lastSlot
                    ? parseInt(lastSlot.to.split(":")[0], 10)
                    : 9;
                const nextFromHour = Math.min(lastToHour + 1, 22);
                const nextToHour = Math.min(nextFromHour + 1, 23);

                const newSlot: TimeSlot = {
                    from: `${String(nextFromHour).padStart(2, "0")}:00`,
                    to: `${String(nextToHour).padStart(2, "0")}:00`,
                };

                return {
                    ...item,
                    slots: [...item.slots, newSlot],
                };
            })
        );
    };

    const handleRemoveSlot = (day: DayKey, slotIndex: number) => {
        setSchedule((prev) =>
            prev.map((item) => {
                if (item.day !== day) return item;
                const updatedSlots = item.slots.filter(
                    (_, idx) => idx !== slotIndex
                );
                return {
                    ...item,
                    checked: updatedSlots.length > 0 ? item.checked : false,
                    slots:
                        updatedSlots.length > 0
                            ? updatedSlots
                            : [{ from: "09:00", to: "17:00" }],
                };
            })
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const selectedDays = schedule.filter((item) => item.checked);

        for (const item of selectedDays) {
            for (const slot of item.slots) {
                if (!slot.from || !slot.to) {
                    toast.error(lang_1.appointments.timeRequired);
                    return;
                }
                if (slot.from >= slot.to) {
                    toast.error(
                        `${lang_1.appointments.days[item.day]}: ${lang_1.appointments.invalidTimeRange}`
                    );
                    return;
                }
            }

            const sortedSlots = [...item.slots].sort((a, b) =>
                a.from.localeCompare(b.from)
            );
            for (let i = 1; i < sortedSlots.length; i++) {
                if (sortedSlots[i].from < sortedSlots[i - 1].to) {
                    toast.error(
                        `${lang_1.appointments.days[item.day]}: ${lang_1.appointments.overlappingSlots}`
                    );
                    return;
                }
            }
        }

        const payload: UserAppointmentHourPayload[] = selectedDays.flatMap(
            (item) =>
                item.slots.map((slot) => ({
                    day: item.day,
                    time_from: slot.from,
                    time_to: slot.to,
                }))
        );

        try {
            if (onSubmitAppointments) {
                await onSubmitAppointments(payload);
            } else {
                toast.success(lang_1.appointments.savedSuccess);
            }
            setOpen(false);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || lang_1.profile.errorOccurred
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    className="bg-[#A97A36] hover:bg-[#A97A36]/90 text-white flex items-center gap-2 w-full lg:w-fit"
                >
                    <span>{lang_1.appointments.button}</span>
                    <CalendarClock className="size-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#08182D] flex items-center gap-2">
                        <CalendarClock className="size-5 text-[#A97A36]" />
                        <span>{lang_1.appointments.title}</span>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-600">
                        {lang_1.appointments.description}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
                    <div className="flex flex-col gap-2.5">
                        {schedule.map((item) => {
                            const checkboxId = `appointment-day-${item.day}`;
                            return (
                                <div
                                    key={item.day}
                                    className={cn(
                                        "flex flex-col gap-3 rounded-xl border p-3 transition-colors",
                                        item.checked
                                            ? "border-[#A97A36]/60 bg-[#A97A36]/5"
                                            : "border-zinc-200 bg-zinc-50/50"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id={checkboxId}
                                                checked={item.checked}
                                                onCheckedChange={(val) =>
                                                    handleToggleDay(
                                                        item.day,
                                                        val === true
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={checkboxId}
                                                className="font-semibold text-[#08182D] cursor-pointer select-none"
                                            >
                                                {lang_1.appointments.days[item.day]}
                                            </Label>
                                        </div>

                                        {item.checked ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleAddSlot(item.day)
                                                }
                                                className="h-7 px-2.5 text-xs border-[#A97A36]/50 text-[#A97A36] hover:bg-[#A97A36]/10 flex items-center gap-1"
                                            >
                                                <Plus className="size-3.5" />
                                                <span>
                                                    {lang_1.appointments.addSlot}
                                                </span>
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                                                <Clock className="size-3.5" />
                                                {lang_1.appointments.unavailable}
                                            </span>
                                        )}
                                    </div>

                                    {item.checked && (
                                        <div className="flex flex-col gap-2 ps-6 border-t border-[#A97A36]/20 pt-2.5">
                                            {item.slots.map((slot, slotIdx) => (
                                                <div
                                                    key={slotIdx}
                                                    className="flex flex-wrap items-center justify-between gap-2"
                                                >
                                                    <div className="flex flex-wrap items-center gap-2.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Label
                                                                htmlFor={`${checkboxId}-from-${slotIdx}`}
                                                                className="text-xs text-zinc-600 whitespace-nowrap"
                                                            >
                                                                {lang_1.appointments.from}
                                                            </Label>
                                                            <TimePicker24h
                                                                id={`${checkboxId}-from-${slotIdx}`}
                                                                value={slot.from}
                                                                onChange={(val) =>
                                                                    handleSlotTimeChange(
                                                                        item.day,
                                                                        slotIdx,
                                                                        "from",
                                                                        val
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <Label
                                                                htmlFor={`${checkboxId}-to-${slotIdx}`}
                                                                className="text-xs text-zinc-600 whitespace-nowrap"
                                                            >
                                                                {lang_1.appointments.to}
                                                            </Label>
                                                            <TimePicker24h
                                                                id={`${checkboxId}-to-${slotIdx}`}
                                                                value={slot.to}
                                                                onChange={(val) =>
                                                                    handleSlotTimeChange(
                                                                        item.day,
                                                                        slotIdx,
                                                                        "to",
                                                                        val
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    {item.slots.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() =>
                                                                handleRemoveSlot(
                                                                    item.day,
                                                                    slotIdx
                                                                )
                                                            }
                                                            title={
                                                                lang_1.appointments
                                                                    .removeSlot
                                                            }
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 size-8"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <DialogFooter className="-mx-6 -mb-6 mt-4 gap-2 sm:justify-end">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10"
                            >
                                {lang_1.appointments.cancel}
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#08182D] hover:bg-[#08182D]/90 text-white h-10"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin size-4 me-2" />
                                    {lang_1.appointments.saving}
                                </>
                            ) : (
                                lang_1.appointments.submit
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AppointmentsModal;
