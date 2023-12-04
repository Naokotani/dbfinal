import sqlite3 from "sqlite3";
import { input } from "@inquirer/prompts";
const db = new sqlite3.Database("data/final.db");

/**
 * Removes rows from the database
 */
const remove = async () => {
  console.log(
    "CAUTION: Deleting from the database may cause data inconsistencies!",
  );
  console.log("What table would you like to remove from?\n");
  console.log("Enter Corresponding letter");
  console.log(
    "b: books, a, authors, o: orders, c:customers r: return to last menu\n",
  );

  const res = await input({ message: "> " });
  let success;
  let where;
  let table;
  let messageTail = " deleted succesfully";

  switch (res) {
    case "a":
      table = "authors";
      const authorId = parseInt(
        await input({ message: "Please enter Author ID: " }),
      );
      where = `WHERE author_id=${authorId}`;
      success = authorId + messageTail;
      break;
    case "c":
      table = "customers";
      const customerId = parseInt(
        await input({ message: "Please enter Customer ID: " }),
      );
      where = `WHERE customer_id=${customerId}`;
      success = customerId + messageTail;
      break;
    case "o":
      table = "orders";
      const orderId = parseInt(
        await input({ message: "Please enter Order ID: " }),
      );
      where = `WHERE order_id=${orderId}`;
      success = orderId + messageTail;
      break;
    case "b":
      table = "books";
      const bookId = parseInt(
        await input({ message: "Please enter Book ID: " }),
      );
      where = `WHERE book_id=${bookId}`;
      success = bookId + messageTail;
      break;
    case "exit":
      db.close();
      process.exit();
    default:
      console.log("sorry, I didn't Catch that");
      remove();
  }

  const query = `DELETE FROM ${table} ${where}`;

  return new Promise((resolve, reject) => {
    const searchQuery = db.prepare(query);
    searchQuery.run((err) => {
      !err && console.log(success);
      searchQuery.finalize();
      if (!err) {
        resolve();
      } else {
        reject(() => console.log(err));
      }
    });
  });
};

export default remove;
