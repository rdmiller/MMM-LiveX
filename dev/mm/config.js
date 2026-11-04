// A mirror for trying the module: MagicMirror's own clock, weather and calendar for a home in
// Minneapolis, with the globe facing it in the middle. dev/mm/up.sh serves it.
let config = {
  address: '0.0.0.0',
  port: 8080,
  ipWhitelist: [],
  language: 'en',
  locale: 'en-US',
  timeFormat: 12,
  units: 'imperial',

  modules: [
    {
      module: 'clock',
      position: 'top_left',
    },
    {
      module: 'calendar',
      header: 'US Holidays',
      position: 'top_left',
      config: {
        maximumEntries: 4,
        calendars: [
          {
            symbol: 'calendar-check',
            url: 'https://ics.calendarlabs.com/76/mm3137/US_Holidays.ics',
          },
        ],
      },
    },
    {
      module: 'weather',
      position: 'top_right',
      config: {
        weatherProvider: 'openmeteo',
        type: 'current',
        lat: 44.98,
        lon: -93.27,
      },
    },
    {
      module: 'weather',
      position: 'top_right',
      header: 'Forecast',
      config: {
        weatherProvider: 'openmeteo',
        type: 'forecast',
        maxNumberOfDays: 4,
        lat: 44.98,
        lon: -93.27,
      },
    },
    {
      module: 'MMM-LiveX',
      position: 'middle_center',
      config: {
        width: '960px',
        lat: 44.98,
        lon: -93.27,
      },
    },
  ],
};

if (typeof module !== 'undefined') module.exports = config;
