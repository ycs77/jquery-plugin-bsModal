/*!
 * bsmodal.js v1.0.7
 * https://github.com/yangchenshin77/bsModal
 *
 * Copyright 2018 Chen-shin, Yang
 * Released under the MIT license
 *
 * Date: 2018-12-21T04:56:38.557Z
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define(['jquery'], factory) :
  (factory(global.jQuery));
}(this, (function ($) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  /*!
   * recursive-object-assign
   * https://github.com/gmasmejean/recursiveAssign
   */

  var assign = function assign(ref, key, value) {
    if (isPlainObject(value)) {
      if (!isPlainObject(ref[key])) {
        ref[key] = {};
      }
      mergeInObject(ref[key], value);
    } else {
      ref[key] = value;
    }
  };

  var mergeInObject = function mergeInObject(dest, data) {
    Object.keys(data).forEach(function (key) {
      assign(dest, key, data[key]);
    });
  };

  var isPlainObject = function isPlainObject(o) {
    return o !== undefined && o !== null && o.constructor !== undefined && o.constructor.prototype === Object.prototype;
  };

  function recursiveAssign (object) {
    if ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object') {
      for (var _len = arguments.length, toassign = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        toassign[_key - 1] = arguments[_key];
      }

      toassign.forEach(function (data) {
        if (isPlainObject(data)) {
          mergeInObject(object, data);
        }
      });
    }
    return object;
  }

  /**
   * Get new size image
   * @param {string} dataURI
   * @param {object} imgConfig
   * @param {function} callback
   */
  var makeRatioImgDataURI = function makeRatioImgDataURI(dataURI, imgConfig, callback) {
    // Check width and height is exists
    if (imgConfig.width === null && imgConfig.height === null) {
      if (callback) {
        callback(dataURI);
        return;
      }
    }

    var aspectRatio = function aspectRatio(imgW, imgH, maxW, maxH) {
      return Math.min(maxW / imgW, maxH / imgH);
    };

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
    };
  };

  /**
   * DatURI to Blob
   * @param {string} dataURI
   */
  var dataURItoBlob = function dataURItoBlob(dataURI) {
    var byteString = void 0;
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
  };

  /**
   * Blob to DataURL
   * @param {Blob|File} blob 
   * @param {function} callback 
   */
  var blobtoDataURL = function blobtoDataURL(blob, callback) {
    var fr = new FileReader();
    fr.onload = function (e) {
      callback(e.target.result);
    };
    fr.readAsDataURL(blob);
  };

  if ($.fn) {

    // Bootstrap plugin - Modal
    $.fn.bsModal = function (options) {
      var _this = this;

      var defaults = {

        // Basic
        id: 'exampleModal',
        title: 'Modal title',
        titleLavel: 5,
        body: '',

        // Advanced
        label: null,
        lang: null,
        langs: {
          'en': {
            okBtn: {
              text: 'Save'
            },
            cancelBtn: {
              text: 'Close'
            },
            confirmOkText: 'OK',
            confirmCancelText: 'Cancel'
          },
          'zh-TW': {
            okBtn: {
              text: '儲存'
            },
            cancelBtn: {
              text: '關閉'
            },
            confirmOkText: '確定',
            confirmCancelText: '取消'
          }
        },

        // Modal selector
        modal: null,
        fade: true,
        close: true,
        backdrop: true,
        confirm: false,

        // Button
        okBtn: {
          text: '',
          color: 'primary'
        },
        cancelBtn: {
          text: '',
          color: 'secondary'
        },

        // Text
        confirmOkText: '',
        confirmCancelText: '',

        // Event
        onOpen: function onOpen() {
          return true;
        },
        onClose: function onClose() {
          return true;
        },
        onOk: function onOk() {
          return true;
        },
        onCancel: function onCancel() {
          return true;
        }

        // Locale
      };var locale = defaults.langs[defaults.lang] || defaults.langs[navigator.language || navigator.userLanguage] || defaults.langs['en'];
      defaults = recursiveAssign({}, defaults, locale);

      // Settings
      var settings = recursiveAssign({}, defaults, options);
      settings.label = settings.label || settings.id + 'Label';

      // Confirm mode
      if (settings.confirm) {
        settings.okBtn.Text = settings.confirmOkText;
        settings.cancelBtn.Text = settings.confirmCancelText;
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
        modal = $('<div class="modal" />').addClass(settings.fade ? 'fade' : '').attr({
          id: settings.id,
          tabindex: '-1',
          role: 'dialog',
          'aria-labelledby': settings.label,
          'data-backdrop': settings.backdrop
        }).appendTo('body');

        var modalDialog = $('<div class="modal-dialog" />').attr({ role: 'document' }).appendTo(modal);

        var modalContent = $('<div class="modal-content" />').appendTo(modalDialog);

        var modalHeader = $('<div class="modal-header" />').appendTo(modalContent);

        $('<h' + settings.titleLavel + ' class="modal-title" />').attr('id', settings.label).html(settings.title).css('display', 'inline').appendTo(modalHeader);

        if (settings.close) {
          $('<button class="close" type="button" data-dismiss="modal" aria-label="Close" />').append($('<span aria-hidden="true">&times;</span>')).appendTo(modalHeader);
        }

        if (settings.body) {
          $('<div class="modal-body" />').html(settings.body).appendTo(modalContent);
        }

        var modalFooter = void 0;
        var cancelBtn = void 0;
        var okBtn = void 0;

        if (settings.cancelBtn || settings.okBtn) {
          modalFooter = $('<div class="modal-footer" />').appendTo(modalContent);

          if (settings.cancelBtn) {
            cancelBtn = $('<button type="button" data-dismiss="modal" />').addClass('btn btn-' + settings.cancelBtn.color).text(settings.cancelBtn.text).appendTo(modalFooter);
          }

          if (settings.okBtn) {
            okBtn = $('<button type="button" />').addClass('btn btn-' + settings.okBtn.color).text(settings.okBtn.text).appendTo(modalFooter);
          }
        }

        // Event

        modal.on('shown.bs.modal', function () {
          settings.onOpen.call(_this);
        });

        modal.on('hidden.bs.modal', function () {
          settings.onClose.call(_this);
        });

        if (okBtn) {
          okBtn.on('click', function () {
            if (settings.onOk.call(_this) === false) {
              return;
            }
            modal.modal('hide');
          });
        }

        if (cancelBtn) {
          cancelBtn.on('click', function () {
            settings.onCancel.call(_this);
          });
        }
      }

      // Set modal to public
      this.modal = modal;

      // Add this button data-toggle
      this.attr({
        'data-toggle': 'modal',
        'data-target': '#' + modal.attr('id')
      });

      return this;
    };

    // Bootstrap plugin - Cropper image modal
    $.fn.bsModalCropper = function (options) {
      var _this2 = this;

      if (typeof Cropper === 'undefined') {
        throw 'Error: Cropper.js is not found.';
      }

      var defaults = {

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
          allowTypes: ['image/jpeg', 'image/png'],
          maxSize: Math.pow(1024, 2) * 5 // 5M
        },
        success: function success() {},
        error: function error() {},

        // Axios
        axios: null,
        axiosOriginalData: false,

        // Event
        onUpload: function onUpload() {
          return true;
        },
        onUploadError: function onUploadError() {
          return true;
        },
        onCropper: function onCropper() {
          return true;
        }

      };

      var settings = recursiveAssign({}, defaults, options);

      /**
       * @var {*} image Cropper image DOM
       */
      var image = $('<img />').attr('id', settings.imgId).css('max-width', '100%');

      /**
       * @var {*} cropper Cropper object
       */
      var cropper = void 0;

      settings.body = $('<div class="img-container" />').append(image);

      settings.onOpen = function () {
        cropper = new Cropper(image.get(0), settings.cropper);
      };

      settings.onOk = function () {
        var croppedDataURL = cropper.getCroppedCanvas().toDataURL();
        cropper.destroy();

        // Renew image size
        makeRatioImgDataURI(croppedDataURL, {
          width: settings.maxWidth,
          height: settings.maxHeight
        }, function (dataURI) {

          // Cropper image event
          settings.onCropper.call(_this2, dataURI, dataURItoBlob(dataURI));

          if (typeof settings.action === 'string') {
            // Upload image to server
            var blob = dataURItoBlob(dataURI);
            var formData = new FormData();

            // Upload file
            formData.append(settings.fileName, blob);

            // Upload data
            var dataKeys = Object.keys(settings.data);
            if (dataKeys.length) {
              dataKeys.forEach(function (key) {
                formData.append(key, settings.data[key]);
              });
            }

            // Use ajax post to server
            ajax(settings, formData);
          }
        });
      };

      settings.onCancel = function () {
        cropper.destroy();
      };

      if (settings.src) {
        image.attr('src', settings.src);

        this.bsModal(settings);
      } else {
        // Upload image to browser

        /**
         * @var {object} inputFile Input file DOM
         */
        var inputFile = this.children('input[type=file]').get(0);

        inputFile.onchange = function () {
          if (!inputFile.files.length) {
            return;
          }

          /**
           * @var {File} file Upload file - image
           */
          var file = inputFile.files[0];

          // Uploaded clear image
          inputFile.value = '';

          if (settings.onUpload.call(_this2) === false) {
            return;
          }

          if (settings.uploadConfig.allowTypes) {
            /**
             * @var {array} allowTypes
             */
            var allowTypes = settings.uploadConfig.allowTypes;
            if (!allowTypes.some(function (v) {
              return v === file.type;
            })) {
              settings.onUploadError.call(_this2, 'Upload file type is wrong');
              return;
            }
          }

          // Validate image max size
          if (settings.uploadConfig.maxSize) {
            /**
             * @var {number} maxSize
             */
            var maxSize = settings.uploadConfig.maxSize;
            if (file.size > maxSize) {
              var maxSizeText = void 0;
              if (maxSize < 1024) {
                maxSizeText = maxSize + ' B';
              } else if (maxSize >= Math.pow(1024, 1) && maxSize < Math.pow(1024, 2)) {
                maxSizeText = Math.floor(maxSize / Math.pow(1024, 1)) + ' KB';
              } else if (maxSize >= Math.pow(1024, 2) && maxSize < Math.pow(1024, 3)) {
                maxSizeText = Math.floor(maxSize / Math.pow(1024, 2)) + ' MB';
              }
              settings.onUploadError.call(_this2, 'Uploaded file cannot be larger than ' + maxSizeText);
              return;
            }
          }

          blobtoDataURL(file, function (dataURL) {
            settings.src = dataURL;
            image.attr('src', settings.src);

            // Call modal
            _this2.bsModal(settings);
            _this2.modal.modal('show');

            // Remove this button data-toggle
            _this2.removeAttr('data-toggle').removeAttr('data-target');
          });
        };
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
          }).then(function (res) {
            settings.success(settings.axiosOriginalData ? res : res.data);
          }).catch(settings.error);
        } else if (typeof $.ajax !== 'undefined') {
          // Use jquery ajax
          $.ajax(settings.action, {
            method: settings.method,
            data: formData,
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
  }

})));
