import axios from '@/plugins/axios'
import router from '@/router/index'
import { useAuthStore } from '@/store/auth.js'
import {LoginPayload, RegisterPayload} from "@/types/auth";

export const registerUser = async ( payload: RegisterPayload ) => {
    try {
        const response = await axios.post('/register', payload)

        if (response.status === 201 || response.status === 200) {
            return await loginUser(payload)
        }

        return response.data;
    } catch (error) {
        return  error;
    }
}
export const loginUser = async (payload: LoginPayload) => {
    const authStore = useAuthStore()

    try {
        const response = await axios.post('/login', payload)

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
