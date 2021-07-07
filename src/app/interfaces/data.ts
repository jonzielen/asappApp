import { CityInfo } from './cityInfo';

export interface Data {
	dataUnfiltered: Array<CityInfo>;
	dataFiltered: Array<CityInfo>;
	dataFilteredDisplay: Array<CityInfo>;
	dataSavedDisplay: Array<CityInfo>;
}
