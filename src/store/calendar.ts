import { defineStore } from 'pinia'
import {EventData, GraphData} from '@/types/calendar'
import { Notify } from 'quasar'

import axios from "@/plugins/axios";

export const useCalendarStore = defineStore('calendar', {
    state: (): {
        events: EventData[]
        lastEventPayload: {
            start: string,
            end: string
        }
        graphData: GraphData | null
        graphPeriod: number
    } => ({
        events: [],
        lastEventPayload: {
            start: '',
            end: ''
        },
        graphData: null,
        graphPeriod: 3,
    }),
    actions: {
        async getEvents(start: string, end: string): Promise<EventData[]> {
            try {
                this.lastEventPayload.start = start
                this.lastEventPayload.end = end
                const response = await axios.get<EventData[]>(`/events?start=${start}&end=${end}`)
                this.events = response.data
                return response.data
            } catch (error) {
                console.error('Error fetching events:', error)
                return []
            }
        },
        async completeEvent(id: string): Promise<EventData[]> {
            try {
                const response = await axios.patch<EventData[]>(`/events/${id}/complete`)
                this.events = response.data
                await this.incomeGraph(this.graphPeriod)
                return response.data
            } catch (error) {
                console.error('Error fetching events:', error)
                return []
            }
        },
        async reloadEvents(): Promise<EventData[]> {
            try {
                return await this.getEvents(this.lastEventPayload.start, this.lastEventPayload.end)
            } catch (error) {
                console.error('Error fetching events:', error)
                return []
            }
        },
        async incomeGraph(period: number): Promise<GraphData> {
            try {
                const response = await axios.get<GraphData>(`/income/graph?period=${period}`)
                this.graphData = response.data
                return response.data
            } catch (error: any) {
                Notify.create({
                    type: 'negative',
                    message: error.message || 'Ошибка загрузки графика'
                })
                throw error
            }
        }
    }
})
