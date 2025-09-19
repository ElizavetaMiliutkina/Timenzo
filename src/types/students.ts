export interface Student {
    id: number
    name: string
    price: number
    timezone: number
    commit: string
}

interface Timezone {
    id: number
    label: string
    lat: number
    lon: number
}

// export type StudentCreate = Omit<Student, 'id' | 'timezone_id'> & {
//     timezone: Timezone
// }

export type StudentFormData = {
    id?: number
    name: string
    price: number
    comment: string
    timezone: Timezone | null
}
