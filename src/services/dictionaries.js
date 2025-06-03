import axios from '@/plugins/axios.js'

export const getLocations = async (query) => {
    try {
        const response = await axios.get(`/search-locations?query=${query}`)
        return response;
    } catch (error) {
        return  error;
    }
}
