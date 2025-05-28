import axios from '@/plugins/axios.js'

export const getCities = async () => {
    try {
        const response = await axios.get('/countries')
        return response;
    } catch (error) {
        return  error;
    }
}


export const getLocations = async (query) => {
    try {
        const response = await axios.get(`/search-locations?query=${query}`)
        return response;
    } catch (error) {
        return  error;
    }
}
