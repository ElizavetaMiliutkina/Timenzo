import axios from '@/plugins/axios.js'
import router from '@/router'
import { useAuthStore } from '@/store/auth.js'

export const registerUser = async (email, username, password ) => {
    try {
        const response = await axios.post('/register', {
            email,
            username,
            password,
        })

        if (response.status === 201 || response.status === 200) {
            return await loginUser(email, username, password)
        }

        return response.data;
    } catch (error) {
        return  error;
    }
}
export const loginUser = async (email, username, password ) => {
    const authStore = useAuthStore()

    try {
        const response = await axios.post('/login', {
            email,
            username,
            password,
        })

        const data = response.data

        authStore.setTokens(data.access_token, data.refresh_token)
        authStore.setUser(data.user)

        router.push('/home')

        return data;
    } catch (error) {
        console.error('Ошибка логина:', error)
        return  error;
    }
}
