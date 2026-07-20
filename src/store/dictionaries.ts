import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import type { Currency } from '@/types/dictionaries'

export const useDictionariesStore = defineStore('dictionaries', {
    state: () => ({
        currencies: [] as Currency[],
        loading: false,
    }),

    actions: {
        /** force=true — сбросить кэш и забрать заново (после правок справочника и т.п.) */
        async fetchCurrencies(force = false) {
            if (!force && this.currencies.length) return
            if (this.loading) return

            this.loading = true
            try {
                const { data } = await axios.get<Currency[]>('/currencies')
                this.currencies = data
            } catch (error) {
                console.error('Error fetching currencies:', error)
            } finally {
                this.loading = false
            }
        },
    },
})
