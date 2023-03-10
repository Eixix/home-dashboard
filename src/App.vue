<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Timer from './components/Timer.vue'
</script>

<template>
  <RouterView />
  <div v-if="timers.length">
    <div v-for="timer in timers">
      <Timer :limit="10"></Timer>
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
      console.log(data)
      this.timers.push({
        entity_id: data.event.data.entity_id
      })
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
