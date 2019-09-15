const express = require('express')
const app = express()
const axios = require('axios')
const cheerio = require('cheerio')

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))


//Markaya ait telefonların modellerinin olduğu sayfanın urlleri ile telefon markaları
app.get('/scrapeBrandUrls', (req, res) => {
  const url = 'https://www.devicespecifications.com/tr'
  axios(url)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html)
      const brands = $('div.brand-listing-container-frontpage a')
      let data = []
      brands.each(function () {
        const brand = $(this).text()
        const brandUrl = $(this).attr('href')
        data.push({
          brand,
          brandUrl
        })
      })
      res.status(200).json({
        result: {
          data
        }
      })
    })
    .catch(err => {
      res.status(200).json({
        result: {
          data: [],
          err
        }
      })
    })
})

//bir markaya ait telefonların detay sayfasının urlleri ve çıkış tarihlerine göre markanın modelleri
app.get('/scrapePhonesByBrand', (req, res) => {
  const url = 'https://www.devicespecifications.com/tr/brand/e7aa12e'

  axios(url)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html)
      const brand = $('#main>nav>span').last().text()
      let data = []
      const dataHeader = $('#main > header.section-header')

      data.push({
        brand
      })
      dataHeader.each(function () {
        const header = $(this).find('h1').text()
        const subheader = $(this).find('h2').text()
        const phoneContainer = $(this).next().find('div')
        let phoneList = []
        phoneContainer.each(function () {
          $(this).each(function () {
            const model = $(this).find('h3').text()
            const url = $(this).find('a').first().attr('href')
            phoneList.push({
              model,
              url
            })
          })
        })
        if (header !== '') {
          data.push({
            header,
            subheader,
            phoneList
          })
        }
      })
      res.status(200).json({
        result: {
          data
        }
      })
    })
    .catch(err => {
      res.status(200).json({
        result: {
          data: [],
          err
        }
      })
    })
})

//Telefon detay sayfası
app.get('/scrapeMobileInfo', (req, res) => {
  const url = 'https://www.devicespecifications.com/tr/model/c35051e5'
  axios(url)
    .then((response) => {
      let data = []
      const html = response.data
      const $ = cheerio.load(html)
      const title = $('#main > header > h1').text()
      data.push({
        title
      })
      const dataHeader = $('#main > div > header.section-header')
      dataHeader.each(function () {
        const header = $(this).find('h2').text()
        const subheader = $(this).find('h3').text()
        const tableRows = $(this).next().find('tr')
        let specs = []
        tableRows.each(function () {
          const title = $(this).find('td').first().text()
          const info = $(this).find('td').last().text()
          specs.push({
            title,
            info
          })
        })
        data.push({
          header,
          subheader,
          specs
        })
      })
      res.status(200).json({
        result: {
          data
        }
      })
    })
    .catch(err => {
      res.status(200).json({
        result: {
          data: [],
          err
        }
      })
    })
})
module.exports = {
  path: '/api/scrape',
  handler: app
}
