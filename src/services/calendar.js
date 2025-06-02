import axios from '@/plugins/axios.js'

export const postEvent = async (payload) => {
    try {
        const response = await axios.post('/event', payload)
        return response;
    } catch (error) {
        return  error;
    }
    }
