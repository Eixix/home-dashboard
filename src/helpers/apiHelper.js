// https://developers.home-assistant.io/docs/api/rest/
export async function apiGetRequest(url) {
    const response = await fetch(import.meta.env.VITE_HOMEASSISTANT_URL + url, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + import.meta.env.VITE_HOMEASSISTANT_TOKEN,
            'Content-Type': 'Content-Type: application/json'
        }
    })

    return await response.json()
}