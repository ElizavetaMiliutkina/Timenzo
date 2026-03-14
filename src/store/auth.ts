import { defineStore } from 'pinia'
import { User } from '@/types/user'

function getStoredUser(): User | null {
    try {
        const raw = localStorage.getItem('user')
        return raw ? JSON.parse(raw) as User : null
    } catch {
        return null
    }
}

export const useAuthStore = defineStore('user', {
    state: (): {
        user: User | null;
        accessToken: string;
        refreshToken: string;
    } => ({
        user: getStoredUser(),
        accessToken: localStorage.getItem('access_token') || '',
        refreshToken: localStorage.getItem('refresh_token') || ''
    }),
    actions: {
        setUser(userData: User) {
            this.user = userData
            localStorage.setItem('user', JSON.stringify(userData))
        },
        setTokens(access: string, refresh: string) {
            this.accessToken = access
            this.refreshToken = refresh
            localStorage.setItem('access_token', access)
            localStorage.setItem('refresh_token', refresh)
        },
        logout() {
            this.user = null
            this.accessToken = ''
            this.refreshToken = ''
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
        }
    }
})
