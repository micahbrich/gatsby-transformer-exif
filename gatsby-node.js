const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const ExifImage = util.promisify(require('exif').ExifImage)
const IPTC = require('node-iptc')
const withExif = require('./withExif')

const isImage = ({ internal: { mediaType } }) => ['image/jpeg'].includes(mediaType)

const getExifAndIPTC = async ({ absolutePath }) => {
  const file = await readFile(absolutePath)
  const iptc = await IPTC(file)
  const exif = await new ExifImage({ image: absolutePath })
  return { iptc, exif }
}

exports.onCreateNode = async ({ node, actions, createNodeId }) => {
  if (isImage(node)) {
    const { createNode, createParentChildLink } = actions
    const data = await getExifAndIPTC(node)
    const exif = await withExif(data)
    const exifNode = {
      id: createNodeId(`${node.id} >> ImageExif`),
      children: [],
      ...exif,
      parent: node.id,
      internal: {
        contentDigest: `${node.internal.contentDigest}`,
        type: `ImageExif`,
      },
    }

    createNode(exifNode)
    createParentChildLink({ parent: node, child: exifNode })

  }
}
