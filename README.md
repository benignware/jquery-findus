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
    <th>Name</th><th>Description</th><th>Default</th>
  </tr>
  <tr>
    <td>address</td><td>A geocodeable address string</td><td>empty</td>
  </tr>
  <tr>
    <td>autoShow</td><td>Specififes whether to auto show info-window</td><td>true</td>
  </tr>
  <tr>
    <td>bindResize</td><td>Specififes whether to bind window resize</td><td>true</td>
  </tr>
  <tr>
    <td>content</td><td>HTML content to be shown in info-window. Can contain a geocodeable string wrapped in an address-tag.</td><td>empty</td>
  </tr>
  <tr>
    <td>info</td><td>Options passed to the info-window instance</td><td>object</td>
  </tr>
  <tr>
    <td>map</td><td>Options passed to the map instance</td><td>object</td>
  </tr>
  <tr>
    <td>marker</td><td>Options passed to the marker instance</td><td>object</td>
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