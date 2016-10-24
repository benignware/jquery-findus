(function($) {
  
  var 
    geocoded = {},
    reverseGeocoded = {},
    
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
    };
  
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
        minHeight: 440
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
      geocoder;
      
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
    
    function updateMarker() {
      
      return;
      
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
      
      updateInfoWindow();
      
      // Open Window
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
    
    function updateInfoWindow() {
      return;
      var infoOpts;
      if (opts.info) {
        infoOpts = $.extend(true, {}, opts.info, {
          content: opts.content || opts.address && $.trim(opts.address).split(",").join("<br/>") || (function(lat, lng) {
            if (reverseGeocoded[lat + "," + lng]) {
              return reverseGeocoded[lat + "," + lng][0].formatted_address.split(",").join("<br/>");
            }
          })(opts.latitude, opts.longitude)
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
    
    function updateMap() {
      if (!center) {
        return;
      }
      var mapOptions = $.extend(true, {}, opts.map || defaults.map, {
        center: center
      });
      if (map) {
        console.log("update map: ", mapOptions);
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
      google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
        // Update marker when tiles have been loaded
        updateMarker();
        
      });
      
    }
    
    /**
     * Updates the component
     * @param {Object} options
     */
    this.update = function(options) {
      
      $.extend(opts, options);
      
      if (!google.maps.Geocoder || !google.maps.LatLng) {
        return;
      }
      
      geocoder = geocoder || new google.maps.Geocoder();
      
      if (opts.latitude && opts.longitude) {
        // By coordinates
        center = new google.maps.LatLng(opts.latitude, opts.longitude);
        if (!opts.content || !opts.address) {
          // Reverse geocode
          geocoder.geocode( { 'latLng': center }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              reverseGeocoded[opts.latitude + "," + opts.longitude] = results;
              updateMap();
            } else {
              console.warn("Geocoder returned with error: ", status);
            }
          });
        } else {
          updateMap();
        }
        
      } else if (opts.content || opts.address) {
        // By address or content
        var
          string = $.map((opts.address || opts.content && (function(content) {
            return content.match(/<address/) && $("<div>" + content + "</div>").find('address').html() || content;
          })(opts.content)).split(/<(?:.|\n)*?>/gm), function(string) {
            var value = $.trim(string);
            return value || null;
          }).join(",");
        
        // Strip phone numbers from geocodable string
        string = string.replace(/\+\s*\d+[-\d\s\(\)]+/gi, '');
        string = string.replace(/phone/gi, '');
        
        
        // Geocode
        if (geocoded[string]) {
          // Get location from cached geocoded results
          center = geocoded[string][0].geometry.location;
          updateMap();
        } else {
          // Geocode
          geocoder.geocode( { 'address': string }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              console.log("GEO CODED: ", results);
              geocoded[string] = results;
              center = geocoded[string][0].geometry.location;
              updateMap();
            } else {
              console.warn("Geocoder returned with error '" + status + "' for string '" + string + "'");
            }
          });
        }
      }
      
      // Resize
      this.resize();
    };
    
    // Deprecated
    this.setOptions = function(options) {
      this.update(options);
    };
    
    this.getOptions = function() {
      return $.extend({}, opts);
    };
    
    function resizeContainer() {
      // Set size
      var minHeight = typeof opts.minHeight === 'function' ? opts.minHeight.call(this, options) : opts.minHeight;
      var maxHeight = typeof opts.maxHeight === 'function' ? opts.maxHeight.call(this, options) : opts.maxHeight;
      $(elem).css('min-height', opts.minHeight || "");
      $(elem).css('max-height', opts.maxHeight || "");
      // Set text color
      $(elem).css('color', "black");
    }
    
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
   
   var
     opts = $.extend(true, {}, defaults, options, {
       content: content,
     }, filterPrefixedOptions($elem.data(), ["map", "marker", "info"]))
   
    // Initial update
   this.update(opts);
   
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
      args = [].slice.call(arguments);
    return this.each(function() {
      return (function(instance) {
        var
          result;
        // Update or init plugin
        $(this).data('findus', instance = instance ? typeof args[0] === 'object' && instance.update(args[0]) && instance || instance : new FindUs(this, args[0]));
        // Call method
        result = typeof args[0] === 'string' && typeof instance[args[0]] === 'function' ? instance[args[0]].apply(instance, args.slice(1)) : result;
        // Return undefined or chaining element
        return typeof result !== 'undefined' ? result : this;
      }).call(this, $(this).data('findus'));
    });
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
  
})(jQuery);