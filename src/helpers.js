/**
 * Get new size image
 * @param {string} dataURI
 * @param {object} imgConfig
 * @param {function} callback
 */
export const makeRatioImgDataURI = function (dataURI, imgConfig, callback) {
  // Check width and height is exists
  if (imgConfig.width === null &&
    imgConfig.height === null) {
    if (callback) {
      callback(dataURI)
      return
    }
  }

  const aspectRatio = (imgW, imgH, maxW, maxH) => Math.min((maxW / imgW), (maxH / imgH))

  let newDataURI = ''
  let canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')

  let img = new Image()
  img.src = dataURI
  img.onload = () => {
    const w = img.width
    const h = img.height
    const sizer = aspectRatio(w, h, imgConfig.width, imgConfig.height)
    canvas.width = w * sizer
    canvas.height = h * sizer
    ctx.drawImage(img, 0, 0, w, h, 0, 0, w * sizer, h * sizer)
    newDataURI = canvas.toDataURL()

    if (callback) {
      callback(newDataURI)
    }
  }
}

/**
 * DatURI to Blob
 * @param {string} dataURI
 */
export const dataURItoBlob = function (dataURI) {
  let byteString
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1])
  } else {
    byteString = unescape(dataURI.split(',')[1])
  }
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ia = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ia], { type: mimeString })
}

/**
 * Blob to DataURL
 * @param {Blob|File} blob 
 * @param {function} callback 
 */
export const blobtoDataURL = function (blob, callback) {
  const fr = new FileReader()
  fr.onload = e => {
    callback(e.target.result)
  }
  fr.readAsDataURL(blob)
}

export default {
  makeRatioImgDataURI,
  dataURItoBlob,
  blobtoDataURL
}
