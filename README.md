
# Cricinfo_Extracter

Cricinfo Extracter (Cricinfo 2019 WorldCup Data Extracter)

##
## Purpose

 The purpose of the project is to extract the information of Worlcup 2019 from Cricinfo and present that info in the form of excel and pdf scorecards.

 The real purpose of the project is to learn how to extract the information from a website and get experience with it 
## Reason

A very good reason for me to make this project is I enjoyed while making it , It was a great fun activity for me .

## Activity 

**The tasks performed while making the project are -->** 
- Read data from the source : Cricinfo Worlcup 2019 (using the axios library)
- Process the data we read from website : Get all the teams( using the jsdom library)
- Change the information extracted (Array Manipulation) 
- Write processed data in excel (Match result per team in their own sheet) 
- Create folder one for each team 
- Write files: PDF files for scorecard of each match in relevant folder


## Tech Stack



**Programming Language** --> JavaScript

**Dependencies used by me while making this project are** -->>

                                                1.minimist
                                                2.axios
                                                3.jsdom 
                                                4.excel4node
                                                5.pdf-lib 
                                                6.fs -> this library is pre installed in node
                                                7.pdf -> to give the path name of files


## Installation

To run tests, run the following command

```bash
// npm init -y (y means yes and init means initialize )
// npm install minimist (we parse our input string to minimist)
// npm install axios (to download the data from web )
// npm install jsdom (create a DOM file for programmer , it basically does the work of the browser)
// npm install excel4node(creates the excel workboook and even creating worksheet )
// npm install pdf-lib (//pdf lib can do 2 types of work , create a complete new pdf , another is modify the already existing template)

Command to run the code -->
node CricinfoExtracter.js --excel="WorlCup.csv" --dataFolder="data" -- source="https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results"
```

