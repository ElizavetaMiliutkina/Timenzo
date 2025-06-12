import axios from 'axios'
import router from '@/router/index'

const instance = axios.create({
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
        if (error.response?.status === 401) {
            try {
                const refresh_token = localStorage.getItem('refresh_token')
                const refreshResponse = await axios.post('/refresh', {
                    refresh_token,
                })

                const newAccessToken = refreshResponse.data.access_token
                localStorage.setItem('access_token', newAccessToken)

                error.config.headers.Authorization = `Bearer ${newAccessToken}`
                return axios(error.config)

            } catch (refreshError) {
                console.warn('Refresh token не сработал, нужно перелогиниться')
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                router.push('/login')
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default instance
