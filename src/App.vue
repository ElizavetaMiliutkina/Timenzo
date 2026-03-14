<script setup lang="ts">
import { computed } from "vue";
import Navbar from "@/components/navbar/Navbar.vue";
import { useAuthStore } from "@/store/auth";

const authStore = useAuthStore();
const isAuthenticated = computed(() => !!authStore.accessToken);
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <Navbar v-if="isAuthenticated" />
    <q-header
      v-else
      reveal
      elevated
    >
      <q-toolbar class="justify-center">
        <div
          class="navbar-logo"
          style="font-size: xx-large;"
        >
          Timenzo
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>

</style>
