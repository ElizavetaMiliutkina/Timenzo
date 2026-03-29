export interface Student {
    id: number
    name: string
    price: number
    timezone: Timezone
    currency_id: number
    comment: string
    paid: number
    color: string | null
}

export interface Timezone {
    id: number
    label: string
    lat: number
    lon: number
    timezone: string
}

// export type StudentCreate = Omit<Student, 'id' | 'timezone_id'> & {
//     timezone: Timezone
// }

export type StudentFormData = {
    id?: number
    name: string
    price: number
    comment: string | undefined
    timezone: Timezone | null
    currency_id: number
    paid: number
    color: string | null
}
