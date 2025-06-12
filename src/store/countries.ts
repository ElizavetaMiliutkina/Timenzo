import { defineStore } from 'pinia'
import { City, GeoNamesCity } from "@/types/location";

export const useCountryStore = defineStore('countryStore', {
    state: (): {
        cities: City[]
        loading: boolean
        error: string | null
    } => ({
        cities: [],
        loading: false,
        error: null,
    }),

    actions: {
        async loadCities(): Promise<void> {
            this.loading = true
            this.error = null
            const username = 'liza_mil'

            try {
                const cachedCities = localStorage.getItem('cities')
                if (cachedCities) {
                    this.cities = JSON.parse(cachedCities)
                    return
                }

                const response = await fetch(
                    `http://api.geonames.org/searchJSON?featureClass=P&country=US&maxRows=1000&username=${username}`
                )
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.status?.message || `HTTP error! status: ${response.status}`)
                }

                const data = await response.json()
                const geonames: GeoNamesCity[] = data.geonames

                const cityNames = ['San Diego', 'Boston']
                const additionalCities = await Promise.all(
                    cityNames.map(async (name) => {
                        const cityResponse = await fetch(
                            `http://api.geonames.org/searchJSON?name=${encodeURIComponent(name)}&featureClass=P&country=US&maxRows=1&username=${username}`
                        )
                        const cityData = await cityResponse.json()
                        return cityData.geonames?.[0] as GeoNamesCity
                    })
                )

                const allCities = [...geonames, ...additionalCities.filter(Boolean)].reduce<GeoNamesCity[]>((acc, city) => {
                    if (!acc.find((c) => c.geonameId === city.geonameId)) {
                        acc.push(city)
                    }
                    return acc
                }, [])

                this.cities = await Promise.all(
                    allCities.map(async (item): Promise<City> => {
                        const timezoneResponse = await fetch(
                            `http://api.geonames.org/timezoneJSON?lat=${item.lat}&lng=${item.lng}&username=${username}`
                        )
                        const timezoneData = await timezoneResponse.json()

                        return {
                            id: item.geonameId,
                            name: item.name,
                            country: item.countryName || 'United States',
                            timezone: timezoneData.timezoneId || 'Unknown',
                            lat: item.lat,
                            lng: item.lng,
                            population: item.population || 0,
                        }
                    })
                )

                localStorage.setItem('cities', JSON.stringify(this.cities))
                console.log('Loaded cities:', this.cities)
            } catch (error: any) {
                this.error = error.message
                this.cities = []
                console.error('Error loading cities:', error)
            } finally {
                this.loading = false
            }
        },

        async loadCityTimezone(lat: number, lng: number): Promise<string> {
            this.loading = true
            this.error = null
            const username = 'liza_mil'

            try {
                const response = await fetch(
                    `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=${username}`
                )
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.status?.message || `HTTP error! status: ${response.status}`)
                }
                const data = await response.json()
                return data.timezoneId || 'Unknown'
            } catch (error: any) {
                this.error = error.message
                console.error('Error loading timezone:', error)
                return 'Unknown'
            } finally {
                this.loading = false
            }
        },
    },
})
