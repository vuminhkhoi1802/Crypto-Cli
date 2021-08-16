
### Prerequisites:

- [NodeJS Version 10 and above (Preferably 14.17.3 or 14.17.5)](https://nodejs.org/en/)
- [Yarn CLI Installed](https://yarnpkg.com/)

### How to run?

Copy the provided csv file to `./data` folder in the root of the project

Execute the following command:

```$ yarn && yarn run dev```

### Design Decisions:

- I chose `yarn` as the dedicated package manager as it is faster and less error prone than `npm` from my standpoint
- Regarding the given problem, I would like to break it down below

```
- The biggest problem was dealing with the large csv with about over 
3 million records. Thus in order to test my code if is working properly, I 
decided to make a copy of the csv file with just over 200 records.
The file is named transactions-copy.csv located in /data folder

- I chose fast-csv library as a csv parser because I found it 
is faster than csv-parser library

- For time parser, I chose moment library as It is a sophisticated 
library when dealing with input time in various format
```

### Suggested Improvements (From my own thoughts):
Due to time constraint, I did not have time to improve my application further. However, below are the improvements that 
I could think of first-hand.
- Adding Unit Tests
- Improve the csv file read stream (break the large file into at least 10 or more files and do parallel/concurrent reads)
- Improve the data handling (arrays -> Sets/Maps)
