import { defineStore } from 'pinia'

export const useAuthStore = defineStore('user', {
    state: () => ({
        user: null,
        accessToken: localStorage.getItem('access_token') || '',
        refreshToken: localStorage.getItem('refresh_token') || ''
    }),
    actions: {
        setUser(userData) {
            this.user = userData
            localStorage.setItem('user', userData)
        },
        setTokens(access, refresh) {
            this.accessToken = access
            this.refreshToken = refresh
            localStorage.setItem('access_token', access)
            localStorage.setItem('refresh_token', refresh)
        },
        logout() {
            this.user = null
            this.accessToken = ''
            this.refreshToken = ''
            localStorage.clear()
        }
    }
})
