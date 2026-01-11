import axios from '@/plugins/axios'

export const getLocations = async (query: string) => {
    try {
        const response = await axios.get(`/search-locations?query=${query}`)
        return response.data;
    } catch (error) {
        return  error;
    }
}
export const getCurrencies = async () => {
    try {
        const response = await axios.get(`/currencies`)
        return response.data;
    } catch (error) {
        return  error;
    }
}
