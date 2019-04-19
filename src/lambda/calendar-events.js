const { google } = require('googleapis')

// const TOKEN = process.env.TOKEN
// const CREDENTIALS = process.env.CREDENTIALS
// const CALENDAR_ID = process.env.CALENDAR_ID

const TOKEN = '{"access_token":"ya29.GlvrBnCImILDrwAjzMq2rkvxE6Ex8StL9SnTCSgskSAdQnfTXrtybNeEYU574gsHayAevmLXgfV4QduUHdRh94MIGcJsp7boT_XrkxcdcK_DgRZAIA7TtBPZxopl","refresh_token":"1/tJOLunTLM7MlvtCQlDSx5ZixMkSleVU3Qcra8GbC_J4","scope":"https://www.googleapis.com/auth/calendar.readonly","token_type":"Bearer","expiry_date":1555207789172}'
const CREDENTIALS = '{"installed": {"client_id": "701841266465-tofh1lmhavhkcnkej26akgn4vtm9203l.apps.googleusercontent.com","project_id": "quickstart-1554758372424","auth_uri": "https://accounts.google.com/o/oauth2/auth","token_uri": "https://oauth2.googleapis.com/token","auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs","client_secret": "ZJzqTwMqcp3ZJvMljfURbhlb","redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]}}'
const CALENDAR_ID = 'k00j76b2k0p976p3uncsfqduo8@group.calendar.google.com'


const getCredentials = () => {
  if (CREDENTIALS) {
    return JSON.parse(CREDENTIALS)
  }
  throw new Error('Unable to load credentials')
}

const getToken = () => {
  if (TOKEN) {
    return JSON.parse(TOKEN)
  }
  throw new Error('Unable to load token')
}

const getEvents = async () => {
  let credentials = getCredentials()
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed

  const token = getToken()
  const oAuth2Client = await new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
  oAuth2Client.setCredentials(token)

  const calendar = google.calendar({
    version: 'v3',
    auth: oAuth2Client
  })

  return await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: (new Date()).toISOString(),
    maxResults: 3,
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
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify(res)
      })
    })
    .catch(e => {
      callback(e)
    })

}