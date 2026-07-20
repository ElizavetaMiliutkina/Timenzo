import axios from '@/plugins/axios'
import type { UserSettings, UserSettingsUpdate } from '@/types/settings'

export async function getSettings(): Promise<UserSettings> {
    const { data } = await axios.get<UserSettings>('/settings')
    return data
}

export async function updateSettings(
    payload: UserSettingsUpdate
): Promise<UserSettings> {
    const { data } = await axios.patch<UserSettings>('/settings', payload)
    return data
}
