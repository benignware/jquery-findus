(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {

  var

    /**
     * Converts data-options to camel-case while respecting object-prefixes
     */
    filterPrefixedOptions = function (options, prefixes) {
      var key, i, prefix, name;
      for (key in options) {
        for (i = 0; i < prefixes.length; i++) {
          prefix = prefixes[i];
          if (key.substring(0, prefix.length) === prefix && key.length > prefix.length) {
            name = key.substring(prefix.length, prefix.length + 1).toLowerCase() + key.substring(prefix.length + 1);
            options[prefix] = options[prefix] || {};
            options[prefix][name] = options[key];
            delete options[key];
          }
        }
      }
      return options;
    },

    /***
     * Geocoder Wrapper Class
     */
    geocoder = (function() {
      var
        // http://stackoverflow.com/questions/280712/javascript-unicode-regexes
        PATTERN_NO_LETTER = /\s*([^A-Za-z\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]+)$/i,
        // http://stackoverflow.com/questions/2113908/what-regular-expression-will-match-valid-international-phone-numbers
        PATTERN_INT_PHONE = /\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*\d\W*(\d{1,10})/,
        // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
        PATTERN_EMAIL = /(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})/i;
        // https://gist.github.com/dperini/729294
        PATTERN_URL = /(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?/,

        // An item is considered as a word followed by a separation character such as colon
        PATTERN_ITEM = /[\w-_\s]+\s*[\s\:\|]\s*/i,
        // A strict item does not accept whitespace as delimiter
        PATTERN_ITEM_STRICT = /[\w-_\s]+\s*(\:|\|)\s*/i,
        // Item patterns
        PATTERN_ITEM_NO_LETTER = new RegExp(PATTERN_ITEM_STRICT.source + PATTERN_NO_LETTER.source),
        PATTERN_ITEM_INT_PHONE = new RegExp(PATTERN_ITEM.source + PATTERN_INT_PHONE.source),
        PATTERN_ITEM_EMAIL = new RegExp(PATTERN_ITEM.source + PATTERN_EMAIL.source),
        PATTERN_ITEM_URL = new RegExp(PATTERN_ITEM.source + PATTERN_URL.source);

        geocoderImpl = null,
        requestQueue = new RequestQueue(),
        responseCache = {},
        stringCache = {},
        /**
         * Decode html entities
         * http://stackoverflow.com/questions/5796718/html-entity-decode
         */
        decodeEntities = (function() {
          // this prevents any overhead from creating the object each time
          var element = document.createElement('div');
          function decodeHTMLEntities (str) {
            if(str && typeof str === 'string') {
              // strip script/html tags
              str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
              str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
              element.innerHTML = str;
              str = element.textContent;
              element.textContent = '';
            }
            return str;
          }
          return decodeHTMLEntities;
        })(),
        /**
         * Optimize geocodeable input
         */
        getGeocodeableString = function (string) {
          return stringCache[string] || (function(string) {
            // Look for an address tag
            string = string.match(/<address/) && $("<div>" + string + "</div>").find('address').html().trim() || string;
            // Decode entities
            string = decodeEntities(string);
            // Strip html tags and line breaks
            string = string.split(/<(?:.|\n)*?>|\n+/gm)
              // Perform regex on chunks
              .map(function(string) {
                string = string.replace(PATTERN_ITEM_INT_PHONE, '');
                string = string.replace(PATTERN_ITEM_NO_LETTER, '');
                string = string.replace(PATTERN_ITEM_EMAIL, '');
                string = string.replace(PATTERN_ITEM_URL, '');
                string = string.replace(PATTERN_INT_PHONE, '');
                string = string.replace(PATTERN_EMAIL, '');
                string = string.replace(PATTERN_URL, '');
                return string;
              })
              // Trim paragraphs
              .map(function(string) {
                return string.trim();
              })
              // Remove empty paragraphs
              .filter(function(string) {
                return string;
              }).join(", ");
            return string;
          })(string);
        };


      function RequestQueue() {
        this.queue = [];
        this.isRunning = false;
        this.add = function(geocoderRequest) {
          this.queue.push(geocoderRequest);
          if (!this.isRunning) {
            this.next();
          }
        };
        this.next = function() {
          var
            requestQueue = this,
            geocoderRequest = this.queue.shift();
          if (geocoderRequest) {
            this.isRunning = true;
            geocoderRequest.send(function() {
              requestQueue.next();
            });
          } else {
            this.isRunning = false;
          }
        };
      }

      function GeocoderRequest(options, callback) {
        this.options = options || {};
        this.callback = callback;
        this.tries = 0;
        this.send = function(callback) {
          var
            geocoderRequest = this,
            responseCacheId = JSON.stringify(options),
            responseCacheResult = responseCache[responseCacheId];
          // Try to get the result from cache
          if (responseCacheResult) {
            // Function callback
            callback(responseCacheResult.results, responseCacheResult.status);
            // Object callback
            geocoderRequest.callback(responseCacheResult.results, responseCacheResult.status);
            return;
          }
          // Get geocoder instance
          geocoderImpl = geocoderImpl || new google.maps.Geocoder();
          // Actually send geocode request
          geocoderRequest.tries++;
          geocoderImpl.geocode( options, function(results, status) {
            if (geocoderRequest.tries < 2 && status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
              // Retry once more after delay
              window.setTimeout(function() {
                geocoderRequest.send(callback);
              }, Geocoder.DELAY);
              return;
            }
            if (status !== google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
              // Save the result to cache
              responseCache[responseCacheId] = {
                results: results,
                status: status
              };
            }
            // Function callback
            callback(results, status);
            // Object callback
            geocoderRequest.callback(results, status);
          });
        };
      }


      function Geocoder() {

        var
          geocoder = this;

        this.geocode = function(options, callback) {

          options = options || {};
          if (typeof arguments[0] === "string" && typeof arguments[1] === "function") {
            // Geocode location from string
            options.address = arguments[0];
          } else if (!isNaN(parseFloat(arguments[0])) && !isNaN(parseFloat(arguments[1]))) {
            // Reverse geocode address from location
            options.location = {
              latitude: arguments[0],
              longitude: arguments[1]
            };
            callback = arguments[2];
          }

          // Optimize address string
          if (options.address) {
            options.address = getGeocodeableString(options.address);
          }

          if (options.location && options.location.latitude && options.location.longitude) {
            options.location = new google.maps.LatLng(options.location.latitude, options.location.longitude);
          }

          requestQueue.add(new GeocoderRequest(options, function(results, status) {
            if (results.length || !options.address) {
              // Return successful result
              callback(results, status);
              return;
            }
            // If no exact match, geocode parts of the string
            var array = options.address.split(/(?:\n|,|<br\/?>)+/);
            var matchingResults = {};
            array.forEach(function(string) {
              // Geocode chunk
              requestQueue.add(new GeocoderRequest({
                address: string
              }, function(results, status) {
                // Capture full matches
                matchingResults[string] = status === google.maps.GeocoderStatus.OK && !results[0].partial_match && results[0] || false;
                if (Object.keys(matchingResults).length === array.length) {
                  // Concatenate matching strings
                  string = array.filter(function(string) {
                    return matchingResults[string] !== false;
                  }).join(", ");
                  // Finally geocode successful matches
                  geocoder.geocode({
                    address: string
                  }, function(results, status) {
                    // Override response cache with concatenated string result
                    responseCache[JSON.stringify(options)] = {
                      results: results,
                      status: status
                    };
                    callback(results, status);
                  });
                }
              }));
            });
          }));
        };
      };


      Geocoder.DELAY = 500;

      return new Geocoder();
    })();


  /**
   * FindUs Implementation
   */
  function FindUs(elem, options) {

    if (!google || !google.maps) {
      console.error("jquery-findus needs Google Maps API");
      return;
    }

    var
      defaults = {
        address: "",
        autoShow: true,
        bindResize: true,
        content: "",
        info: {
          // InfoWindow options
        },
        map: {
          // Map options
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          draggable: false,
          zoomControl: false,
          scrollwheel: false,
          disableDoubleClickZoom: true
        },
        marker: {
          // Marker options
          //animation: google.maps.Animation.DROP
        },
        minWidth: 0,
        minHeight: 460
      },
      opts = {},
      instance = this,
      $elem = $(elem),
      content = $elem.html().replace(/^\s+|\s+$/g, ''),
      center,
      centerTimeoutId,
      map,
      marker,
      infoWindow,
      infoWindowTimeoutId,
      geocodeResult = null;

    function resizeHandler(e) {
      instance.resize();
    }

    function centerChanged(event) {
      center = map.getCenter();
    }

    function markerClickHandler(event) {
      if ((opts.content || opts.address) && infoWindow) {
        var infoWindowOpened = (infoWindow.getMap());
        if (infoWindowOpened) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }
      }
    }

    function mapClickHandler() {
      if (infoWindow) {
        infoWindow.close();
      }
    }

    // Update marker
    function updateMarker() {

      var
        markerOptions = $.extend(true, {}, opts.marker, {
          map: map,
          position: center
        }),
        markerPosition = marker && marker.getPosition() || null;

      if (marker) {
        // Update marker
        marker.setOptions(markerOptions);
      } else {
        // Init marker
        marker = new google.maps.Marker(markerOptions);
        // Init marker listeners
        google.maps.event.addListener(marker, 'click', markerClickHandler);
      }

      // Trigger update on infoWindow
      updateInfoWindow();

      // Make sure that infoWindow is defined
      if (!infoWindow) {
        return;
      }

      // Open infowindow
      clearTimeout(infoWindowTimeoutId);
      if (opts.info && opts.autoShow && !infoWindow.getMap() && (!markerPosition || markerPosition.lat() !== center.lat() && markerPosition.lng() !== center.lng())) {
        infoWindowTimeoutId = setTimeout(function() {
          infoWindow.open(map, marker);
          // FIXME: Google Maps icon needs max-width
          $(elem).find('img[src*="gstatic.com/"], img[src*="googleapis.com/"]').css('max-width', 'none');
          marker.setAnimation(null);
        }, marker.getAnimation() ? 700 : 350);
      }
    }

    // Update infowindow
    function updateInfoWindow() {
      var infoOpts;
      if (opts.info) {
        infoOpts = $.extend(true, {}, opts.info, {
          content: opts.content || (opts.address || geocodeResult && geocodeResult.formatted_address).split(/,|\n|<\s*br\s*\/?\s*>/).join("<br/>")
        });
        if (infoWindow) {
          // Update InfoWindow
          infoWindow.setOptions(infoOpts);
        } else {
          // Init InfoWindow
          infoWindow = new google.maps.InfoWindow(infoOpts);
        }
      } else {
        if (infoWindow) {
          // Close InfoWindow
          infowindow.close();
        }
      }
    }

    // Update map
    function updateMap() {
      if (!center) {
        return;
      }
      // Get map options
      var mapOptions = $.extend(true, {}, opts.map || defaults.map, {
        center: center
      });
      if (map) {
        // Update map
        map.setOptions(mapOptions);
      } else {
        // Apply container size before map is initialized
        resizeContainer();
        // Init map
        map = new google.maps.Map(elem, mapOptions);
        // Init map listeners
        google.maps.event.addListener(map, "click", mapClickHandler);
      }
      // Update marker after tiles have been loaded
      google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
        updateMarker();
      });

    }

    /**
     * Updates the component
     * @param {Object} options
     */
    this.update = function(options) {

      $.extend(opts, options);

      // Make sure that api has been loaded
      if (!google.maps.Geocoder || !google.maps.LatLng) {
        return;
      }

      if (opts.latitude && opts.longitude) {
        // By coordinates
        center = new google.maps.LatLng(opts.latitude, opts.longitude);
        if (!opts.content && !opts.address) {
          // Reverse geocode location
          geocoder.geocode( {
            location: {
              latitude: opts.latitude,
              longitude: opts.longitude
            }
          }, function(results, status) {
            geocodeResult = results[0];
            if (status === google.maps.GeocoderStatus.OK) {
              center = geocodeResult.geometry.location || center;
              updateMap();
            } else {
              console.warn("Geocoder returned with error: ", status);
            }
          });
        } else {
          // No Geocoding required, immediately update map
          updateMap();
        }

      } else if (opts.content || opts.address) {
        // Geocode by address or content
        geocoder.geocode({
          address: opts.address || opts.content
        }, function(results, status) {
          geocodeResult = results[0];
          if (status === google.maps.GeocoderStatus.OK) {
            center = geocodeResult.geometry.location;
            updateMap();
          } else {
            console.warn("Geocoder returned with error: ", status);
          }
        });
      }

      // Resize
      this.resize();
    };

    // Deprecated, use update(options) instead
    this.setOptions = function(options) {
      this.update(options);
    };

    this.getOptions = function() {
      return $.extend({}, opts);
    };

    // Resize map container
    function resizeContainer() {
      // Set size
      var minHeight = typeof opts.minHeight === 'function' ? opts.minHeight.call(this, options) : opts.minHeight;
      var maxHeight = typeof opts.maxHeight === 'function' ? opts.maxHeight.call(this, options) : opts.maxHeight;
      $(elem).css('min-height', opts.minHeight || "");
      $(elem).css('max-height', opts.maxHeight || "");
      // Set text color
      $(elem).css('color', "black");
    }

    /**
     * Update geometry
     */
    this.resize = function() {

      if (opts.latitude && opts.longitude || opts.address || opts.content) {
        // Only resize container if options have been specified
        resizeContainer();
      }

      if (map) {
        // Adjust center
        google.maps.event.clearListeners(map, 'center_changed');
        window.clearTimeout(centerTimeoutId);
        centerTimeoutId = window.setTimeout(function() {
          map.setCenter(center);
          google.maps.event.addListener(map, 'center_changed', centerChanged);
        }, 0);

        // Resize map
        google.maps.event.trigger(map, 'resize');
      }

    };

   // Clear elem
   $elem.html('');

   // Get options including data-attribtues
   var
     opts = $.extend(true, {}, defaults, options, {
       content: content,
     }, filterPrefixedOptions($elem.data(), ["map", "marker", "info"]));

    // Initial update
   this.update(opts);

   // Initial resize
   this.resize();

    // Init resize handler
    $(window).off('resize', resizeHandler);
    if (opts.bindResize) {
      $(window).on('resize', resizeHandler);
    }

  }

  // Add Plugin to registry
  $.fn.findus = function() {
    var
      args = [].slice.call(arguments),
      result = this.each(function() {
        return (function(instance) {
          var
            result;
          // Update or init plugin
          $(this).data('findus', instance = instance ? typeof args[0] === 'object' && instance.setOptions(args[0]) && instance || instance : new FindUs(this, args[0]));
          // Call method
          result = typeof args[0] === 'string' && typeof instance[args[0]] === 'function' ? instance[args[0]].apply(instance, args.slice(1)) : result;
          // Return undefined or chaining element
          return typeof result !== 'undefined' ? result : this;
        }).call(this, $(this).data('findus'));
      });
    return result;
  };

  // Bootstrap compatibility
  $(document).on('show.bs.tab show.bs.modal show.bs.collapse', function(e) {
    var
      $target = $(e.target),
      href;
    $target = $($target.attr('data-target') || (href = $target.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') || e.target);
    $target
      .css('display', 'block')
      .find('*').map(function() {
        return $(this).data('findus') || null;
      }).each(function() {
        this.resize();
      });
    $target.css('display', '');
  });

}));
