(function($) {
  
  var 
    pluginName = "findus",
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
    
    var defaults = {
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
    };
    
    
    var 
      instance = this, 
      $elem = $(elem),
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
      if (options.content || options.address) {
        var infoWindowOpened = (infoWindow.getMap());
        if (infoWindowOpened) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }
      }
    }
    
    function mapClickHandler() {
      infoWindow.close();
    }
    
    function updateMarker() {
      var 
        markerOptions = $.extend(true, {}, options.marker, {
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
      clearTimeout(infoWindowTimeoutId);
      if (options.autoShow && !infoWindow.getMap() && (!markerPosition || markerPosition.lat() !== center.lat() && markerPosition.lng() !== center.lng())) {
        infoWindowTimeoutId = setTimeout(function() {
          infoWindow.open(map, marker);
          // Fix icon
          $(elem).find('img[src*="gstatic.com/"], img[src*="googleapis.com/"]').css('max-width', 'none');
          marker.setAnimation(null);
        }, marker.getAnimation() ? 700 : 350);
      }
    }
    
    function updateInfoWindow() {
      var infoOpts = $.extend(true, {}, options.info, {
        content: options.content || options.address && $.trim(options.address).split(",").join("<br/>") || (function(lat, lng) {
          if (reverseGeocoded[lat + "," + lng]) {
            return reverseGeocoded[lat + "," + lng][0].formatted_address.split(",").join("<br/>");
          }
        })(options.latitude, options.longitude)
      });
      
      if (infoWindow) {
        // Update infowindow
        infoWindow.setOptions(infoOpts);
      } else {
        // Init infowindow
        infoWindow = new google.maps.InfoWindow(infoOpts);
      }
    }
    
    function updateMap() {
      if (!center) {
        return;
      }
      var mapOptions = $.extend(true, {}, options.map, {
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
      google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
        // Update marker when tiles have been loaded
        updateMarker();
        
      });
      
      
      
    }
    
    this.refresh = function() {
      
      if (!google.maps.Geocoder || !google.maps.LatLng) {
        return;
      }
      
      geocoder = geocoder || new google.maps.Geocoder();
      
      if (options.latitude && options.longitude) {
        // By coordinates
        center = new google.maps.LatLng(options.latitude, options.longitude);
        if (!options.content || !options.address) {
          // Reverse geocode
          geocoder.geocode( { 'latLng': center }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              reverseGeocoded[options.latitude + "," + options.longitude] = results;
              updateMap();
            } else {
              console.warn("Geocoder returned with error: ", status);
            }
          });
        } else {
          updateMap();
        }
        
      } else if (options.content || options.address) {
        // By address or content
        var string = $.map((options.address || options.content && (function(content) {
          return content.match(/<address/) && $("<div>" + content + "</div>").find('address').html() || content;
        })(options.content)).split(/<(?:.|\n)*?>/gm), function(string) {
          var value = $.trim(string);
          return value || null;
        }).join(",");
        
        // Geocode
        if (geocoded[string]) {
          // Get location from previously geocoded results
          center = geocoded[string][0].geometry.location;
          updateMap();
        } else {
          // Geocode
          geocoder.geocode( { 'address': string }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
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
    
    this.setOptions = function(opts) {
      options = $.extend({}, options, opts);
      this.refresh();
    };
    
    this.getOptions = function() {
      return $.extend({}, options);
    };
    
    function resizeContainer() {
      // Set size
      var minHeight = typeof options.minHeight === 'function' ? options.minHeight.call(this, options) : options.minHeight;
      var maxHeight = typeof options.maxHeight === 'function' ? options.maxHeight.call(this, options) : options.maxHeight;
      $(elem).css('min-height', options.minHeight || "");
      $(elem).css('max-height', options.maxHeight || "");
    }
    
    this.resize = function() {
      
      var options = this.getOptions();
      
      if (options.latitude && options.longitude || options.address || options.content) {
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
    
    // Init options
    
    options = $.extend(true, {}, defaults, options, {
      content: $elem.html().replace(/^\s+|\s+$/g, '') 
    }, filterPrefixedOptions($elem.data(), ["map", "marker", "info"]));
    
    // Clear elem
    $elem.html('');
     
    // Init resize handler
    $(window).off('resize', resizeHandler);
    if (options.bindResize) {
      $(window).on('resize', resizeHandler);
    }
    
    // Initial refresh
    this.refresh();
  }
  
  jQuery.fn[pluginName] = function(options) {
    return this.each(function() {
      var instance = $(this).data(pluginName);
      if (!instance) {
        instance = $(this).data(pluginName, new FindUs(this, options));
      } else {
        instance.setOptions(options);
      }
      return $(this);
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
        return $(this).data(pluginName) || null; 
      }).each(function() {
        this.resize();
      });
    $target.css('display', '');
  });
  
})(jQuery);