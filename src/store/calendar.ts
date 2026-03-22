import { defineStore } from 'pinia'
import {EventDataCreate, EventData, GraphData} from '@/types/calendar'
import { Notify } from 'quasar'

import axios from "@/plugins/axios";
import {format, subYears} from "date-fns";

export const useCalendarStore = defineStore('calendar', {
    state: (): {
        events: EventData[]
        periodEvents: EventData[]
        lastEventPayload: {
            start: string,
            end: string
        }
        graphData: GraphData | null
        graphPeriod: number
    } => ({
        events: [],
        periodEvents: [],
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

                console.log(this.events, 'Events')

                const now = new Date()
                const startDate = subYears(now, 1)

                const endPeriod = format(now, "yyyy-MM-dd'T'HH:mm:ss")
                const startPeriod = format(startDate, "yyyy-MM-dd'T'HH:mm:ss")

                this.periodEvents = await this.getPeriodEvents(startPeriod, endPeriod, false)
                return response.data
            } catch (error) {
                console.error('Error fetching events:', error)
                return []
            }
        },
        async getPeriodEvents(start: string, end: string, completed?: boolean): Promise<EventData[]> {
            try {
                this.lastEventPayload.start = start
                this.lastEventPayload.end = end
                const params: Record<string, any> = { start, end }

                if (completed !== undefined) {
                    params.completed = completed
                }
                const response = await axios.get<EventData[]>('/events', { params })
                return response.data
            } catch (error) {
                console.error('Error fetching period events:', error)
                return []
            }
        },
        async patchEvent(payload: EventDataCreate, id: number | string): Promise<EventData | null> {
            try {
                const response = await axios.patch<EventData>(`/events/${id}`, payload)
                this.events[this.events.findIndex((event) => event.id === response.data.id)] = response.data
                return response.data
            } catch (error) {
                console.error('Error fetching events:', error)
                return null
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
        async deleteEvent(id: string | number) {
            try {
                const response = await axios.delete(`/events/${id}`)
                await this.reloadEvents()
                return response
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
