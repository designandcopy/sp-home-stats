const csv = require("ya-csv")
const fs = require("fs")
const scrapeIt = require("scrape-it")

// import scraper css selector configuration
const config = require("./modules/config")
// import methods to transform scraped data before writing
const processScrapedData = require("./modules/transformers")

// configure csv output stream
const writer = csv.createCsvStreamWriter(
  fs.createWriteStream("output.csv", { flags: "a" })
)

// initialize CSV file with headers
const initCSVHeaders = () => {
  writer.writeRecord([
    "url",
    "headline",
    "headlineintro",
    "position",
    "articleid",
    "paidcontent",
    "hasTeaser",
    "retrieved",
    "area"
  ])
}

// main function
function exportDataSample() {
	// flag for writing CSV headers on first run
  let firstRun = true

  // string comparison of scraped data, returns boolean
  function isNewData(oldItem, newItem) {
    const compareObjects = JSON.stringify(oldItem) === JSON.stringify(newItem)
    return !compareObjects
  }

  // recursively runs function with data for comparison
  function restartProcess(payload) {
    setTimeout(() => scrapeAndWrite(payload, false), 10000)
  }

  function writeData(data) {
    // generate array to feed CSV writer
    const csvReadyData = processScrapedData(data)
    csvReadyData.map(item => {
      const result = []
      result.push(
        item.url,
        item.headline,
        item.headlineintro,
        item.position,
        item.articleid,
        item.paidcontent,
        item.hasTeaser,
        item.retrieved,
        item.area
      )
      writer.writeRecord(result)
    })
  }

  function handleData(input, oldData, firstRun) {
    // console.log("data scraped")

    const freshData = isNewData(input, oldData)
    console.log("is first run?", firstRun)
    if (firstRun) {
      console.log(Date(), "first run, writing data")
      writeData(input)
      oldData = input
      restartProcess(oldData)
      console.log("first run disabled, cached results")
    }
    if (!firstRun && freshData) {
      console.log(Date(), "data changed, writing results")
      writeData(input)
      oldData = input
      restartProcess(oldData)
    } else if (!freshData) {
      console.log("no new data, restarting")
      restartProcess(input)
    }
  }

  function scrapeAndWrite(oldData, firstRun) {
    scrapeIt(config.site, config.selectors).then(rawData =>
      handleData(rawData, oldData, firstRun)
    )
  }

  scrapeAndWrite(null, true)
}

// this only needs to happen once with a fresh file
//initCSVHeaders()

// start data collection
//exportDataSample()

const testScraper = () => scrapeIt(config.site, config.selectors).then(rawData =>
	console.log(processScrapedData(rawData))
)

testScraper()
