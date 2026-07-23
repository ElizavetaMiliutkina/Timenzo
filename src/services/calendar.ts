import axios from '@/plugins/axios'
import {EventData, EventDataCreate} from "@/types/calendar";

const postInflight = new Set<string>()

export const postEvent = async (payload: EventDataCreate) => {
    const key = `${payload.date_start}|${payload.time_start}|${payload.student_id}|${payload.title}`
    if (postInflight.has(key)) return null
    postInflight.add(key)
    try {
        return await axios.post('/event', payload)
    } catch (error) {
        return error
    } finally {
        postInflight.delete(key)
    }
}

export const patchEvent = async (payload: EventDataCreate, id: number) => {
    try {
        return await axios.patch(`/events/${id}`, payload)
    } catch (error) {
        return  error;
    }
}
export const getEvents = async (start: string, end: string): Promise<EventData[]> => {
    try {
        const response = await axios.get<EventData[]>(`/events?start=${start}&end=${end}`)
        return response.data
    } catch (error) {
        console.error('Error fetching events', error)
        return []
    }
}
export const completeEvent = async (id: string): Promise<EventData[]> => {
    try {
        const response = await axios.patch<EventData[]>(`/events/${id}/complete`)
        return response.data
    } catch (error) {
        console.error('Error fetching events', error)
        return []
    }
}
export const incomeGraph = async (period: number) => {
    try {
        const response = await axios.get(`/income/graph?period=${period}`)
        return response.data
    } catch (error) {
        console.error('Error income graph', error)
        return error
    }
}

export interface SpreadEventPayload {
    event_id: number
    weeks: number
    weekdays: number[]
}

export interface SpreadEventResult {
    message: string
    created_count: number
    event_ids: number[]
}

export const spreadEvent = async (
    payload: SpreadEventPayload
): Promise<SpreadEventResult | null> => {
    try {
        const { data } = await axios.post<SpreadEventResult>('/events/spread', payload)
        return data
    } catch (error) {
        console.error('Error spreading events', error)
        return null
    }
}

