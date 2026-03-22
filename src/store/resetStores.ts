import { useCalendarStore } from '@/store/calendar'
import { useStudentStore } from '@/store/students'
import { useDictionariesStore } from '@/store/dictionaries'
import { useCountryStore } from '@/store/countries'

/** Сброс данных всех сторов кроме auth (вызывается из auth.logout). */
export function resetAllNonAuthStores() {
    useCalendarStore().$reset()
    useStudentStore().$reset()
    useDictionariesStore().$reset()
    useCountryStore().$reset()
}
