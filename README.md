# FutXplorer

## Project Overview

FutXplorer is a web-based application that allows users to search and explore football players along with their performance statistics. The application fetches real-time data from a public football API and presents it in an interactive and structured interface.

Users can search for players such as Cristiano Ronaldo, Lionel Messi, or Rodrygo and view key performance metrics including goals, assists, and appearances.

---

## Purpose

The purpose of this project is to demonstrate:

* Integration of a public API using the Fetch API
* Handling authenticated API requests using headers
* Data manipulation using JavaScript array higher-order functions
* Implementation of search, filtering, and sorting features
* Development of a clean and responsive user interface

---

## API Used

This project uses the API-Football service.

* Provider: API-Football (via API Sports)
* Description: Provides detailed football data including players, teams, leagues, and performance statistics
* Data Format: JSON

Example endpoint:
https://v3.football.api-sports.io/players?search=Ronaldo

Authentication is required using an API key passed in request headers.

---

## Planned Features

### Search

* Search players by name (e.g., Cristiano Ronaldo, Messi)

### Filtering

* Filter players based on:

  * Goals scored
  * Assists
  * Team
  * Position

### Sorting

* Sort players by:

  * Goals (ascending / descending)
  * Assists
  * Player name

### Additional Features

* Responsive design for different screen sizes
* Loading indicator during API calls
* Error handling for failed API requests
* Display message when no results are found
* Optional: Save favorite players using local storage

---

## Technologies Used

* HTML
* CSS
* JavaScript (ES6)
* Fetch API

---

## Project Structure

football-player-explorer/

* index.html
* style.css
* script.js
* README.md

---

## How to Run the Project

1. Clone the repository:
   git clone https://github.com/codebrak07/football-player-explorer

2. Open the project folder

3. Open index.html in a browser

4. Add your API-Football API key in the script file before running the project

---

## Notes

This project focuses on building a functional and interactive interface while applying JavaScript concepts such as array methods and API handling. The implementation is designed to balance simplicity and functionality while working within API constraints such as request limits.

---

## Author

BRAK
