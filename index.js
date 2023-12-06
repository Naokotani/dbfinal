import sqlite3 from "sqlite3";
import select from '@inquirer/select';
import fs from 'fs';

/*Import query moldules*/
import add from "./queries/add.js";
import sort from "./queries/sort.js";
import list from "./queries/list.js";
import search from "./queries/search.js";
import remove from "./queries/remove.js";
import setupDb from "./setup-database.js";


// Check to see if the db file exists. If it does not, setup the database.
await checkDbFile();

// Set db variable after checking to see if it exists or it will be created automatically
const db = new sqlite3.Database("data/final.db");

//Start the main loop
main();

/**
 *Main function that sorts prompts to direct to the correct query builder
 * @async
 * @function main
 */
async function main() {
  while (true) {
    let q = {};

		const res = await select({
			message: 'What would you like to do?',
			choices: [
				{
					name: 'Queries',
					value: 'queries',
					description: 'Queries for the final',
				},
				{
					name: 'List',
					value: 'list',
					description: 'List the different tables in the database',
				},
				{
					name: 'Add',
					value: 'add',
					description: 'Add a new row to a table',
				},
				{
					name: 'Search',
					value: 'search',
					description: 'Search for a single row in a table',
				},
				{
					name: 'Remove',
					value: 'remove',
					description: 'Remove a single row from a table',
				},
				{
					name: 'Exit',
					value: 'exit',
					description: 'Exit the app',
				},
			],
		});
		
    switch (res) {
      case "queries":
				/* Some quries don't return any data so I added a boolean
				*  to determine whether they should go to queryEach or queryRun */
        q = await sort();
				if (q && q.run) {
					await queryRun(q.query, q.message);
				} else if (q) {
					await queryEach(q.query, q.message);
				}
        break;
      case "list":
        q = await list();
        q && await queryEach(q.query, q.message);
        break;
      case "add":
        q = await add();
        q && await queryEach(q.query, q.message);
        break;
      case "search":
        q = await search();
				q && await queryGet(q.query, q.message);
        break;
      case "remove":
				q = await remove();
				q && await queryRun(q.query, q.message);
        break;
      case "exit":
        process.exit();
      case "?":
        console.log(help());
        break;
      default:
        console.log("\nSorry, didn't recognize that one. ? for help\n\n");
    }
  }
}


/**
 * Queries the database multiple times and returns an object for each row in the query result
 * Prints the results in the rows Object. 
 *
 * @param {string} q Query that is sent to the database
 * @param {string} m message displayed in the callback after the query
 */
async function queryEach(q, m = '') {
  return new Promise((resolve, reject) => {
    const searchQuery = db.prepare(q);
    let err;
		searchQuery.each(
			(e, row) => {
				err = e;
				!row && console.log("Couldn't find any matching records")
			},
			(e, rows) => {
				err = e;
				console.log(rows);
			},
			(e) => {
				err = e;
				console.log(m);
				if (!err) {
					resolve();
				} else {
					reject(() => console.log(err));
				}
			},
		)
  });
}

/**
 * Queries the database, but does not return any results.
 * @param {string} q Query that is sent to the database
 * @param {string} m message displayed in the callback after the query
 */
async function queryRun(q, m) {
  return new Promise((resolve, reject) => {
    const searchQuery = db.prepare(q);
    searchQuery.run(function (err) {
			if (!err && this.changes) {
				console.log(m);
			} else if (!err && !this.changes) {
				console.log("\n**No records matched your query**\n");
			}

      if (!err) {
        resolve();
      } else {
        reject(() => console.log(err));
      }
    });
  });
}

/**
 * Queries the database. Retrieves and prints th results
 * @param {string} q Query that is sent to the database
 * @param {string} m message displayed in the callback after the query
 */
async function queryGet(q, m) {
	return new Promise((resolve, reject) => {
		const searchQuery = db.prepare(q);
		searchQuery.get((err, row) => {
			row?console.log(row):
				console.log("\n\n**We couldn't find any results matching your query**\n\n");
			console.log(m)
			if (!err) {
        resolve();
			} else {
				reject(() => console.log(err))
			}
		});
	});
}

/**
 * Check to see if the databae file exists and if it does not, create it.:w
 * @function checkDbFile
 */
async function checkDbFile() {
	if (!fs.existsSync('./data/final.db')) {
		await setupDb();
	}
}
