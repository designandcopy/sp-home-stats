const scrapeIt = require("scrape-it")
const fs = require("fs")
const csv = require("ya-csv")

// selectors for articles that have a teaser
// and articles which are just compact links
const allarticles =
  "#content-main .teaser .article-title" +
  "," +
  "#content-main .teaser .article-list li"

const scraperConfig = {
  site: "http://spiegel.de",
  selectors: {
    // get all posts
    postsInMainContent: {
      listItem: allarticles,
      name: "links",
      data: {
        url: {
          selector: "a",
          attr: "href"
        },
        // the core bit of the headline
        headline: ".headline, .asset-headline",
        // the prefix part of the headline
        headlineintro: ".headline-intro, .asset-headline-intro",
        articleID: {
          selector: ".spiegelplus",
          // this data attr contains the LP article ID
          attr: "data-lp-article-id"
        },
        classnames: {
          selector: ".spiegelplus",
          // premium articles without teaser lack the data attr
          attr: "class"
        }
      }
    },
    // get the spiegel plus module box
    postsInPlusModuleBox: {
      listItem:
        "#content-main .module-box.spiegelplus .spiegelplus.js-lp-article-link",
      data: {
        url: {
          attr: "href"
        },
        // the core bit of the headline
        headline: ".headline",
        // the prefix part of the headline
        headlineintro: ".headline-intro",
        articleID: {
          attr: "data-lp-article-id"
        }
      }
    },
    postsInSideBarWidget: {
      listItem: ".column-small .asset-box li > a.spiegelplus",
      data: {
        url: {
          attr: "href"
        },
        // the core bit of the headline
        headline: ".asset-headline",
        // the prefix part of the headline
        headlineintro: ".asset-headline-intro",
        articleID: {
          attr: "data-lp-article-id"
        }
      }
    }
  }
}

const processScrapedData = scrapedData => {
  // timestamp
  function generateTimestamp () {
    const now = new Date()
    return now.toISOString()
  }
  const retrieved = generateTimestamp()

  // process main articles
  const dataMainArea = scrapedData.postsInMainContent.map((article, i) => {
    // paid content has a data attr for the article ID
    // or a .spiegelplus CSS class
    const isPaidContent =
      article.articleID > 0 || article.classnames != undefined
    // we can also extract the article ID from the html filename
    const getArticleIDFromURL = article.url.match(/\d{6,}(?=\.html)/)
    // ...and use that as a fallback
    const fallbackArticleID =
      getArticleIDFromURL != null ? getArticleIDFromURL.toString() : undefined
    return Object.assign({}, article, {
      position: i + 1,
      articleid: fallbackArticleID,
      paidcontent: isPaidContent,
      retrieved,
      area: "main"
    })
  })

  // process spiegel plus module container in main area
  const dataPlusModuleBox = scrapedData.postsInPlusModuleBox.map(
    (article, i) => {
      let fallbackArticleID = article.url.match(/\d{6,}(?=\.html)/)
      return Object.assign({}, article, {
        position: i + 1,
        articleid: fallbackArticleID,
        paidcontent: true,
        retrieved,
        area: "spiegel plus modulebox"
      })
    }
  )

  // process sidebar
  const dataSidebar = scrapedData.postsInSideBarWidget.map((article, i) => {
    let fallbackArticleID = article.url.match(/\d{6,}(?=\.html)/)
    return Object.assign({}, article, {
      position: i + 1,
      articleid: fallbackArticleID,
      paidcontent: true,
      retrieved,
      area: "sidebar"
    })
  })

  const collectedData = []
  collectedData.push(dataMainArea, dataPlusModuleBox, dataSidebar)
  const result = [].concat(...collectedData)

  return result
}

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
    "retrieved",
    "area"
  ])
}

// this only needs to happen once with a fresh file
initCSVHeaders()


function exportDataSample() {
	let firstRun = true

  // returns boolean
  function isNewData(oldItem, newItem) {
		const compareObjects = JSON.stringify(oldItem) === JSON.stringify(newItem)
    return !compareObjects
  }

  // recursively runs function with data for comparison
  function restartProcess(payload) {
    setTimeout(() => scrapeAndWrite(payload), 3000)
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
        item.retrieved,
        item.area
      )
      writer.writeRecord(result)
    })
  }

  function handleData(input, oldData) {
    // console.log("data scraped")

		const freshData = isNewData(input, oldData)

    if (firstRun) {
      console.log(Date(),"first run, writing data")
      writeData(input)
      oldData = input
      firstRun = false
      console.log("first run disabled, cached results")
    }

    if (!firstRun && freshData) {
      console.log(Date(), "data changed, writing results")
			writeData(input)
			oldData = input
      restartProcess(oldData)
    } else if (!freshData){
      console.log("no new data, restarting")
      restartProcess(input)
		} else {console.log("error")}

  }

  function scrapeAndWrite(oldData) {
    scrapeIt(scraperConfig.site, scraperConfig.selectors).then(rawData =>
      handleData(rawData, oldData)
    )
  }

  scrapeAndWrite()
}

exportDataSample()
