<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Timer from './components/Timer.vue'
</script>

<template>
  <RouterView />
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
      connection: null,
      connectionId: 1,
      connectionStates: { disconnected: 'disconnected', connected: 'connected' },
      connectionState: 'disconnected',
      timers: []
    }
  },

  methods: {
    spawnTimer(data) {
      const timer =
        JSON.parse(data.event.data.new_state.attributes.sorted_active)[0] ||
        JSON.parse(data.event.data.new_state.attributes.sorted_active)[1]
      console.log(data, timer)
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
    }
  },

  created() {
    this.connection = new WebSocket(import.meta.env.VITE_HOMEASSISTANT_URL)

    this.connection.onmessage = (event) => {
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
    }

    this.connection.onopen = function (event) {
      console.log('Successfully connected to the echo websocket server...')
    }
  },

  mounted() {
    //setInterval(this.checkForUpdates, 2000)
  }
}
</script>

<style scoped>
.else-text {
  font-size: 50px;
  color: white;
}
</style>
