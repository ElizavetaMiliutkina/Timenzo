<script setup lang="ts">
import NavbarMenu from "@/components/navbar/NavbarMenu.vue";
</script>

<template>
  <q-header
    reveal
    elevated
  >
    <q-toolbar style="justify-content: space-between;">
      <div class="navbar-logo">
        Timenzo
      </div>

      <div class="row items-center q-gutter-md navbar-menu">
        <router-link
          to="/home"
          class="nav-link"
          active-class="active"
        >
          Dashboard
        </router-link>

        <router-link
          to="/calendar"
          class="nav-link"
          active-class="active"
        >
          Schedule
        </router-link>
      </div>
      
      <navbar-menu />
    </q-toolbar>
  </q-header>
</template>

<style lang="scss">
.navbar-logo {
  font-size: 21px;
  font-weight: normal;
  letter-spacing: 0.01em;
  padding: 0 12px;
}
.navbar-menu {
  .nav-link{
    color: white;
    text-decoration: none;
    font-weight: 500;
  }
  .active {
    text-decoration: underline;
    text-underline-offset: 6px;
    //text-shadow: 2px 2px #2c2d30;
  }
}
</style>

