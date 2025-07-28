import "@picocss/pico"
import "./style.css"
import { createApp, reactive } from "petite-vue"
import { Chart } from "chart.js/auto"
import "chartjs-adapter-moment"
import { Dexie } from "dexie"

Chart.defaults.font.size = 16
Chart.defaults.color = "#FFF"

const webSocket = new WebSocket("ws://" + location.hostname + "/socket")

const db = new Dexie("ESP32WebTemp")

db.version(1).stores({
    readings: "++id, timestamp, internal_temp, external_temp"
})

const store = reactive({
    internalTemp: -500,
    externalTemp: -500
})

function TopNavbar(props) {
    return {
        $template: "#top-navbar",
        deleteDB() {
            db.delete()
            location.reload()
        }
    }
}

function TemperatureChart(props) {
    return {
        $template: "#chart",
        async renderChart() {
            const readings = await db.readings.toArray()
            let liveChart = new Chart(document.getElementById("live-chart"), {
                type: "line",
                data: {
                    labels: readings.map(row => row.timestamp),
                    datasets: [
                        { label: "ESP32 Temperature in °C (Celsius)", data: readings.map(row => row.internal_temp) },
                        { label: "Environment Temperature in °C (Celsius)", data: readings.map(row => row.external_temp) }
                    ]
                },
                options: {
                    scales: {
                        x: {
                            grid: { color: "#666" },
                            type: 'time'
                        },
                        y: {
                            grid: { color: "#666" }
                        }
                    },
                    elements: {
                        line: { tension: 0.4 }
                    }
                }
            })

            setInterval(async () => {
                webSocket.send("get_temp")
                let timestamp = new Date()
                if(store.internalTemp !== -500 && store.externalTemp !== -500 ) {
                    liveChart.data.labels.push(timestamp)
                    liveChart.data.datasets[0].data.push(store.internalTemp)
                    liveChart.data.datasets[1].data.push(store.externalTemp)
                    liveChart.update()
                    await db.readings.add({timestamp: timestamp, internal_temp: store.internalTemp, external_temp: store.externalTemp})
                }

            }, 5000)
        }
    }
}

function Temperatures() {
    return {
        $template: "#temperatures"
    }
}

createApp({
    store,
    TopNavbar,
    TemperatureChart,
    Temperatures,
}).mount("#app")

webSocket.onmessage = (e) => {
    let message = {}
    try {
        message = JSON.parse(e.data)
        store.internalTemp = message.internal
        store.externalTemp = message.external
    }
    catch (e) {}
}

webSocket.onclose = (e) => {
    location.reload()
}