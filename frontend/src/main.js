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
    readings: "++id, timestamp, temperature"
})

const store = reactive({
    sensorTemp: -500,

    getSensorTemp() {
        return this.sensorTemp
    },
    setSensorTemp(temp) {
        this.sensorTemp = temp
    }
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
                    datasets: [{
                        label: "Temperature in °C (Celsius)", data: readings.map(row => row.temperature),
                    }]
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
                    }
                }
            })

            setInterval(async () => {
                webSocket.send("get_temp");
                let timestamp = new Date()
                let reading = store.getSensorTemp()
                if(reading !== -500) {
                    liveChart.data.labels.push(timestamp)
                    liveChart.data.datasets[0].data.push(store.getSensorTemp())
                    liveChart.update()
                    await db.readings.add({timestamp: timestamp, temperature: reading})
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
}).mount("#app");

webSocket.onmessage = (e) => {
    if (!isNaN(e.data)) {
        let temperature = parseFloat(e.data);
        store.setSensorTemp(temperature);
    }
}