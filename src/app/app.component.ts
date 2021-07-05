import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators'

interface CityInfo {
  geonameid: number;
  name: string;
  country: string;
  subcountry?: string;
	index: number;
	saved: boolean;
};

interface Settings {
	itemsToShow: number
}

interface Data {
	dataUnfiltered: Array<CityInfo>;
	dataFiltered: Array<CityInfo>;
	dataFilteredDisplay: Array<CityInfo>;
	dataSavedDisplay: Array<CityInfo>;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title: string = 'asappApp';
	showErrorMessage: boolean = false;
	settings: Settings = {
		itemsToShow: 10
	}
	data: Data = {
		dataUnfiltered: [],
		dataFiltered: [],
		dataFilteredDisplay: [],
		dataSavedDisplay: []
	}
	userInputText: string;

  constructor(private http: HttpClient) { }

	ngOnInit(): void {
    this.fetchData();
  }

	private fetchData() {
		const apiUrl = 'http://localhost:3030/cities';
		// const apiUrl = 'http://localhost:3030/cities?limit=10&offset=0';

		// load only 10 files initially, then load the rest after
		// http://localhost:3030/cities?limit=20&offset=0


		this.http.get(apiUrl)
		.pipe(map(rawData => {
			// add index, and saved status; index will help with finding locations in the future
			rawData['indexedData'] = rawData['data'].map((item: object, i: number) => {
				item['index'] = i;
				item['saved'] = false;
				return item;
			});
			return rawData;
		}))
    .subscribe(cities => {
			// this.data.dataUnfiltered = cities['indexedData'].slice(0, 50); // remove slice limit
			this.data.dataUnfiltered = cities['indexedData'];
			this.displayInitData();
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
				// limit to these props, exit if not in list
				if (!['name', 'country', 'subcountry'].includes(prop)) return;

				// search
				if (location[prop].toString().toLowerCase().search(new RegExp(searchText, 'i')) > -1) return location;
			}
		});
	}

	updateSavedList(location: CityInfo, type: string) {
		if (type === 'add') {
			// update item status
			this.data.dataUnfiltered[location['index']].saved = true;

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
			this.data.dataUnfiltered[location['index']].saved = false;

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
		return items.filter(item => !!!item.saved);
	}

	filterRemoveUnsavedItems(array: Array<CityInfo>) {
		return array.filter(item => !!item.saved);
	}

	removeSavedLocation(savedLocation: Array<CityInfo>, id: number) {
		return savedLocation.filter( item => item.geonameid !== id);
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
}
