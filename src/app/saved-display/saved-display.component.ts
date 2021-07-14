import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CityInfo } from '../interfaces/cityInfo';

@Component({
  selector: 'app-saved-display',
  templateUrl: './saved-display.component.html',
  styleUrls: ['./saved-display.component.scss']
})
export class SavedDisplayComponent implements OnInit {
	@Output() removeLocation: EventEmitter<CityInfo> = new EventEmitter();
	@Input() savedLocations: Array<CityInfo>;
	isMobile: boolean = this.isMobileCheck();

  constructor() { }

  ngOnInit(): void {
  }

	trackByGeonameid(location: CityInfo) {
    return location.geonameid;
	}

	isMobileCheck() {
		return window.matchMedia("(max-width: 768px)").matches;
	}

	emitLocation(location) {
		this.removeLocation.emit(location);
	}

}
