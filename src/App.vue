<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { apiGetRequest } from './helpers/apiHelper'
</script>

<template>
  <RouterView />
</template>

<script>
export default {
  async mounted() {
    const response = await apiGetRequest('config')

    console.log(response)
  }
}
</script>

<style scoped></style>
