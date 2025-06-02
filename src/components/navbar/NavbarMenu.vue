<script setup>
import {useRouter} from "vue-router";

const router = useRouter()

function onLogout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  router.push('/login')
}

</script>

<template>
    <div class="q-pa-md">
      <q-btn-dropdown color="blue" label="" dropdown-icon="change_history">
        <q-list>
          <q-item clickable v-close-popup @click="onItemClick">
            <q-item-section>
              <q-item-label>Settings</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="onLogout">
            <q-item-section>
              <q-item-label>Logout</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
</template>

<style scoped>

</style>

