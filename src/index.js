
// Uses CommonJS, AMD or browser globals to create a jQuery plugin.

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = function (root, jQuery) {
      if (jQuery === undefined) {
        // require('jQuery') returns a factory that requires window to
        // build a jQuery instance, we normalize how we use modules
        // that require this pattern but the window provided is a noop
        // if it's defined (how jquery works)
        if (typeof window !== 'undefined') {
          jQuery = require('jquery');
        }
        else {
          jQuery = require('jquery')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {

  // Bootstrap version
  var BOOTSTRAP_VERSION = 4;
  var BOOTSTRAP_CURRENT_VERSION = $.fn.tooltip.Constructor.VERSION;

  // Check bootstrap version
  if (Number(BOOTSTRAP_CURRENT_VERSION.substr(0, 1)) < BOOTSTRAP_VERSION) {
    throw 'Bootstrap version is not ' + BOOTSTRAP_VERSION;
  }

  // Bootstrap plugin - Modal
  $.fn.bsModal = function (options) {

    var defaults = {

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
      onOpen: function () { },
      onClose: function () { },
      onOk: function () { },
      onCancel: function () { }

    };

    // Locale
    var userLang = navigator.language || navigator.userLanguage;
    var langs = $.extend({
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
    }, defaults.langs);
    var locale = langs[defaults.lang] || langs[userLang] || langs['en'];
    for (var v in locale) {
      defaults[v] = locale[v];
    }

    // Settings
    var settings = $.extend({}, defaults, options);
    settings.label = settings.label || (settings.id + 'Label');

    // Confirm mode
    if (settings.confirm) {
      settings.okBtnText = settings.confirmOkText;
      settings.cancelBtnText = settings.confirmCancelText;
      if (typeof options.close === 'undefined') {
        settings.close = false;
      }
      if (typeof options.backdrop === 'undefined') {
        settings.backdrop = 'static';
      }
    }

    var modal = null;

    // Existence modal
    if (typeof settings.modal === 'string') {
      modal = $(settings.modal);
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
        .appendTo('body');

      var modalDialog = $('<div class="modal-dialog" />')
        .attr({ role: 'document' })
        .appendTo(modal);

      var modalContent = $('<div class="modal-content" />')
        .appendTo(modalDialog);

      var modalHeader = $('<div class="modal-header" />')
        .appendTo(modalContent);

      $('<h' + settings.titleLavel + ' class="modal-title" />')
        .attr('id', settings.label)
        .text(settings.title)
        .appendTo(modalHeader);

      if (settings.body) {
        var modalBody = $('<div class="modal-body" />')
          .html(settings.body)
          .appendTo(modalContent);
      }

      var modalFooter = $('<div class="modal-footer" />')
        .appendTo(modalContent);

      if (settings.close) {
        $('<button class="close" type="button" data-dismiss="modal" aria-label="Close" />')
          .append($('<span aria-hidden="true">&times;</span>'))
          .appendTo(modalHeader);
      }

      var cancelBtn = $('<button type="button" data-dismiss="modal" />')
        .addClass('btn btn-' + settings.cancelBtnColor)
        .text(settings.cancelBtnText)
        .appendTo(modalFooter);

      var okBtn = $('<button type="button" />')
        .addClass('btn btn-' + settings.okBtnColor)
        .text(settings.okBtnText)
        .appendTo(modalFooter);

      // Event
      var _open = function () {
        settings.onOpen.call(this);
      }

      var _close = function () {
        settings.onClose.call(this);
      }

      var _ok = function () {
        if (settings.onOk.call(this) === false) {
          return;
        }
        modal.modal('hide');
      }

      var _cancel = function () {
        settings.onCancel.call(this);
      }

      modal.on('shown.bs.modal', _open);
      modal.on('hidden.bs.modal', _close);
      okBtn.on('click', _ok);
      cancelBtn.on('click', _cancel);

    }

    // Add this button data-toggle
    this.attr({
      'data-toggle': 'modal',
      'data-target': '#' + modal.attr('id')
    });

    return this;

  };

  // Bootstrap plugin - Cropper image modal
  $.fn.bsModalCropper = function (options) {

    var defaults = {

      // Basic
      id: 'exampleModalCropper',

      // Modal settings
      confirm: true,

      // image src
      src: '',
      imgId: 'exampleImage',

      // Cropper.js options
      cropper: {
        viewMode: 1
      },

      // Upload
      action: null,
      method: 'post',
      fileName: 'file',
      success: function () { },
      error: function () { },

      // Axios
      axios: null,
      axiosOriginalData: false,

      // Event
      onCropper: function () { }

    };

    var settings = $.extend({}, defaults, options);

    settings.cropper = $.extend({}, defaults.cropper, options.cropper);

    if (typeof Cropper === 'undefined') {
      throw 'Error: Cropper.js is not found.';
    }

    var image = $('<img />')
      .attr({
        id: settings.imgId,
        src: settings.src
      })
      .css('max-width', '100%')
      .get(0);

    var cropper;

    var _cropperImg = function (datURL, blob) {
      settings.onCropper.call(this, datURL, blob);
    }

    settings.body = $('<div class="img-container" />').html(image);

    settings.onOpen = function () {
      cropper = new Cropper(image, settings.cropper);
    }

    settings.onOk = function () {
      var croppedDataURL = cropper.getCroppedCanvas().toDataURL();
      cropper.destroy();

      // Renew image size
      makeRatioImgDataURI(croppedDataURL, {
        width: settings.maxWidth,
        height: settings.maxHeight
      }, function (dataURI) {

        // Event cropper image
        _cropperImg(dataURI, dataURItoBlob(dataURI));

        if (typeof settings.action === 'string') {
          // Upload image
          var blob = dataURItoBlob(dataURI);
          var formData = new FormData();
          formData.append(settings.fileName, blob);
          ajax(settings, formData);
        }
      });
    }

    settings.onCancel = function () {
      cropper.destroy();
    }

    // Call modal
    this.bsModal(settings);

    // Ajax function
    function ajax(settings, data) {
      if (settings.axios) {
        // Use axios
        settings.axios({
          url: settings.action,
          method: settings.method,
          data: data,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(function (res) {
          settings.success(settings.axiosOriginalData ? res : res.data);
        }).catch(settings.error);

      } else if (typeof $.ajax !== 'undefined') {
        // Use jquery ajax
        $.ajax(settings.action, {
          method: settings.method,
          data: data,
          processData: false,
          contentType: false,
          success: settings.success,
          error: settings.error
        });

      } else {
        throw 'Error: ajax function is not found, Can\'t upload image.';
      }
    }

    return this;

  };

  // Get new size image
  function makeRatioImgDataURI(dataURI, imgConfig, callback) {
    // Check width and height is exists
    if (typeof imgConfig.width === 'undefined' &&
      typeof imgConfig.height === 'undefined') {
      if (callback) {
        callback(dataURI);
        return;
      }
    }

    var aspectRatio = function (imgW, imgH, maxW, maxH) {
      return Math.min((maxW / imgW), (maxH / imgH));
    }

    var newDataURI = '';
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    var img = new Image();
    img.src = dataURI;
    img.onload = function () {
      var w = img.width;
      var h = img.height;
      var sizer = aspectRatio(w, h, imgConfig.width, imgConfig.height);
      canvas.width = w * sizer;
      canvas.height = h * sizer;
      ctx.drawImage(img, 0, 0, w, h, 0, 0, w * sizer, h * sizer);
      newDataURI = canvas.toDataURL();

      if (callback) {
        callback(newDataURI);
      }
    }
  }

  // DatURI to Blob
  function dataURItoBlob(dataURI) {
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }

}));
