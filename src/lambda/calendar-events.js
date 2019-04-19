require('dotenv').config()
const { google } = require('googleapis')

const MAX_RESULTS = process.env.MAX_RESULTS
const CALENDAR_ID = process.env.CALENDAR_ID

const getEvents = async () => {
  let token = {
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    token_type: "Bearer",
    expiry_date: process.env.EXPIRY_DATE
  }
  let client_id = process.env.CLIENT_ID
  let client_secret = process.env.CLIENT_SECRET
  let redirect_uris = process.env.REDIRECT_URI

  const oAuth2Client = await new google.auth.OAuth2(client_id, client_secret, redirect_uris)
  oAuth2Client.setCredentials(token)

  const calendar = google.calendar({
    version: 'v3',
    auth: oAuth2Client
  })

  return await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: (new Date()).toISOString(),
    maxResults: MAX_RESULTS || 3,
    singleEvents: true,
    orderBy: 'startTime'
  })
}

exports.handler = (event, context, callback) => {
  getEvents().then(res => {
    const events = res.data.items
    const calEvents = {
      success: true,
      message: 'success',
      events: []
    }
    if (events.length) {
      calEvents.events = events.map(event => ({
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        summary: event.summary,
        description: event.description
      }))
      return calEvents
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
      callback(e)
    })
}