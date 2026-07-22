import { DateTime } from 'luxon'

/** ISO (с Z) → wall-clock в зоне пользователя. */
export function toZoneParts(
    iso: string,
    zone: string
): { date: string; time: string } {
    const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone(zone)
    return {
        date: dt.toFormat('yyyy-MM-dd'),
        time: dt.toFormat('HH:mm'),
    }
}

/** JS Date (UTC instant) → wall-clock в зоне. */
export function jsDateToZoneParts(
    value: Date,
    zone: string
): { date: string; time: string } {
    const dt = DateTime.fromJSDate(value, { zone: 'utc' }).setZone(zone)
    return {
        date: dt.toFormat('yyyy-MM-dd'),
        time: dt.toFormat('HH:mm'),
    }
}
