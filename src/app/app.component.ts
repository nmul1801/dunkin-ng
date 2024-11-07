import { ViewChild, Component, OnInit, ElementRef } from '@angular/core';
import { DunkinService } from './dunkin.service';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MenuItem, Store, StoreMenuDict } from './models.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],  
})

export class AppComponent implements OnInit {
  @ViewChild('cheapestDisplay', { static: false }) cheapestDisplay!: ElementRef;

  lat: number = 0;
  long: number = 0;
  dist: number = 1.5;
  menuItems: string[] = [];
  storeList: any[] = [];
  cheapestPrice: number = Infinity;
  selectedItem: string | null = null;
  errorMessage: string | null = null;
  cheapestLocation: Store | null = null;
  fetchingLocation: boolean = false;
  blockLocation: boolean = false;
  fetchingMenu: boolean = false;
  processingMenu: boolean = false;
  findingCheapest: boolean = false;
  imagePath: string = 'assets/leaflet/';
  map!: L.Map;
  circle: L.Circle | null = null;
  categoryMenuItems: { [category: string]: MenuItem[] } = {};
  googleMapsLink: string = "#";

  constructor(private dunkinService: DunkinService) {}

  ngOnInit() {

    this.getCurrentLocation();
  }

  generateCircle() {
    if (this.circle) {
      this.map.removeLayer(this.circle);
    }

    if (this.map) {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      // Set default options for Leaflet icons
      L.Icon.Default.mergeOptions({
        iconUrl: 'assets/leaflet/marker-icon.png',
        iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
        shadowUrl: 'assets/leaflet/marker-shadow.png'
      });

      // Add a radius circle based on user input
      this.circle = L.circle([this.lat, this.long], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: this.dist * 1609.34 // conversion from miles to meters
      }).addTo(this.map);
    }
  }

  getCurrentLocation() {
    this.fetchingLocation = true;
    console.log('about to fetch location');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude;
          this.long = position.coords.longitude;
          this.fetchingLocation = false;
          
          // Initialize the map after getting the location
          this.map = L.map('map', {
            center: [this.lat, this.long],
            zoom: 13
          });

          // Generate the map once it's initialized
          this.generateCircle();
        },
        (error) => {
          this.errorMessage = 'Unable to retrieve location. Please enter manually.';
          this.fetchingLocation = false;
          this.blockLocation = true;
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      this.errorMessage = 'Geolocation is not supported by this browser.';
      this.blockLocation = true;
      
      this.fetchingLocation = false;
    }
  }

  fetchMenuItems() {
    if (this.lat !== null && this.long !== null) {
      this.fetchingMenu = true;
      this.dunkinService.getMenuItems(this.lat, this.long, this.dist).subscribe({
        next: (data: StoreMenuDict[]) => {
          console.log('processing menu');
          this.fetchingMenu = false;
          this.processingMenu = true;
          this.storeList = data;
          this.storeList.forEach(storeDict => {
            if (Array.isArray(storeDict.menu)) {
              console.log(storeDict)
              storeDict['menu'].forEach((menuItem: MenuItem) => {
                if (!this.menuItems.includes(menuItem.name)) {
                  console.log('pushing ' + menuItem.name);
                  this.menuItems.push(menuItem.name);
                  const category = menuItem.category || 'Other'; // Use 'Other' for items with no category
                  if (!this.categoryMenuItems[category]) {
                    this.categoryMenuItems[category] = [];
                  }
                  console.log(menuItem);
                  this.categoryMenuItems[category].push(menuItem);
                }
              })
            }
          })
          this.processingMenu = false;
          console.log(this.categoryMenuItems);
        }, error: (error) => {
          this.errorMessage = 'Failed to load menu items';
          this.fetchingMenu = false;
        },
      });
    } else {
      this.errorMessage = 'Please provide valid latitude and longitude.';
    }
  }

  generateGoogleMapsLink(address: string) {
    const encodedAddress = encodeURIComponent(address);
    this.googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  }

  
  onItemSelect() {
    if (this.selectedItem) {
        this.findingCheapest = true;
        this.cheapestPrice = Infinity;

        this.storeList.forEach((store: StoreMenuDict) => {
          if (Array.isArray(store.menu) && store.menu != null) {
              const foundItem = store.menu.find((item: MenuItem) => item.name === this.selectedItem);
              if (foundItem && foundItem.price < this.cheapestPrice) {
                  this.cheapestLocation = store.store;
                  this.cheapestPrice = foundItem.price;
                  this.generateGoogleMapsLink(this.cheapestLocation.address);
              }
          }
        });
        this.findingCheapest = false;
        this.scrollToCheapestDisplay();
    }
  }
  categoryVisibility: { [key: string]: boolean } = {};

  toggleCategory(category: string) {
    this.categoryVisibility[category] = !this.categoryVisibility[category];
  }

  isCategoryVisible(category: string) {
    return this.categoryVisibility[category];
  }

  getCategoryKeys(): string[] {
    return Object.keys(this.categoryMenuItems);
  }
  
  selectItem(item: MenuItem) {
    console.log('selected item');
    this.selectedItem = item.name;
    this.onItemSelect();
  }

  scrollToCheapestDisplay() {
    if (this.cheapestDisplay) {
      const elementPosition = this.cheapestDisplay.nativeElement.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    }
  }
}