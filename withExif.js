const toCoordinates = require("dms2dec")
const slug = require("slug")

const withExif = ({ exif, iptc, ...props }) => {
  const { gps } = exif
  const {
    keywords,
    date_time,
    sub_location,
    city,
    province_or_state,
    country_or_primary_location_code,
    country_or_primary_location_name
  } = iptc

  const location = [
    sub_location,
    city,
    province_or_state,
    country_or_primary_location_name
  ]
    .filter(n => n)
    .join(", ")

  const created = new Date(date_time)

  const [latitude, longitude] = toCoordinates(
    gps.GPSLatitude,
    gps.GPSLatitudeRef,
    gps.GPSLongitude,
    gps.GPSLongitudeRef
  )

  const tags = Array.from(
    new Set([
      ...location
        .split(", ")
        .map(x => x.toLowerCase())
        .map(k => slug(k))
    ])
  )
  return {
    ...props,
    exif,
    iptc,
    location,
    tags,
    created,
    latitude,
    longitude
  }
}

module.exports = withExif
