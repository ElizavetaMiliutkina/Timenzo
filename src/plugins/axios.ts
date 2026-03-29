import axios from 'axios'
import router from '@/router/index'
import { useAuthStore } from '@/store/auth'

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

const refreshInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

instance.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

instance.interceptors.response.use(
    response => response,
    async error => {
        if (
            error.response?.status === 401 &&
            !error.config._retry
        ) {
            error.config._retry = true
            const refreshToken = localStorage.getItem('refresh_token')
            if (!refreshToken) {
                useAuthStore().logout()
                router.push('/login')
                return Promise.reject(error)
            }
            try {
                const refreshResponse = await refreshInstance.post('/refresh', {
                    refresh_token: refreshToken,
                })

                const newAccessToken = refreshResponse.data.access_token
                const newRefreshToken =
                    refreshResponse.data.refresh_token ?? refreshToken

                useAuthStore().setTokens(newAccessToken, newRefreshToken)

                error.config.headers.Authorization = `Bearer ${newAccessToken}`

                return instance(error.config)
            } catch (refreshError) {
                useAuthStore().logout()
                router.push('/login')
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default instance
