# AsappApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## UX Issues

### Too many data points to display

There are over 3,000 cities returned from the server, and to display them all, or have the user filter them all at once would too taxing on the browser (i.e. updating the DOM). To fix this I limited the initial display to 10 cities, then dynamically added 10 more cities when the user scrolls to within 200 pixels of the end of the list. I also used the built in Angular feature "trackby" that only updates the items in the cities list that need to be changed (and not everything).

On mobile, to keep the focus on the full cities list, I added the saved items to a collapsed div where the user can click a button to toggle their saved items. This saved space and makes the content more manageable.

### Only the checkbox removes the city from the saved list

The only way to remove cities from the saved list was to find it in the main cities list and unselect the checkbox. I added an "X" to each individual saved city in the saved list, so the user can remove cities from there, saving them from searching the whole list.
