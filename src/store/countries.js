import { defineStore } from 'pinia';

export const useCountryStore = defineStore('countryStore', {
    state: () => ({
        cities: [],
        loading: false,
        error: null,
    }),
    actions: {
        async loadCities() {
            this.loading = true;
            this.error = null;
            try {
                // Check local storage for cached cities
                const cachedCities = localStorage.getItem('cities');
                if (cachedCities) {
                    this.cities = JSON.parse(cachedCities);
                    this.loading = false;
                    return;
                }

                // GeoNames API to fetch US cities
                const username = 'liza_mil';
                const response = await fetch(
                    `http://api.geonames.org/searchJSON?featureClass=P&country=US&maxRows=1000&username=${username}`
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.status?.message || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // Explicitly fetch San Diego and Boston if not in response
                const cityNames = ['San Diego', 'Boston'];
                const additionalCities = await Promise.all(
                    cityNames.map(async name => {
                        const cityResponse = await fetch(
                            `http://api.geonames.org/searchJSON?name=${encodeURIComponent(name)}&featureClass=P&country=US&maxRows=1&username=${username}`
                        );
                        const cityData = await cityResponse.json();
                        return cityData.geonames[0];
                    })
                );

                // Combine and deduplicate cities
                const allCities = [...data.geonames, ...additionalCities.filter(city => city)].reduce((acc, city) => {
                    if (!acc.find(c => c.geonameId === city.geonameId)) {
                        acc.push(city);
                    }
                    return acc;
                }, []);

                // Map cities and fetch timezones
                this.cities = await Promise.all(
                    allCities.map(async item => {
                        const timezoneResponse = await fetch(
                            `http://api.geonames.org/timezoneJSON?lat=${item.lat}&lng=${item.lng}&username=${username}`
                        );
                        const timezoneData = await timezoneResponse.json();
                        return {
                            id: item.geonameId,
                            name: item.name,
                            country: item.countryName || 'United States',
                            timezone: timezoneData.timezoneId || 'Unknown',
                            lat: item.lat,
                            lng: item.lng,
                            population: item.population || 0,
                        };
                    })
                );

                // Cache in local storage
                localStorage.setItem('cities', JSON.stringify(this.cities));
                console.log('Loaded cities:', this.cities);
            } catch (error) {
                this.error = error.message;
                this.cities = [];
                console.error('Error loading cities:', error);
            } finally {
                this.loading = false;
            }
        },
        async loadCityTimezone(lat, lng) {
            this.loading = true;
            this.error = null;
            try {
                const username = 'liza_mil';
                const response = await fetch(
                    `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=${username}`
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.status?.message || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return data.timezoneId || 'Unknown';
            } catch (error) {
                this.error = error.message;
                console.error('Error loading timezone:', error);
                return 'Unknown';
            } finally {
                this.loading = false;
            }
        },
    },
});
