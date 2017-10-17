import {Component, EventEmitter, OnInit, OnChanges, Output, Input, SimpleChanges} from '@angular/core';
import {GlobalService} from '../global.service';
import {ListingService} from '../listing/listing.service';
import {Listing} from '../listing/listing';

import * as L from 'leaflet';


declare const InfoBox: any;
declare const MarkerClusterer: any;
declare const RichMarker: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [ListingService]
})

export class MapComponent implements OnInit, OnChanges {
  @Input() listings: Listing[] = [];
  @Input() listing_id: number = null;
  @Output() onListingChange = new EventEmitter<number>();

  markers: any[] = [];
  map: any;
  bound: any;
  zoom: number = 13;

  constructor() {
  }

  ngOnInit() {
    //Workaround
    let DefaultIcon = L.icon({
      iconUrl: 'assets/img/leaflet/marker-icon.png',
      shadowUrl: 'assets/img/leaflet/marker-shadow.png'
    });
  
    L.Marker.prototype.options.icon = DefaultIcon;

    this.map = L.map("map").setView([47.200, -122.303], 10);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('listing_id' in changes) {
      this.listings.forEach(listing => {
        if (listing['id'] === this.listing_id) {
          this.map.panTo(new L.LatLng(listing['latitude'], listing['longitude']));
        }
      });
    }

    if ('listings' in changes) {
      const component = this;
      component.bound = new L.LatLngBounds();

      this.markers.forEach(marker => {
        marker.setMap(null);
      });

      this.listings.forEach(listing => {
        if (listing['latitude'] && listing['longitude']) {
          //const markerCenter = new L.LatLng(listing['latitude'], listing['longitude']);
          const markerVerified = listing['is_verified'] ? '<div class="marker-verified"><i class="fa fa-check"></i></div>' : '';

          const markerPrice = listing['price'] ? '<div class="marker-price">' + listing['name'] + '</div>' : '';

          const markerContent =
            '<div class="marker">' +
            '<div class="marker-inner">' +
            '<span class="marker-image" style="background-image: url(' + listing['thumbnail'] + ');"></span>' +
            '</div>' +
            markerVerified +
            markerPrice +
            '</div>';

          var myIcon = L.divIcon({html: markerContent});
          let marker = L.marker([listing['latitude'], listing['longitude']], {icon: myIcon})
          //marker.bindPopup(markerContent);
          marker.addTo(this.map);

          marker.on('click', () => {
            component.map.panTo(new L.LatLng(listing['latitude'], listing['longitude']));
            component.changeListing(listing['id']);
          });
          
          this.markers.push(marker);
          component.bound.extend(new L.LatLng(listing['latitude'], listing['longitude']));
        }
      });

      if ('map' in this) {
        this.map.fitBounds(component.bound);
      }

      /*new MarkerClusterer(this.map, this.markers, {styles: [
        {
          url: 'assets/img/cluster.png',
          height: 36,
          width: 36
        }
      ]});*/
    }
  }


  changeListing(listing_id: number) {
    console.log(listing_id);
    this.onListingChange.emit(listing_id);
  }

  actionZoomIn() {
    this.map.setZoom(this.map.getZoom() + 1);
  }

  actionZoomOut() {
    this.map.setZoom(this.map.getZoom() - 1);
  }

  /*actionType(type: string) {
    if (type === 'HYBRID') {
      this.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    } else if (type === 'SATELLITE') {
      this.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
    } else if (type === 'TERRAIN') {
      this.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
    } else if (type === 'ROADMAP') {
      this.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    }
  }*/
}
