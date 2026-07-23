import { defineStore } from 'pinia'
import {EventDataCreate, EventData, GraphData} from '@/types/calendar'
import { Notify } from 'quasar'

import axios from "@/plugins/axios";
import {format, subYears} from "date-fns";

/** In-flight dedupe для одинаковых GET /events (FullCalendar иногда дёргает events дважды). */
const eventsInflight = new Map<string, Promise<EventData[]>>()
const mutationInflight = new Set<string>()

async function withMutationLock<T>(
    key: string,
    fn: () => Promise<T>
): Promise<T | null> {
    if (mutationInflight.has(key)) return null
    mutationInflight.add(key)
    try {
        return await fn()
    } finally {
        mutationInflight.delete(key)
    }
}

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
        async refreshPeriodEvents(): Promise<EventData[]> {
            try {
                const now = new Date()
                const startDate = subYears(now, 1)
                const endPeriod = format(now, "yyyy-MM-dd'T'HH:mm:ss")
                const startPeriod = format(startDate, "yyyy-MM-dd'T'HH:mm:ss")
                const response = await axios.get<EventData[]>('/events', {
                    params: { start: startPeriod, end: endPeriod, completed: false },
                })
                this.periodEvents = response.data
                return this.periodEvents
            } catch (error) {
                console.error('Error fetching period events:', error)
                return []
            }
        },
        async getEvents(start: string, end: string): Promise<EventData[]> {
            const key = `${start}|${end}`
            const existing = eventsInflight.get(key)
            if (existing) {
                return existing
            }

            const request = (async () => {
                try {
                    this.lastEventPayload.start = start
                    this.lastEventPayload.end = end
                    const response = await axios.get<EventData[]>(`/events?start=${start}&end=${end}`)
                    this.events = response.data
                    return response.data
                } catch (error) {
                    console.error('Error fetching events:', error)
                    return []
                } finally {
                    eventsInflight.delete(key)
                }
            })()

            eventsInflight.set(key, request)
            return request
        },
        async patchEvent(payload: EventDataCreate, id: number | string): Promise<EventData | null> {
            return withMutationLock(`patch-event:${id}`, async () => {
                try {
                    const response = await axios.patch<EventData>(`/events/${id}`, payload)
                    const index = this.events.findIndex((event) => event.id === response.data.id)
                    if (index !== -1) {
                        this.events[index] = response.data
                    }
                    void this.refreshPeriodEvents()
                    return response.data
                } catch (error) {
                    console.error('Error fetching events:', error)
                    return null
                }
            })
        },
        async completeEvent(id: string): Promise<EventData[]> {
            const result = await withMutationLock(`complete-event:${id}`, async () => {
                try {
                    const response = await axios.patch<EventData[]>(`/events/${id}/complete`)
                    this.events = response.data
                    await Promise.all([
                        this.refreshPeriodEvents(),
                        this.incomeGraph(this.graphPeriod),
                    ])
                    return response.data
                } catch (error) {
                    console.error('Error fetching events:', error)
                    return []
                }
            })
            return result ?? []
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
            return withMutationLock(`delete-event:${id}`, async () => {
                try {
                    const response = await axios.delete(`/events/${id}`)
                    await Promise.all([
                        this.reloadEvents(),
                        this.refreshPeriodEvents(),
                    ])
                    return response
                } catch (error) {
                    console.error('Error fetching events:', error)
                    return []
                }
            })
        },
        async incomeGraph(period: number): Promise<GraphData> {
            try {
                const response = await axios.get<GraphData>(`/income/graph?period=${period}`)
                this.graphData = response.data
                return response.data
            } catch (error: any) {
                Notify.create({
                    type: 'negative',
                    message: error.message || 'Error loading chart'
                })
                throw error
            }
        }
    }
})
