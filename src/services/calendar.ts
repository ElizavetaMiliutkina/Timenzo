import axios from '@/plugins/axios'
import { EventData } from "@/types/calendar";

export const postEvent = async (payload: EventData) => {
    try {
        const response = await axios.post('/event', payload)
        return response;
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

