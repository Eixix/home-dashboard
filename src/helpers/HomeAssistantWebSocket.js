export class HomeAssistantWebSocket {
    constructor() {
        this.connection = new WebSocket(import.meta.env.VITE_HOMEASSISTANT_WEBSOCKET_URL)

        this.connection.onmessage = this.websocketOnMessage

        this.connection.onopen = function () {
            console.log('Successfully connected to the echo websocket server...')
        }
    }

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
    }
}
