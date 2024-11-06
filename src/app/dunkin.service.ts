// dunkin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DunkinService {
  // private apiUrl = 'http://localhost:3000/api';
  private apiUrl = 'https://dunkin-scout-api-3f40821b6dbb.herokuapp.com/api';

  constructor(private http: HttpClient) {}

  getMenuItems(lat: number, long: number, dist: number): Observable<any> {
    console.log(`${this.apiUrl}/menu-items?lat=${lat}&long=${long}&dist=${dist}`);
    return this.http.get(`${this.apiUrl}/menu-items?lat=${lat}&long=${long}&dist=${dist}`);
  }

  getCheapestLocation(lat: number, long: number, dist: number, item: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cheapest-location?lat=${lat}&long=${long}&dist=${dist}&item=${item}`);
  }
}
