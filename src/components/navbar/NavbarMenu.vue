<script setup lang="ts">
import {useRouter} from "vue-router";
import {useAuthStore} from "@/store/auth"

const router = useRouter()
const authStore = useAuthStore()

function onLogout() {
  authStore.logout()
  router.push('/login')
}

</script>

<template>
  <div class="q-pa-md navbar_btn_dropdown cursor-pointer">
    <q-btn-dropdown
      label=""
      dense
      flat
      dropdown-icon="change_history"
    >
      <q-list>
        <q-item
          v-close-popup
          clickable
        >
          <q-item-section>
            <q-item-label class="disabled">
              Settings
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-close-popup
          clickable
          @click="onLogout"
        >
          <q-item-section>
            <q-item-label>Logout</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

