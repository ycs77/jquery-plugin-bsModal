
// Uses CommonJS, AMD or browser globals to create a jQuery plugin.

;(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory)
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = (root, jQuery) => {
      if (jQuery === undefined) {
        // require('jQuery') returns a factory that requires window to
        // build a jQuery instance, we normalize how we use modules
        // that require this pattern but the window provided is a noop
        // if it's defined (how jquery works)
        if (typeof window !== 'undefined') {
          jQuery = require('jquery')
        }
        else {
          jQuery = require('jquery')(root)
        }
      }
      factory(jQuery)
      return jQuery
    }
  } else {
    // Browser globals
    factory(jQuery)
  }
}($ => {

  // Bootstrap plugin - Modal
  $.fn.bsModal = function (options) {

    let defaults = {

      // Basic
      id: 'exampleModal',
      title: 'Modal title',
      titleLavel: 5,
      body: '',

      // Advanced
      label: null,
      lang: null,

      // Modal selector
      modal: null,
      fade: true,
      close: true,
      backdrop: true,
      confirm: false,

      // Text
      okBtnText: '',
      cancelBtnText: '',
      confirmOkText: '',
      confirmCancelText: '',
      langs: {},

      // Color
      okBtnColor: 'primary',
      cancelBtnColor: 'secondary',

      // Event
      onOpen: () => { return true },
      onClose: () => { return true },
      onOk: () => { return true },
      onCancel: () => { return true }

    }

    // Locale
    const langs = $.extend({
      'en': {
        okBtnText: 'Save',
        cancelBtnText: 'Close',
        confirmOkText: 'OK',
        confirmCancelText: 'Cancel'
      },
      'zh-TW': {
        okBtnText: '儲存',
        cancelBtnText: '關閉',
        confirmOkText: '確定',
        confirmCancelText: '取消'
      }
    }, defaults.langs)
    const locale = langs[defaults.lang] || langs[navigator.language || navigator.userLanguage] || langs['en']
    for (const v in locale) {
      defaults[v] = locale[v]
    }

    // Settings
    let settings = $.extend({}, defaults, options)
    settings.label = settings.label || `${settings.id}Label`

    // Confirm mode
    if (settings.confirm) {
      settings.okBtnText = settings.confirmOkText
      settings.cancelBtnText = settings.confirmCancelText
      if (typeof options.close === 'undefined') {
        settings.close = false
      }
      if (typeof options.backdrop === 'undefined') {
        settings.backdrop = 'static'
      }
    }

    let modal = null

    // Existence modal
    if (typeof settings.modal === 'string') {
      modal = $(settings.modal)
    }

    // Create modal
    if (modal === null) {
      modal = $('<div class="modal" />')
        .addClass(settings.fade ? 'fade' : '')
        .attr({
          id: settings.id,
          tabindex: '-1',
          role: 'dialog',
          'aria-labelledby': settings.label,
          'data-backdrop': settings.backdrop
        })
        .appendTo('body')

      const modalDialog = $('<div class="modal-dialog" />')
        .attr({ role: 'document' })
        .appendTo(modal)

      const modalContent = $('<div class="modal-content" />')
        .appendTo(modalDialog)

      const modalHeader = $('<div class="modal-header" />')
        .appendTo(modalContent)

      $(`<h${settings.titleLavel} class="modal-title" />`)
        .attr('id', settings.label)
        .html(settings.title)
        .appendTo(modalHeader)

      if (settings.body) {
        $('<div class="modal-body" />')
          .html(settings.body)
          .appendTo(modalContent)
      }

      const modalFooter = $('<div class="modal-footer" />')
        .appendTo(modalContent)

      if (settings.close) {
        $('<button class="close" type="button" data-dismiss="modal" aria-label="Close" />')
          .append($('<span aria-hidden="true">&times;</span>'))
          .appendTo(modalHeader)
      }

      const cancelBtn = $('<button type="button" data-dismiss="modal" />')
        .addClass(`btn btn-${settings.cancelBtnColor}`)
        .text(settings.cancelBtnText)
        .appendTo(modalFooter)

      const okBtn = $('<button type="button" />')
        .addClass(`btn btn-${settings.okBtnColor}`)
        .text(settings.okBtnText)
        .appendTo(modalFooter)

      // Event
      const _open = () => {
        settings.onOpen.call(this)
      }

      const _close = () => {
        settings.onClose.call(this)
      }

      const _ok = () => {
        if (settings.onOk.call(this) === false) {
          return
        }
        modal.modal('hide')
      }

      const _cancel = () => {
        settings.onCancel.call(this)
      }

      modal.on('shown.bs.modal', _open)
      modal.on('hidden.bs.modal', _close)
      okBtn.on('click', _ok)
      cancelBtn.on('click', _cancel)

    }

    // Set modal to public
    this.modal = modal

    // Add this button data-toggle
    this.attr({
      'data-toggle': 'modal',
      'data-target': `#${modal.attr('id')}`
    })

    return this

  }

  // Bootstrap plugin - Cropper image modal
  $.fn.bsModalCropper = function (options) {

    if (typeof Cropper === 'undefined') {
      throw 'Error: Cropper.js is not found.'
    }

    let defaults = {

      // Basic
      id: 'exampleModalCropper',

      // Modal settings
      confirm: true,

      // image src
      src: null,
      imgId: 'exampleImage',

      // Cropper.js options
      cropper: {
        viewMode: 1
      },
      maxWidth: null,
      maxHeight: null,

      // Upload
      action: null,
      method: 'post',
      fileName: 'file',
      data: {},
      uploadConfig: {
        allowTypes: [
          'image/jpeg',
          'image/png'
        ],
        maxSize: Math.pow(1024, 2) * 5 // 5M
      },
      success: () => { },
      error: () => { },

      // Axios
      axios: null,
      axiosOriginalData: false,

      // Event
      onUpload: () => { return true },
      onUploadError: () => { return true },
      onCropper: () => { return true }

    }

    let settings = $.extend({}, defaults, options)
    settings.cropper = $.extend({}, defaults.cropper, options.cropper)
    settings.uploadConfig = $.extend({}, defaults.uploadConfig, options.uploadConfig)

    /**
     * @var {*} image Cropper image DOM
     */
    let image = $('<img />')
      .attr('id', settings.imgId)
      .css('max-width', '100%')

    /**
     * @var {*} cropper Cropper object
     */
    let cropper

    settings.body = $('<div class="img-container" />').append(image)

    settings.onOpen = () => {
      cropper = new Cropper(image.get(0), settings.cropper)
    }

    settings.onOk = () => {
      const croppedDataURL = cropper.getCroppedCanvas().toDataURL()
      cropper.destroy()

      // Renew image size
      makeRatioImgDataURI(croppedDataURL, {
        width: settings.maxWidth,
        height: settings.maxHeight
      }, dataURI => {

        // Cropper image event
        settings.onCropper.call(this, dataURI, dataURItoBlob(dataURI))

        if (typeof settings.action === 'string') {
          // Upload image to server
          const blob = dataURItoBlob(dataURI)
          const formData = new FormData()

          // Upload file
          formData.append(settings.fileName, blob)

          // Upload data
          const dataKeys = Object.keys(settings.data)
          if (dataKeys.length) {
            dataKeys.forEach(key => {
              formData.append(key, settings.data[key]);
            })
          }

          // Use ajax post to server
          ajax(settings, formData)
        }
      })
    }

    settings.onCancel = () => {
      cropper.destroy()
    }

    if (settings.src) {
      image.attr('src', settings.src)

      this.bsModal(settings)
    } else {
      // Upload image to browser

      /**
       * @var {object} inputFile Input file DOM
       */
      let inputFile = this.children('input[type=file]').get(0)

      inputFile.onchange = () => {
        if (!inputFile.files.length) {
          return
        }

        /**
         * @var {File} file Upload file - image
         */
        let file = inputFile.files[0]

        if (settings.onUpload.call(this) === false) {
          return
        }

        if (settings.uploadConfig.allowTypes) {
          /**
           * @var {array} allowTypes
           */
          const allowTypes = settings.uploadConfig.allowTypes
          if (!allowTypes.some(v => v === file.type)) {
            settings.onUploadError.call(this, 'Upload file type is wrong')
            return
          }
        }

        // Validate image max size
        if (settings.uploadConfig.maxSize) {
          /**
           * @var {number} maxSize
           */
          const maxSize = settings.uploadConfig.maxSize
          if (file.size > maxSize) {
            let maxSizeText
            if (maxSize < 1024) {
              maxSizeText = `${maxSize} B`
            } else if (maxSize >= Math.pow(1024, 1) && maxSize < Math.pow(1024, 2)) {
              maxSizeText = `${Math.floor(maxSize / Math.pow(1024, 1))} KB`
            } else if (maxSize >= Math.pow(1024, 2) && maxSize < Math.pow(1024, 3)) {
              maxSizeText = `${Math.floor(maxSize / Math.pow(1024, 2))} MB`
            }
            settings.onUploadError.call(this, `Uploaded file cannot be larger than ${maxSizeText}`)
            return
          }
        }

        blobtoDataURL(file, dataURL => {
          settings.src = dataURL
          image.attr('src', settings.src)

          // Call modal
          this.bsModal(settings)
          this.modal.modal('show')

          // Remove this button data-toggle
          this.removeAttr('data-toggle').removeAttr('data-target')
        })
      }
    }

    /**
     * Ajax function
     * @param {object} settings
     * @param {FormData} formData
     */
    function ajax(settings, formData) {
      if (settings.axios) {
        // Use axios
        settings.axios({
          url: settings.action,
          method: settings.method,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(res => {
          settings.success(settings.axiosOriginalData ? res : res.data)
        }).catch(settings.error)

      } else if (typeof $.ajax !== 'undefined') {
        // Use jquery ajax
        $.ajax(settings.action, {
          method: settings.method,
          data: formData,
          processData: false,
          contentType: false,
          success: settings.success,
          error: settings.error
        })

      } else {
        throw 'Error: ajax function is not found, Can\'t upload image.'
      }
    }

    return this

  }

  /**
   * Get new size image
   * @param {string} dataURI
   * @param {object} imgConfig
   * @param {function} callback
   */
  function makeRatioImgDataURI(dataURI, imgConfig, callback) {
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
  function dataURItoBlob(dataURI) {
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
  function blobtoDataURL(blob, callback) {
    const fr = new FileReader()
    fr.onload = e => {
      callback(e.target.result)
    }
    fr.readAsDataURL(blob)
  }

}))
