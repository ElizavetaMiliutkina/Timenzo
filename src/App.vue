<script setup>
import Navbar from "@/components/Navbar.vue";
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <Navbar />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>

</style>
