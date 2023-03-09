<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { apiGetRequest } from './helpers/apiHelper'
</script>

<template>
  <RouterView />
</template>

<script>
export default {
  data() {
    return { timeslots: 0 }
  },

  methods: {
    async checkForUpdates() {
      const now = new Date().toISOString()
      const nextWeek = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString()
      const response = await apiGetRequest(`calendars/calendar.uni?start=${now}&end=${nextWeek}`)
      if (this.timeslots === 0) {
        this.timeslots = response.length
      } else if (this.timeslots !== response.length) {
        console.log('Neuer Termin!')
      }
    }
  },

  mounted() {
    setInterval(this.checkForUpdates, 2000)
  }
}
</script>

<style scoped></style>
