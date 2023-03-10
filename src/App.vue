<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<script>
export default {
  data() {
    return {
      connection: null,
      connectionId: 1,
      connectionStates: { disconnected: 'disconnected', connected: 'connected' },
      connectionState: 'disconnected'
    }
  },

  methods: {},

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
          console.log(data)
          break
        case 'result':
          console.log(data)
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

<style scoped></style>
