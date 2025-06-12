export interface City {
    id: number
    name: string
    country: string
    timezone: string
    lat: number
    lng: number
    population: number
}

export interface GeoNamesCity {
    geonameId: number
    name: string
    countryName?: string
    lat: number
    lng: number
    population?: number
}
