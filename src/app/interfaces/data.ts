import { CityInfo } from './cityInfo';

export interface Data {
	dataUnfiltered: Array<CityInfo>;
	dataFiltered: Array<CityInfo>;
	dataFilteredForDisplay: Array<CityInfo>;
	dataSavedForDisplay: Array<CityInfo>;
	dataSavedLocationsIds: Array<number>;
}
