<script setup lang="ts">
import { QTableColumn } from 'quasar'

defineProps<{
  columns: QTableColumn[]
  rows: any[]
}>()

function cellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}
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
      <template #body-cell="props">
        <q-td
          :props="props"
          class="table-cell-td"
        >
          <div class="table-cell-ellipsis">
            {{ cellText(props.value) }}
            <q-tooltip
              v-if="cellText(props.value)"
              anchor="top middle"
              self="bottom middle"
              :offset="[0, 4]"
              max-width="400px"
            >
              {{ cellText(props.value) }}
            </q-tooltip>
          </div>
        </q-td>
      </template>

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

<style scoped>
.table-cell-td {
  max-width: 300px;
}

.table-cell-ellipsis {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
