// this will assume we are getting the event Id from FullCalendar
require('dotenv').config()
const { google } = require('googleapis')

// let's keep it simple for now, only work with one calendar

// stuff needed to access a calendar
const CALENDAR_ID = process.env.CALENDAR_ID
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

const TOKEN = {
  access_token: process.env.ACCESS_TOKEN,
  refresh_token: process.env.REFRESH_TOKEN,
  scope: "https://www.googleapis.com/auth/calendar",
  token_type: "Bearer",
  expiry_date: process.env.EXPIRY_DATE
}

// auth with google
const Authorize = async () => {
  let oAuth2Client = await new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
  oAuth2Client.setCredentials(TOKEN)
  return await google.calendar({
    version: 'v3',
    auth: oAuth2Client
  })
}

// this will look a LOT like calendar-events, but we don't
// want the event by date, we want it by it's Id
// typical usage would be to fill out a form for editing

const getEvent = async (eventId) => {
  console.log(eventId, CALENDAR_ID)
  const calendar = await Authorize()
  return await calendar.events.get({ "calendarId":CALENDAR_ID, "eventId":eventId })
}

exports.handler = (event, context, callback) => {
  let { eventId } = event.queryStringParameters
  getEvent(eventId).then(res => {
    const calEvent = {
      success: true,
      message: 'success',
      event: {
        id: res.data.id,
        status: res.data.status,
        iCalUID: res.data.iCalUID,
        recurringEventId: res.data.recurringEventId,
        htmlLink: res.data.htmlLink,
        extendedProperties: res.data.extendedProperties,
        start: res.data.start,
        end: res.data.end,
        summary: res.data.summary,
        description: res.data.description
      }
    }
    if (calEvent.event.id) {
      return calEvent
    } else {
      calEvent.event = "none"
      return calEvent
    }
  })
    .then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          'Access-Control-Allow-Headers': 'application/json',
        },
        body: JSON.stringify(res)
      })
    })
    .catch(e => {
      callback(`${e} :${eventId}, ${CALENDAR_ID}`)
    })
}