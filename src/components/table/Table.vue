<script setup lang="ts">
import { QTableColumn } from 'quasar'

// export interface Column<T> {
//   name: string
//   label: string
//   field?: string | ((row: T) => unknown)
//   align?: 'left' | 'right' | 'center'
//   format?: (val: unknown, row?: T) => string
//   sortable?: boolean
//   required?: boolean
//   headerStyle?: string
//   style?: string
// }

defineProps<{
  columns: QTableColumn[]
  rows: any[]
}>()

</script>

<template>
  <div class="q-pa-md">
    <q-table
      flat
      bordered
      title="Students"
      :rows="rows"
      :columns="columns"
      row-key="id"
      color="amber"
      :pagination="{ rowsPerPage: 10 }"
    >
      <template
        v-for="(_, slot) in $slots"
        #[slot]="scope"
      >
        <slot
          :name="slot"
          v-bind="scope"
        />
      </template>
    </q-table>
  </div>
</template>
