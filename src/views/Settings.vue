<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Notify } from 'quasar'
import LocationSelect from '@/components/LocationSelect.vue'
import { useSettingsStore } from '@/store/settings'
import type { LocationOption } from '@/types/location'

const settingsStore = useSettingsStore()
const selectedLocation = ref<LocationOption | null>(null)
const saving = ref(false)

function locationFromTimezone(timezone: string): LocationOption {
  return {
    id: 0,
    label: timezone,
    lat: 0,
    lon: 0,
    timezone,
  }
}

async function loadSettings() {
  await settingsStore.fetchSettings()
  if (settingsStore.timezone) {
    selectedLocation.value = locationFromTimezone(settingsStore.timezone)
  } else {
    selectedLocation.value = null
  }
}

async function onLocationChange(location: LocationOption | null) {
  if (saving.value) return
  selectedLocation.value = location
  saving.value = true

  const timezone = location?.timezone ?? null
  const ok = await settingsStore.saveTimezone(timezone)

  saving.value = false
  if (ok) {
    Notify.create({
      type: 'positive',
      message: timezone
        ? `Timezone set to ${timezone}`
        : 'Timezone cleared — using browser timezone',
      timeout: 2000,
    })
  } else {
    await loadSettings()
  }
}

onMounted(loadSettings)

watch(
  () => settingsStore.timezone,
  (tz) => {
    if (!selectedLocation.value && tz) {
      selectedLocation.value = locationFromTimezone(tz)
    }
  }
)
</script>

<template>
  <q-page padding>
    <div class="settings-page">
      <div class="text-h5 q-mb-md">
        Settings
      </div>

      <q-card flat bordered>
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">
            Your timezone
          </div>
          <div class="text-body2 text-grey-7 q-mb-md">
            Lessons are stored as absolute UTC moments. This zone is used to enter and display times. If empty, your browser timezone is used.
          </div>

          <location-select
            :model-value="selectedLocation"
            :required="false"
            :disable="saving"
            @update:model-value="onLocationChange"
          />

          <div class="q-mt-md text-body2">
            Active timezone:
            <span class="text-weight-medium">{{ settingsStore.resolvedTimezone }}</span>
            <span
              v-if="!settingsStore.timezone"
              class="text-grey-6"
            > (browser)</span>
          </div>
        </q-card-section>

        <q-inner-loading :showing="saving" />
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.settings-page {
  max-width: 480px;
}
</style>
