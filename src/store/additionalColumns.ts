import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import {
    getColumnKey,
    type AdditionalColumn,
} from '@/types/additionalColumns'

const BASE = '/me/additional-columns'

/** Бэк отдаёт либо `{columns: [...]}`, либо `[...]` — поддерживаем оба варианта. */
type ColumnsResponse =
    | AdditionalColumn[]
    | { columns: AdditionalColumn[] }

function unwrap(data: ColumnsResponse): AdditionalColumn[] {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.columns)) return data.columns
    return []
}

/** Гарантируем стабильный key и position у каждой колонки. */
function normalize(list: AdditionalColumn[]): AdditionalColumn[] {
    return list.map((c, i) => ({
        ...c,
        key: c.key ?? getColumnKey(c, i),
        position: c.position ?? i,
    }))
}

export const useAdditionalColumnsStore = defineStore('additionalColumns', {
    state: (): {
        columns: AdditionalColumn[]
        loaded: boolean
        loading: boolean
    } => ({
        columns: [],
        loaded: false,
        loading: false,
    }),

    getters: {
        sortedColumns: (state) =>
            [...state.columns].sort(
                (a, b) => (a.position ?? 0) - (b.position ?? 0),
            ),
    },

    actions: {
        async getColumns(): Promise<AdditionalColumn[]> {
            try {
                this.loading = true
                const { data } = await axios.get<ColumnsResponse>(BASE)
                this.columns = normalize(unwrap(data))
                this.loaded = true
                return this.columns
            } catch (error) {
                console.error('Error fetching additional columns:', error)
                return []
            } finally {
                this.loading = false
            }
        },

        async ensureLoaded(): Promise<AdditionalColumn[]> {
            if (this.loaded) return this.columns
            return this.getColumns()
        },

        /**
         * Bulk-replace всех колонок текущего пользователя.
         * Используется при сохранении из AdditionalColumnsModal.
         */
        async replaceColumns(
            payload: AdditionalColumn[],
        ): Promise<AdditionalColumn[] | null> {
            try {
                const { data } = await axios.put<ColumnsResponse>(BASE, {
                    columns: payload.map((c) => ({ label: c.label, type: c.type })),
                })
                this.columns = normalize(unwrap(data))
                this.loaded = true
                return this.columns
            } catch (error) {
                console.error('Error replacing additional columns:', error)
                return null
            }
        },

        async createColumn(
            payload: AdditionalColumn,
        ): Promise<AdditionalColumn | null> {
            try {
                const { data } = await axios.post<AdditionalColumn>(BASE, {
                    label: payload.label,
                    type: payload.type,
                })
                this.columns = normalize([...this.columns, data])
                return data
            } catch (error) {
                console.error('Error creating additional column:', error)
                return null
            }
        },

        async updateColumn(
            id: number,
            payload: Partial<AdditionalColumn> & { position?: number },
        ): Promise<AdditionalColumn | null> {
            try {
                const { data } = await axios.patch<AdditionalColumn>(
                    `${BASE}/${id}`,
                    payload,
                )
                this.columns = normalize(
                    this.columns.map((c) => (c.id === id ? data : c)),
                )
                return data
            } catch (error) {
                console.error('Error updating additional column:', error)
                return null
            }
        },

        async deleteColumn(id: number): Promise<boolean> {
            try {
                await axios.delete(`${BASE}/${id}`)
                this.columns = this.columns.filter((c) => c.id !== id)
                return true
            } catch (error) {
                console.error('Error deleting additional column:', error)
                return false
            }
        },
    },
})
