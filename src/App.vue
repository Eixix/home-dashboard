<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Timer from './components/Timer.vue'
</script>

<template>
  <RouterView />
  <div v-if="eventsForTheDay.length">
    <ul v-for="event in eventsForTheDay">
      <li>{{ event.start.dateTime }} - {{ event.end.dateTime }}: {{ event.summary }}</li>
    </ul>
  </div>
  <div class="else-text" v-else>No events today!</div>
  <div v-if="timers.length">
    <div v-for="timer in timers">
      <Timer :limit="timer.time_remaining"></Timer>
    </div>
  </div>
  <div class="else-text" v-else>No timers available</div>
</template>

<script>
export default {
  data() {
    return {
      calendars: [],
      eventsForTheDay: [],
      connection: null,
      connectionId: 1,
      connectionStates: { disconnected: 'disconnected', connected: 'connected' },
      connectionState: 'disconnected',
      timers: []
    }
  },

  methods: {
    websocketOnMessage(event) {
      const data = JSON.parse(event.data)
      switch (data.type) {
        case 'auth_required':
          console.log('Starte Authentifizierung...')
          this.connection.send(
            JSON.stringify({
              type: 'auth',
              access_token: import.meta.env.VITE_HOMEASSISTANT_TOKEN
            })
          )
          break
        case 'auth_ok':
          console.log('Authentifizierung abgeschlossen!')
          this.connectionState = this.connectionStates.connected
          this.connection.send(
            JSON.stringify({
              id: this.connectionId,
              type: 'subscribe_events'
            })
          )
          this.connectionId++
          break
        case 'auth_invalid':
          alert('Generiere ein neues Token, dein altes ist ungültig')
          this.connectionState = this.connectionStates.disconnected
          break
        case 'event':
          if (data.event.data?.entity_id?.includes('timer')) {
            this.spawnTimer(data)
          }
          break
        case 'result':
          break
      }
    },

    spawnTimer(data) {
      const timer =
        JSON.parse(data.event.data.new_state.attributes.sorted_active)[0] ||
        JSON.parse(data.event.data.new_state.attributes.sorted_active)[1]
      if (timer && timer[1].remainingTime > 0) {
        if (
          this.timers.reduce(
            (acc, timer) => acc && timer.entity_id !== data.event.data.entity_id,
            true
          )
        ) {
          this.timers.push({
            entity_id: data.event.data.entity_id,
            time_remaining: timer[1].remainingTime / 1000
          })
        }
      } else {
        this.timers = this.timers.filter((timer) => timer.time_remaining > 0)
        if (
          data.event.data.new_state.state === 'unavailable' ||
          !timer ||
          timer[1].remainingTime <= 0
        ) {
          this.timers = this.timers.filter((timer) => timer.entity_id !== data.event.data.entity_id)
        }
      }
    },

    async getCalendars() {
      const response = await fetch(import.meta.env.VITE_HOMEASSISTANT_API_URL + 'calendars', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + import.meta.env.VITE_HOMEASSISTANT_TOKEN,
          'Content-Type': 'Content-Type: application/json'
        }
      })

      this.calendars = await response.json()
      this.eventsForTheDay = await Promise.all(
        this.calendars.map(async (calendar) => await this.getEventsOfToday(calendar.entity_id))
      )

      this.eventsForTheDay = this.eventsForTheDay.filter((calendar) => calendar.length).flat()

      console.log(this.eventsForTheDay)
    },

    async getEventsOfToday(calendar) {
      const startOfDay = new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(new Date().setUTCHours(23, 59, 59, 999)).toISOString()
      const response = await fetch(
        `${
          import.meta.env.VITE_HOMEASSISTANT_API_URL
        }calendars/${calendar}?start=${startOfDay}&end=${endOfDay}`,
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + import.meta.env.VITE_HOMEASSISTANT_TOKEN,
            'Content-Type': 'Content-Type: application/json'
          }
        }
      )

      return await response.json()
    }
  },

  created() {
    this.connection = new WebSocket(import.meta.env.VITE_HOMEASSISTANT_WEBSOCKET_URL)

    this.connection.onmessage = this.websocketOnMessage

    this.connection.onopen = function (event) {
      console.log('Successfully connected to the echo websocket server...')
    }

    this.getCalendars()
  },

  mounted() {}
}
</script>

<style scoped>
.else-text {
  font-size: 50px;
  color: white;
}
</style>
