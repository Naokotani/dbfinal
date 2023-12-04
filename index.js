import sqlite3 from "sqlite3";
import { input } from "@inquirer/prompts";
const db = new sqlite3.Database("data/final.db");

/*Import query moldules*/
import add from "./queries/add.js";
import sort from "./queries/sort.js";
import list from "./queries/list.js";
import search from "./queries/search.js";
import remove from "./queries/remove.js";

/**
 *Main function that sorts prompts to direct to the correct query builder
 */
async function main() {
  while (true) {
    console.log(
      "What would you like to do? (? to list commands 'exit' to quit)",
    );
    const res = await input({
      message: "> ",
    });
    let q;
    switch (res) {
      case "sort":
        q = await sort();
        await query(q.query, q.message);
        break;
      case "list":
        q = await list();
        await query(q.query, q.message);
        break;
      case "add":
        q = await add();
        await query(q.query, q.message);
        break;
      case "search":
        await search();
        break;
      case "remove":
        await remove();
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

main();

/**
 * Queries the database
 * @param {string} q Query that is sent to the database
 * @param {string} m message displayed in the callback after the query
 */
async function query(q, m = '') {
  return new Promise((resolve, reject) => {
    const searchQuery = db.prepare(q);
    let err;
    searchQuery.each(
      (e, row) => {
        err = e;
        if (t == 'search') console.log(row);
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
    );
  });
}

/**
 *Generates a help string
 *@returns {string} to describe main() options
 */
function help() {
  return `
?: For more options
search: search for specific entries
list: Lists database tables
add: Add entries to database
remove: Remove entries from database
exit: Use anywhere to exit app
sort: Sorted and advanced queries
`;
}
