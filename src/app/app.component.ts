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
		apiUrl: 'http://localhost:3030/cities',
		itemsToShow: 10
	}
	data: Data = {
		dataUnfiltered: [],
		dataFiltered: [],
		dataFilteredDisplay: [],
		dataSavedDisplay: []
	}
	userInputText: string;
	showLoadingMessage: boolean;
	showNoResultsMessage: boolean;

  constructor(private http: HttpClient) { }

	ngOnInit(): void {
    this.fetchData();
  }

	ngDoCheck(){
		this.showLoadingMessage = this.testForLoadingMessage();
		this.showNoResultsMessage = this.testForNoResultsMessage();
  }

	private fetchData() {
		this.http.get(this.settings.apiUrl)
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
		this.data.dataFilteredDisplay = this.buildDisplayData(this.data.dataUnfiltered, this.settings.itemsToShow);
	}

	buildDisplayData(dataArray: Array<CityInfo>, limit: number) {
		this.data.dataFiltered = dataArray;
		return dataArray.slice(0, limit);
	}

	getUpdatedSearchText(userText: string) {
		// update global variable
		this.userInputText = userText;

		// if text is empty, show all data
		if (userText === '') return this.data.dataFilteredDisplay = this.buildDisplayData(this.data.dataUnfiltered, this.settings.itemsToShow);

		// determine array to use
		const array = this.data.dataFiltered.length === 0 ? this.data.dataUnfiltered : this.data.dataFiltered;

		// filter by text
		const data = this.filterDataByText(array, userText);

		// update browser
		this.data.dataFilteredDisplay = this.buildDisplayData(data, this.settings.itemsToShow);
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
			// update item status
			this.data.dataUnfiltered = this.updateSavedFlag(this.data.dataUnfiltered, location, true);

			// updates saved items list
			this.data.dataSavedDisplay = this.filterRemoveUnsavedItems(this.data.dataUnfiltered);

			// remove filtered items
			let data = this.filterRemoveSavedItems(this.data.dataUnfiltered);

			// apply text search
			if (this.userInputText !== '') data = this.filterDataByText(data, this.userInputText);

			// update browser
			this.data.dataFilteredDisplay = this.buildDisplayData(data, this.settings.itemsToShow);
		}

		if (type === 'remove') {
			// update item status
			this.data.dataUnfiltered = this.updateSavedFlag(this.data.dataUnfiltered, location, false);

			// updates saved items list
			this.data.dataSavedDisplay = this.filterRemoveUnsavedItems(this.data.dataUnfiltered);

			// remove saved items
			let data = this.filterRemoveSavedItems(this.data.dataUnfiltered);

			// apply text search
			if (this.userInputText !== '') data = this.filterDataByText(data, this.userInputText);

			// update browser
			this.data.dataFilteredDisplay = this.buildDisplayData(data, this.settings.itemsToShow);
		}
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
		const updatedArrayLength = this.data.dataFilteredDisplay.length + this.settings.itemsToShow;
		const filterCopy = this.data.dataFiltered.slice();

		this.data.dataFilteredDisplay = filterCopy.slice(0, updatedArrayLength);
	}

	testForLoadingMessage() {
		const hasErrorMessage = this.showErrorMessage;

		if (
			this.isAppLoading &&
			!hasErrorMessage
		) return true;

		return false;
	}

	testForNoResultsMessage() {
		const hasFilteredData = this.data.dataFilteredDisplay.length === 0;
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
