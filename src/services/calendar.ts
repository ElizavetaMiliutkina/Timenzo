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
export const getEvents = async (): Promise<EventData[]> => {
    try {
        const response = await axios.get<EventData[]>('/events')
        return response.data
    } catch (error) {
        console.error('Error fetching events', error)
        return []
    }
}

