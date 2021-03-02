/*!
 * jquery.bsmodal.js v1.2.0
 * https://github.com/ycs77/jquery-plugin-bsModal
 *
 * Copyright 2018-2021 Lucas Yang
 * Released under the MIT license
 *
 * Date: 2021-03-02T09:39:15.177Z
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define(['jquery'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.$));
}(this, (function ($) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var $__default = /*#__PURE__*/_interopDefaultLegacy($);

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

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
    if (_typeof(object) === 'object') {
      for (var _len = arguments.length, toassign = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
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
  function makeRatioImgDataURI(dataURI, imgConfig, callback) {
    // Check width and height is exists
    if (imgConfig.width === null && imgConfig.height === null) {
      callback(dataURI);
      return;
    }

    var aspectRatio = function aspectRatio(imgW, imgH, maxW, maxH) {
      return Math.min(maxW / imgW, maxH / imgH);
    };

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = dataURI;

    img.onload = function () {
      var w = img.naturalWidth;
      var h = img.naturalHeight;
      var sizer = aspectRatio(w, h, imgConfig.width, imgConfig.height);
      canvas.width = w * sizer;
      canvas.height = h * sizer;
      ctx.drawImage(img, 0, 0, w, h, 0, 0, w * sizer, h * sizer);
      callback(canvas.toDataURL());
    };
  }
  /**
   * DatURI to Blob
   * @param {string} dataURI
   */

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

    return new Blob([ia], {
      type: mimeString
    });
  }
  /**
   * Blob to DataURL
   * @param {Blob|File} blob 
   * @param {function} callback 
   */

  function blobtoDataURL(blob, callback) {
    var fr = new FileReader();

    fr.onload = function (e) {
      callback(e.target.result);
    };

    fr.readAsDataURL(blob);
  }

  if ($__default['default'].fn) {
    // Bootstrap plugin - Modal
    $__default['default'].fn.bsModal = function (options) {
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
      }; // Locale

      var locale = defaults.langs[defaults.lang] || defaults.langs[navigator.language || navigator.userLanguage] || defaults.langs['en'];
      defaults = recursiveAssign({}, defaults, locale); // Settings

      var settings = recursiveAssign({}, defaults, options);
      settings.label = settings.label || "".concat(settings.id, "Label");

      if (typeof options.close === 'undefined') {
        settings.close = false;
      }

      if (typeof options.backdrop === 'undefined') {
        settings.backdrop = 'static';
      }

      var modal = null; // Existence modal

      if (typeof settings.modal === 'string') {
        modal = $__default['default'](settings.modal);
      } // Create modal


      if (modal === null) {
        modal = $__default['default']('<div class="modal" />').addClass(settings.fade ? 'fade' : '').attr({
          id: settings.id,
          tabindex: '-1',
          role: 'dialog',
          'aria-labelledby': settings.label,
          'data-backdrop': settings.backdrop
        }).appendTo('body');
        var modalDialog = $__default['default']('<div class="modal-dialog" />').attr({
          role: 'document'
        }).appendTo(modal);
        var modalContent = $__default['default']('<div class="modal-content" />').appendTo(modalDialog);
        var modalHeader = $__default['default']('<div class="modal-header" />').appendTo(modalContent);
        $__default['default']("<h".concat(settings.titleLavel, " class=\"modal-title\" />")).attr('id', settings.label).html(settings.title).css('display', 'inline').appendTo(modalHeader);

        if (settings.close) {
          $__default['default']('<button class="close" type="button" data-dismiss="modal" aria-label="Close" />').append($__default['default']('<span aria-hidden="true">&times;</span>')).appendTo(modalHeader);
        }

        if (settings.body) {
          $__default['default']('<div class="modal-body" />').html(settings.body).appendTo(modalContent);
        }

        var modalFooter;
        var cancelBtn;
        var okBtn;

        if (settings.cancelBtn || settings.okBtn) {
          modalFooter = $__default['default']('<div class="modal-footer" />').appendTo(modalContent);

          if (settings.cancelBtn) {
            cancelBtn = $__default['default']('<button type="button" data-dismiss="modal" />').addClass("btn btn-".concat(settings.cancelBtn.color)).text(!settings.confirm ? settings.cancelBtn.text : settings.confirmCancelText).appendTo(modalFooter);
          }

          if (settings.okBtn) {
            okBtn = $__default['default']('<button type="button" />').addClass("btn btn-".concat(settings.okBtn.color)).text(!settings.confirm ? settings.okBtn.text : settings.confirmOkText).appendTo(modalFooter);
          }
        } // Event


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
      } // Set modal to public


      this.modal = modal; // Add this button data-toggle

      this.attr({
        'data-toggle': 'modal',
        'data-target': "#".concat(modal.attr('id'))
      });
      return this;
    }; // Bootstrap plugin - Cropper image modal


    $__default['default'].fn.bsModalCropper = function (options) {
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
        imageMimeType: 'auto',
        // Upload
        uploadFile: null,
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

      var image = $__default['default']('<img />').attr('id', settings.imgId).css('max-width', '100%');
      /**
       * @var {*} cropper Cropper object
       */

      var cropper;
      settings.body = $__default['default']('<div class="img-container" />').append(image);
      var onOpen = settings.onOpen;

      settings.onOpen = function () {
        if (settings.imageMimeType === 'auto') {
          try {
            // check is is base64 or not (throw exception)
            atob(settings.src.split(',')[1]); // is base64

            settings.imageMimeType = settings.src.split(':')[1].split(';')[0];
          } catch (error) {
            if (error instanceof DOMException) {
              // is image
              var mimetypeMap = {
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                gif: 'image/gif',
                svg: 'image/svg+xml',
                webp: 'image/webp'
              };
              var m = settings.src.match(/\.(\w+)$/);
              settings.imageMimeType = mimetypeMap[m && m[1]];
            }
          } // If guess is not working, return the default mime-type


          if (settings.imageMimeType === 'auto') {
            settings.imageMimeType = 'image/jpeg';
          }
        }

        cropper = new Cropper(image.get(0), settings.cropper);
        if (onOpen) onOpen();
      };

      var onOk = settings.onOk;

      settings.onOk = function () {
        if (onOk) onOk();
        var croppedDataURL = cropper.getCroppedCanvas().toDataURL(settings.imageMimeType);
        cropper.destroy(); // Renew image size

        makeRatioImgDataURI(croppedDataURL, {
          width: settings.maxWidth,
          height: settings.maxHeight
        }, function (dataURI) {
          var blob = dataURItoBlob(dataURI); // Cropper image event

          settings.onCropper.call(_this2, dataURI, blob, settings.uploadFile);

          if (typeof settings.action === 'string') {
            // Upload image to server
            var formData = new FormData(); // Upload file

            formData.append(settings.fileName, blob); // Upload data

            Object.keys(settings.data).forEach(function (key) {
              formData.append(key, settings.data[key]);
            }); // Use ajax post to server

            ajax(settings, formData);
          }
        });
      };

      var onCancel = settings.onCancel;

      settings.onCancel = function () {
        cropper.destroy();
        if (onCancel) onCancel();
      };

      if (settings.src) {
        image.attr('src', settings.src); // Clear uploaded file

        settings.uploadFile = null;
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


          var file = inputFile.files[0]; // Uploaded file

          settings.uploadFile = file; // Uploaded clear image

          inputFile.value = '';

          if (settings.onUpload.call(_this2, settings.uploadFile) === false) {
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
          } // Validate image max size


          if (settings.uploadConfig.maxSize) {
            /**
             * @var {number} maxSize
             */
            var maxSize = settings.uploadConfig.maxSize;

            if (file.size > maxSize) {
              var i = Math.floor(Math.log(maxSize) / Math.log(1024));
              var maxSizeText = (maxSize / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
              settings.onUploadError.call(_this2, "Uploaded file cannot be larger than ".concat(maxSizeText));
              return;
            }
          }

          blobtoDataURL(file, function (dataURL) {
            settings.src = dataURL;
            image.attr('src', settings.src); // Call modal

            _this2.bsModal(settings);

            _this2.modal.modal('show'); // Remove this button data-toggle


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
          })["catch"](settings.error);
        } else if (typeof $__default['default'].ajax !== 'undefined') {
          // Use jquery ajax
          $__default['default'].ajax(settings.action, {
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
