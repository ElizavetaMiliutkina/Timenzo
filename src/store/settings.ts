import { defineStore } from 'pinia'
import { DateTime } from 'luxon'
import { Notify } from 'quasar'
import { getSettings, updateSettings } from '@/services/settings'
import type { UserSettings } from '@/types/settings'

export function getBrowserTimezone(): string {
    return DateTime.local().zoneName || 'UTC'
}

export const useSettingsStore = defineStore('settings', {
    state: (): {
        timezone: string | null
        loaded: boolean
    } => ({
        timezone: null,
        loaded: false,
    }),
    getters: {
        /** Таймзона из БД или браузера, если в настройках пусто. */
        resolvedTimezone(state): string {
            return state.timezone || getBrowserTimezone()
        },
    },
    actions: {
        async fetchSettings(): Promise<UserSettings | null> {
            try {
                const data = await getSettings()
                this.timezone = data.timezone
                this.loaded = true
                return data
            } catch (error) {
                console.error('Error fetching settings:', error)
                this.loaded = true
                return null
            }
        },
        async saveTimezone(timezone: string | null): Promise<boolean> {
            try {
                const data = await updateSettings({ timezone })
                this.timezone = data.timezone
                this.loaded = true
                return true
            } catch (error: any) {
                Notify.create({
                    type: 'negative',
                    message: error?.response?.data?.detail || 'Failed to save timezone',
                })
                return false
            }
        },
    },
})
