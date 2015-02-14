jquery-findus
================

> Create contact maps easily.

This plugins let's you quickly build a customizable map without hassling with google maps api. 

Basic Usage
-----------

Initialize findus:

```js
$(function() {
  $('.findus').findus();
});
```

Provide some content containing a geocodeable address:
```html
<div class="findus">
  <h5>Find us here</h5>
  <address>
  8411 Market Street<br/>
  San Francisco<br/>
  CA 94103<br/>
  </address>
</div>
```



Options
-------
<table>
  <tr>
    <th>Name</th><th>Description</th>
  </tr>
  <tr>
    <td>address</td><td>A geocodeable address string</td>
  </tr>
  <tr>
    <td>autoShow</td><td>Specififies whether to auto show info-window. Defaults to `true`</td>
  <tr>
    <td>bindResize</td><td>Specififies whether to bind window resize. Defaults to true.</td>
  </tr>
  <tr>
    <td>content</td><td>HTML content to be shown in info-window. Can contain a geocodeable string wrapped in an address-tag.</td>
  </tr>
  <tr>
    <td>latitude</td><td>Location coordinate latitude</td>
  </tr>
  <tr>
    <td>longitude</td><td>Location coordinate longitude</td>
  </tr>
  <tr>
    <td>info</td><td>Options passed to the info-window instance</td>
  </tr>
  <tr>
    <td>map</td><td>Options passed to the map instance. Defaults to <br/>
    `{<br/>
        &nbsp;&nbsp;zoom: 15,<br/>
        &nbsp;&nbsp;mapTypeId: google.maps.MapTypeId.ROADMAP,<br/>
        &nbsp;&nbsp;disableDefaultUI: true,<br/>
        &nbsp;&nbsp;draggable: false, <br/>
        &nbsp;&nbsp;zoomControl: false, <br/>
        &nbsp;&nbsp;scrollwheel: false, <br/>
        &nbsp;&nbsp;disableDoubleClickZoom: true<br/>
      }`</td>
  </tr>
  <tr>
    <td>marker</td><td>Options passed to the marker instance</td>
  </tr>
</table>

Methods
-------

<table>
  <tr>
    <th>Name</th><th>Description</th><th>Return</th>
  </tr>
  <tr>
    <td>getOptions()</td><td>Gets options</td><td>object</td>
  </tr>
  <tr>
    <td>resize</td><td>Resizes map</td><td>void</td>
  </tr>
  <tr>
    <td>refresh</td><td>Refreshes the component</td><td>void</td>
  </tr>
  <tr>
    <td>setOptions(options)</td><td>Sets options</td><td>void</td>
  </tr>
</table>