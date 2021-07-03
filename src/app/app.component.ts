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
	citiesData: Array<CityInfo>;
	locationSearchText: string;

  constructor(private http: HttpClient) { }

	ngOnInit(): void {
    this.fetchData();
  }

	private fetchData() {
		const apiUrl = 'http://localhost:3030/cities';

		this.http.get(apiUrl)
    .subscribe(cities => {
			console.log(cities);

      // this.citiesData = cities['data'];
			this.citiesData = cities['data'].slice(0, 199); // work with manageable subset for now
    },
    error => {
			this.showErrorMessage = true;
    });
  }

	getSearchText(e) {
    this.locationSearchText = e;
  }

}
