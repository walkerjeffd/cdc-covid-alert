const axios = require('axios')
const nodemailer = require('nodemailer')
require('dotenv').config()

const LEVELS = ['LOW', 'MEDIUM', 'HIGH']
const FIPS = process.env.FIPS
const URL = 'https://www.cdc.gov/coronavirus/2019-ncov/json/cdt-ccl-data.json?cachebust=1838309'

async function sendMail (mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function(err, data) {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

const transporter = nodemailer.createTransport(
  {
    service: 'gmail',
    auth:{
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  }
);

(async () => {
  try {
    const response = await axios.get(URL)
    const data = response.data.integrated_county_latest_external_data
    const row = data.find(d => d.fips_code === FIPS)
    if (!row) {
      throw new Error(`FIPS ${FIPS} not found`)
    }
    const level = LEVELS[Number(row.CCL_community_burden_level_integer)]
    const updated = row.CCL_report_date

    var mailOptions = {
      from: 'jeff@walkerenvres.com',
      to: 'jeff@thewalkers.me',
      subject: `CDC COVID Alert - ${level}`,
      text: `Current COVID risk level is ${level}. Last updated: ${updated}.`
    }
    const email = await sendMail(mailOptions)
    console.log(email)
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()