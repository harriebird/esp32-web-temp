import "@picocss/pico"
import "./style.css"
import { createApp, reactive } from "petite-vue"
import { Chart } from "chart.js"

const webSocket = new WebSocket('ws://' + location.hostname + '/socket');

const store = reactive({
    currentPage: "home",
    sensorTemp: 0,
    chartData: [],

    getCurrentPage() {
        return this.currentPage;
    },
    setCurrentPage(page) {
        this.currentPage = page;
    },

    getSensorTemp() {
        return this.sensorTemp;
    },
    setSensorTemp(temp) {
        this.sensorTemp = temp;
    },

    getChartData() {
        return this.chartData;
    },
    addChartData(temp) {
        let data = {
            timestamp: new Date().toISOString(),
            temperature: temp
        }
        this.chartData.push(data);
    }
});

function TopNavbar(props) {
    return {
        $template: "#top-navbar"
    }
}

function HomePage(props) {
    return {
        $template: "#home-page"
    }
}

function ChartPage(props) {
    return {
        $template: "#chart-page",
        mounted() {
            new Chart(
                document.getElementById("live-chart"),
                {
                    type: "line",
                    data: {
                        labels: store.getChartData().map(row => row.timestamp),
                        datasets: [
                            {
                                label: "Temperature in °C (Celsius)",
                                data: store.getChartData().map(row => row.temperature)
                            }
                        ]
                    }
                }
            );
            console.log("chart created!")
        }
    }
}

function AboutPage(props) {
    return {
        $template: "#about-page"
    }
}

createApp({
    store,
    TopNavbar,
    HomePage,
    ChartPage,
    AboutPage
}).mount("#app");

webSocket.onmessage = (e) => {
    if (!isNaN(e.data)) {
        let temperature = parseFloat(e.data);
        store.setSensorTemp(temperature);
        store.addChartData(temperature);
    }
}

let backgroundCollect = setInterval(() => {
    webSocket.send("get_temp");
}, 1000);