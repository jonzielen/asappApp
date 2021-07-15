import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CityInfo } from '../interfaces/cityInfo';
import { Data } from '../interfaces/data';

@Component({
  selector: 'app-locations-display',
  templateUrl: './locations-display.component.html',
  styleUrls: ['./locations-display.component.scss']
})
export class LocationsDisplayComponent implements OnInit {
	@Output() saveLocation: EventEmitter<{location: CityInfo, type: boolean}> = new EventEmitter();
	@Input() locations: Data;

  constructor() { }

  ngOnInit(): void {
  }

	trackByGeonameid(location: CityInfo) {
    return location.geonameid;
	}

	isSaved(id: number) {
		return this.locations.dataSavedLocationsIds.includes(id);
	}

	emitSaved(loc: CityInfo, isChecked: boolean) {
		const saveData = {
			location: loc,
			type: isChecked
		};
		this.saveLocation.emit(saveData);
	}
}
