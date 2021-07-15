import { Component, OnInit, DoCheck, HostListener, ViewEncapsulation, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { CityInfo } from './interfaces/cityInfo';
import { Settings } from './interfaces/settings';
import { Data } from './interfaces/data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
	encapsulation: ViewEncapsulation.None
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
		dataSavedForDisplay: [],
		dataSavedLocationsIds: []
	}
	userInputText: string;
	showNoResultsMessage: boolean;
	isMobile: boolean = this.isMobileCheck();
	isServerCall: boolean = false;
	errorTries: number = 0;
	@HostListener('window:resize', ['$event'])
	onResize() {
		this.isMobile = this.isMobileCheck();
	}

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) { }

	ngOnInit(): void {
    this.fetchData();
  }

	ngDoCheck(){
		this.showNoResultsMessage = this.testForNoResultsMessage();
  }

	private fetchData() {
		this.http.get(this.settings.getAllLocations)
    .subscribe(cities => {
			this.data.dataUnfiltered = cities['data'];

			this.displayInitData();
			this.isAppLoading = false;
    },
    error => {
			// check server again
			if (this.errorTries > 3) {
				this.showErrorMessage = true;
				return this.errorTries = 0;
			}

			// this.isAppLoading = false;
			++this.errorTries;
			this.fetchData();
    });
  }

	displayInitData() {
		this.data.dataFilteredForDisplay = this.buildDisplayData(this.data.dataUnfiltered, this.settings.itemsToShow);
		this.fetchSavedList();
	}

	isMobileCheck() {
		return window.matchMedia("(max-width: 768px)").matches;
	}

	buildDisplayData(dataArray: Array<CityInfo>, limit: number) {
		this.data.dataFiltered = dataArray;
		return dataArray.slice(0, limit);
	}

	getUpdatedSearchText(userText: string) {
		// update global variable
		this.userInputText = userText;
		const textFilteredData = this.filterDataByText(this.data.dataUnfiltered, userText);
		this.data.dataFilteredForDisplay = this.buildDisplayData(textFilteredData, this.settings.itemsToShow);
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

	updateSavedList(location: CityInfo, type: boolean) {
		this.updateSingleSaved(location, type);
	}

	private updateSingleSaved(location: CityInfo, flag: boolean) {
		this.isServerCall = true;
		this.removeScroll();
		const obj = {};
		obj[location.geonameid+''] = flag;

		this.http.patch(this.settings.getSavedLocations, obj)
		.subscribe(data => {
				// fetch list
				this.fetchSavedList();
				this.isServerCall = false;
				this.addScroll();
		},
		error => {
			// check server again
			if (this.errorTries >= 3) {
				this.isAppLoading = false;
				this.isServerCall = false;
				return this.errorTries = 0;
			}

			this.addScroll();
			++this.errorTries;
			this.fetchData();
		});
	}

	fetchSavedList() {
		this.isServerCall = true;

		this.http.get(this.settings.getSavedLocations)
    .subscribe(savedCities => {
			this.data.dataSavedLocationsIds = savedCities['data'];
			this.data.dataSavedForDisplay = this.findLocationsById(savedCities['data']);
			this.isServerCall = false;
    },
    error => {
			// check server again
			if (this.errorTries > 3) {
				this.isServerCall = false;
				this.showErrorMessage = true;
				return this.errorTries = 0;
			}

			this.isServerCall = false;
			++this.errorTries;
			this.fetchData();
    });
	};

	findLocationsById(savedCities: Array<number>) {
		return this.data.dataUnfiltered.filter(city => {
			if (savedCities.includes(city.geonameid)) return city;
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

	addScroll() {
		this.document.body.classList.remove('overflow-hidden');
	}

	removeScroll() {
		this.document.body.classList.add('overflow-hidden');
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
