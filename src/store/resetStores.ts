import { useCalendarStore } from '@/store/calendar'
import { useStudentStore } from '@/store/students'
import { useDictionariesStore } from '@/store/dictionaries'
import { useCountryStore } from '@/store/countries'
import { useSettingsStore } from '@/store/settings'

/** Сброс данных всех сторов кроме auth (вызывается из auth.logout). */
export function resetAllNonAuthStores() {
    useCalendarStore().$reset()
    useStudentStore().$reset()
    useDictionariesStore().$reset()
    useCountryStore().$reset()
    useSettingsStore().$reset()
}
