import sqlite3 from "sqlite3";
import { input } from "@inquirer/prompts";
import select from '@inquirer/select';
import choices from './choices.js';


/**
 * Removes rows from the database
 * @async
 * @function remove
 * @return {Object} An SQL Query and a message for a successful query.
 */
const remove = async () => {
	const db = new sqlite3.Database("data/final.db");
  let success;
  let where;
  let table;
  let messageTail = " deleted succesfully";

  console.log(
    "**CAUTION: Deleting from the database may cause data inconsistencies!**\n",
  );
	const res = await select({
		message: "What table would you like to remove from?\n",
		choices: choices(),
	});

  switch (res) {
    case "a":
      table = "authors";
			const authorId = parseInt(
				await input({ message: "Please enter Author ID: " }),
			);
			if (isNaN(authorId)) {
				console.log("Not a valid number");
				return;
			}
			where = `WHERE author_id=${authorId}`;
			success = authorId + messageTail;
			break;
    case "c":
      table = "customers";

			const	customerId = parseInt(
				await input({ message: "Please enter Customer ID: " }),
			);
			if (isNaN(customerId)) {
				console.log("Not a valid number");
				return;
			}
      where = `WHERE customer_id=${customerId}`;
      success = customerId + messageTail;
      break;
    case "o":
      table = "orders";
			const orderId = parseInt(
				await input({ message: "Please enter Order ID: " }),
			);
			if (isNaN(orderId)) {
				console.log("Not a valid number");
				return;
			}
      where = `WHERE order_id=${orderId}`;
      success = orderId + messageTail;
      break;
    case "b":
      table = "books";
			const	bookId = parseInt(
				await input({ message: "Please enter Book ID: " }),
			);
			if (isNaN(bookId)) {
				console.log("Not a valid number");
				return;
			}
      where = `WHERE book_id=${bookId}`;
      success = bookId + messageTail;
      break;
		case 'back':
			return;
    case "exit":
      db.close();
      process.exit();
    default:
      console.log("sorry, I didn't Catch that");
      remove();
}

  const query = `DELETE FROM ${table} ${where}`;

	return {query: query, message: success};

};

export default remove;
