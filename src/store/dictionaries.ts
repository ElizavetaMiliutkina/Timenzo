import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import type { Currency } from '@/types/dictionaries'

export const useDictionariesStore = defineStore('dictionaries', {
    state: () => ({
        currencies: [] as Currency[],
        loading: false,
    }),

    actions: {
        async fetchCurrencies() {
            if (this.loading) return

            try {
                const { data } = await axios.get<Currency[]>('/currencies')
                this.currencies = data
                this.loading = true
            } catch (error) {
                console.error('Error fetching currencies:', error)
            } finally {
                this.loaded = false
            }
        },
    },
})
