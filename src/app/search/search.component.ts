import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @ViewChild('locationSearch', {static: false}) locationSearch: ElementRef;
  @Output() searchText: EventEmitter<string> = new EventEmitter();
	@Input() isLoading: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  getLocations() {
    const searchCode = this.locationSearch.nativeElement.value;
    this.searchText.emit(searchCode);
  }
}
