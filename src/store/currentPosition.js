import { defineStore } from 'pinia';

export const useCurrentPositionStore = defineStore('currentPositionStore', {
    state: () => ({
        country: null,
        loading: false,
        error: null,
    }),
    actions: {
        async loadCurrentPosition() {
            this.loading = true;
            this.error = null;
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                const { latitude, longitude } = position.coords;

                // Use GeoNames API for reverse geocoding
                const username = 'liza_mil';
                const response = await fetch(
                    `http://api.geonames.org/findNearbyPlaceNameJSON?lat=${latitude}&lng=${longitude}&username=${username}`
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.status?.message || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.geonames && data.geonames.length > 0) {
                    this.country = {
                        name: data.geonames[0].countryName || 'Unknown',
                        code: data.geonames[0].countryCode || '',
                    };
                } else {
                    throw new Error('No country found for these coordinates');
                }
                console.log('Country:', this.country);
            } catch (error) {
                this.error = error.message;
                this.country = null;
                console.error('Error loading current position:', error);
            } finally {
                this.loading = false;
            }
        },
    },
});
