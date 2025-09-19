<script setup lang="ts">

interface Column {
  name: string
  label: string
  field: string | ((row: any) => any)
  align?: string
  format?: (val: any) => string
  sortable?: boolean
  required?: boolean
}

const props = defineProps<{
  columns: Column[]
  rows: any[]
}>()

</script>

<template>
  <div class="q-pa-md">
    <q-table
        flat bordered
        title="Students"
        :rows="rows"
        :columns="columns"
        row-key="name"
        dark
        color="amber"
        :pagination="{ rowsPerPage: 10 }"
    />
  </div>
</template>
