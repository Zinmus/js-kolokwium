import axios from 'axios'
import Chart from 'chart.js/auto'

const ctx = document.getElementById('chart')
const baseCurrencyElement = document.getElementById('cur-base')
const refCurrencyElement = document.getElementById('cur-ref')
const addRefButton = document.getElementById('add-ref')
const removeRefButton = document.getElementById('remove-ref')
const dateSpanButtons = document.querySelectorAll('.date-span')
const exchangeList = document.getElementById('exchange-list')
const exchangeListReverse = document.getElementById('exchange-list-reverse')
const loader = document.getElementById('loader')

let baseCurrency = 'PLN'
let references = ['USD', 'EUR']
let dateSpan = '1y'
let chartData = {
  labels: [],
  datasets: []
}

// add event listener to currency-1
baseCurrencyElement.addEventListener('change', (e) => {
  baseCurrency = e.target.value
  // update chart
  updateDataset()
})

refCurrencyElement.addEventListener('change', (e) => {
  const cur = e.target.value
  if (references.includes(cur)) {
    addRefButton.disabled = true
    removeRefButton.disabled = false
  } else {
    addRefButton.disabled = false
    removeRefButton.disabled = true
  }
})

addRefButton.addEventListener('click', (e) => {
  const cur = refCurrencyElement.value
  references.push(cur)
  addRefButton.disabled = true
  removeRefButton.disabled = false
  updateDataset()
})

removeRefButton.addEventListener('click', (e) => {
  const cur = refCurrencyElement.value
  references = references.filter((ref) => ref !== cur)
  addRefButton.disabled = false
  removeRefButton.disabled = true
  updateDataset()
})

dateSpanButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    dateSpanButtons.forEach((btn) => (btn.disabled = false))
    e.target.disabled = true
    dateSpan = e.target.dataset.span
    updateDataset()
  })
})

function updateDataset() {
  let end_date = new Date()
  let start_date = new Date()
  switch (dateSpan) {
    case '1y':
      start_date.setFullYear(start_date.getFullYear() - 1)
      break
    case '6m':
      start_date.setMonth(start_date.getMonth() - 6)
      break
    case '1m':
      start_date.setMonth(start_date.getMonth() - 1)
      break
    case '2w':
      start_date.setDate(start_date.getDate() - 14)
      break
    case '1w':
      start_date.setDate(start_date.getDate() - 7)
      break
  }
  if (references.length === 0) {
    chartData.datasets = []
    updateChart()
    return
  }
  loader.classList.remove('hidden')
  axios
    .get('https://api.exchangerate.host/timeseries', {
      params: {
        base: baseCurrency,
        symbols: references.join(','),
        start_date: start_date.toISOString().split('T')[0],
        end_date: end_date.toISOString().split('T')[0]
      }
    })
    .then((res) => {
      chartData = { datasets: [] }
      chartData.labels = Object.keys(res.data.rates)

      // extract currencies from rates
      let keys = Object.keys(res.data.rates[chartData.labels[0]])

      // create dataset for each currency
      keys.forEach((key) => {
        let data = []
        chartData.labels.forEach((label) => {
          data.push(res.data.rates[label][key])
        })
        chartData.datasets.push({
          label: key,
          data: data
        })
      })
      updateChart()
      updateList()
      loader.classList.add('hidden')
    })
}

function updateChart() {
  chart.clear()
  chart.data = chartData
  chart.update()
}

function updateList() {
  exchangeList.innerHTML = ''
  chartData.datasets.forEach((cur) => {
    const li = document.createElement('li')
    li.innerHTML = `1000 ${baseCurrency} = ${(
      cur.data[cur.data.length - 1] * 1000
    ).toFixed(2)} ${cur.label}`
    exchangeList.appendChild(li)
  })

  exchangeListReverse.innerHTML = ''
  chartData.datasets.forEach((cur) => {
    const li = document.createElement('li')
    li.innerHTML = `1000 ${cur.label} = ${(
      1000 / cur.data[cur.data.length - 1]
    ).toFixed(2)} ${baseCurrency}`
    exchangeListReverse.appendChild(li)
  })
}

const chart = new Chart(ctx, {
  type: 'line'
})
updateDataset()

axios.get('https://api.exchangerate.host/symbols').then((res) => {
  let selectElements = document.querySelectorAll('select.currency')
  selectElements.forEach((element) => {
    for (let key in res.data.symbols) {
      let option = document.createElement('option')
      if (key === baseCurrency && element.id === 'cur-base') {
        option.selected = true
      }
      if (references.includes(key) && element.id === 'cur-ref') {
        option.selected = true
      }
      option.value = key
      option.innerText = res.data.symbols[key].description
      element.appendChild(option)
    }
  })
})
