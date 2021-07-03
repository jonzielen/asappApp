import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface CityInfo {
  geonameid: number;
  name: string;
  country: string;
  subcountry?: string;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title: string = 'asappApp';
	showErrorMessage: boolean = false;
	errorMessage: string = 'There was an error, please try again later.'
	fullSearchData: Array<CityInfo>;
	filteredSearchData: Array<CityInfo>;
	savedLocations: Array<CityInfo> = [];

  constructor(private http: HttpClient) { }

	ngOnInit(): void {
    this.fetchData();
  }

	private fetchData() {
		const apiUrl = 'http://localhost:3030/cities';

		this.http.get(apiUrl)
    .subscribe(cities => {

      this.fullSearchData = cities['data'].slice(0,200); // remove slice limit
			this.filteredSearchData = this.fullSearchData;
    },
    error => {
			this.showErrorMessage = true;
    });
  }

	// change name
	updateSearchText(e: string) {
		this.filteredSearchData = this.filterData(e);
  }

	filterData(searchText: string) {
		// default to show all search data
		if (!this.filteredSearchData || !searchText) return this.fullSearchData;

		return this.fullSearchData.filter(function(location: CityInfo) {
			for (let prop in location) {
				// search
				if (location[prop].toString().toLowerCase().search(new RegExp(searchText, 'i')) > -1) return location;
			}
		});
	}

	addToSaved(event: Event, locationData: CityInfo, index: number) {
		// add data to saved array
		this.savedLocations.push(locationData);

		// remove item from master array
		this.fullSearchData.splice(index, 1);

		// remove data from filtered array
		this.filteredSearchData = this.fullSearchData;
	}

	removeFromSaved(event: Event, locationData: CityInfo, index: number) {
		// add data to saved array
		this.savedLocations.splice(index, 1);

		// remove item from master array
		this.fullSearchData.push(locationData);

		// remove data from filtered array
		this.filteredSearchData = this.fullSearchData;
	}









}
