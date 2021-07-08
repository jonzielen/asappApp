import { Component, OnInit, DoCheck } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CityInfo } from './interfaces/cityInfo';
import { Settings } from './interfaces/settings';
import { Data } from './interfaces/data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, DoCheck {
	isAppLoading: boolean = true;
	showErrorMessage: boolean = false;
	settings: Settings = {
		getAllLocations: 'http://localhost:3030/cities',
		getSavedLocations: 'http://localhost:3030/preferences/cities',
		itemsToShow: 10
	}
	data: Data = {
		dataUnfiltered: [],
		dataFiltered: [],
		dataFilteredForDisplay: [],
		dataSavedForDisplay: []
	}
	userInputText: string;
	showNoResultsMessage: boolean;

  constructor(private http: HttpClient) { }

	ngOnInit(): void {
    this.fetchData();
  }

	ngDoCheck(){
		this.showNoResultsMessage = this.testForNoResultsMessage();
  }

	private fetchData() {
		this.http.get(this.settings.getAllLocations)
    .subscribe(cities => {
			// this.data.dataUnfiltered = cities['data'].slice(0, 200); // remove slice limit
			this.data.dataUnfiltered = cities['data'];

			this.displayInitData();
			this.isAppLoading = false;
    },
    error => {
			this.showErrorMessage = true;
    });
  }

	displayInitData() {
		this.data.dataFilteredForDisplay = this.buildDisplayData(this.data.dataUnfiltered, this.settings.itemsToShow);
		this.fetchSavedList();
	}

	trackByGeonameid(index: number, location: CityInfo) {
    return location.geonameid;
	}

	buildDisplayData(dataArray: Array<CityInfo>, limit: number) {
		this.data.dataFiltered = dataArray;
		return dataArray.slice(0, limit);
	}

	getUpdatedSearchText(userText: string) {
		// update global variable
		this.userInputText = userText;

		// if text is empty, show all data
		if (userText === '') {

			// remove filtered items
			let dataFiltered = this.filterRemoveSavedItems(this.data.dataUnfiltered);

			return this.data.dataFilteredForDisplay = this.buildDisplayData(dataFiltered, this.settings.itemsToShow);
		}

		const array = this.data.dataUnfiltered;

		// filter by text
		const data = this.filterDataByText(array, userText);

		// remove filtered items
		let dataFiltered = this.filterRemoveSavedItems(data);

		// update browser
		this.data.dataFilteredForDisplay = this.buildDisplayData(dataFiltered, this.settings.itemsToShow);
  }

	filterDataByText(arrayData: Array<CityInfo>, searchText: string) {
		return arrayData.filter(function(location: CityInfo) {
			for (let prop in location) {
				// exit on empty prop vals
				if (location[prop] === null) return;

				let flag = ['country', 'name', 'subcountry'].includes(prop.toString()) ? true : false;

				// search
				if (
					location[prop].toString().toLowerCase().search(new RegExp(searchText, 'i')) > -1 &&
					flag ) return location;
			}
		});
	}

	updateSavedList(location: CityInfo, type: string) {
		if (type === 'add') {
			// send data to server
			this.updateSingleSaved(location, true);
		}

		if (type === 'remove') {
			this.updateSingleSaved(location, false);
		}
	}

	private updateSingleSaved(location: CityInfo, flag: boolean) {

		const obj = {};
		obj[location.geonameid+''] = flag;

		this.http.patch(this.settings.getSavedLocations, obj)
		.subscribe(data => {
				// fetch list
				this.fetchSavedList();
		},
		error => {
			console.log("Error", error);
		});
	}

	fetchSavedList() {
		this.http.get(this.settings.getSavedLocations)
    .subscribe(savedCities => {
			this.data.dataSavedForDisplay = this.findLocationsById(savedCities['data']);
			this.data.dataFiltered = this.sortListForUnsaved(savedCities['data']);
			this.data.dataFilteredForDisplay = this.buildDisplayData(this.data.dataFiltered, this.settings.itemsToShow);
    },
    error => {
			this.showErrorMessage = true;
    });
	};

	sortListForUnsaved(savedCities) {
		return this.data.dataUnfiltered.filter(city => {
			if (!savedCities.includes(city.geonameid)) return city;
		});
	}

	findLocationsById(savedCities) {
		return this.data.dataUnfiltered.filter(city => {
			if (savedCities.includes(city.geonameid)) return city;
		});
	}

	filterRemoveSavedItems(items: Array<CityInfo>) {
		return items.filter(item => !item.saved);
	}

	filterRemoveUnsavedItems(array: Array<CityInfo>) {
		return array.filter(item => !!item.saved);
	}

	updateSavedFlag(array: Array<CityInfo>, location: CityInfo, value: boolean) {
		return array.map(item => {
			if (item.geonameid === location.geonameid) item.saved = value;
			return item;
		});
	}

	scrollCheck(target: HTMLElement) {
		// if user scrolls to within 200px of bottom, add more data if available
		if ((target.scrollTop + target.offsetHeight) > target.scrollHeight - 200) {
			this.updateDisplayData();
		}
	}

	updateDisplayData() {
		const updatedArrayLength = this.data.dataFilteredForDisplay.length + this.settings.itemsToShow;
		const filterCopy = this.data.dataFiltered.slice();

		this.data.dataFilteredForDisplay = filterCopy.slice(0, updatedArrayLength);
	}

	testForNoResultsMessage() {
		const hasFilteredData = this.data.dataFilteredForDisplay.length === 0;
		const hasErrorMessage = this.showErrorMessage;
		const hasDefinedInputText = this.userInputText !== 'undefined';
		const hasInputText = this.userInputText !== '' ? true : false;

		if (
			hasFilteredData &&
			!hasErrorMessage &&
			hasDefinedInputText &&
			hasInputText &&
			this.isAppLoading === false
		) return true;

		return false;
	}
}
