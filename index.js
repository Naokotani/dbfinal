import sqlite3 from "sqlite3";
import { input } from "@inquirer/prompts";
const db = new sqlite3.Database("data/final.db");

/**
 *Main function that sorts prompts to direct to the correct query builder
 */
async function main() {
  while (true) {
    console.log(
      "What would you like to do? (? to list commands 'exit' to quit)"
    );
    const res = await input({
      message: "> ",
    });
    switch (res) {
      case "sort":
        sort();
        break;
      case "list":
        await list();
        break;
      case "add":
        await add();
        break;
      case "search":
        search();
        break;
      case "remove":
        remove();
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
 *Generates queries for the final project questions
 */
async function sort() {
  console.log(`
Please enter one of the following
*********************************

b: Books with author names
s: Total sales 
t: Top 3 bestsellers
m: Customers with multiple orders
u: update price of all books by =/- 10%
a: Average Price for author's books
n: Authors with no published books
i: Identiy customers with no orders
`);
  const res = input({ message: "> " });

  let q;
  let type;
  let msg = "";

  switch (res) {
    case "b":
      // Retrieve the list of books with their authors.
      q = `
SELECT b.title, a.author_name FROM books b
JOIN authors a ON b.author_id=a.author_id
`;
      break;
    case "s":
      // Find the total sales (quantity * price) for each book.
      q = `
SELECT b.title, SUM(o.quantity) * b.price AS "Total Sales"
FROM books b
JOIN orders o ON b.book_id=o.book_id
GROUP BY b.book_id
`;
      break;
    case "t":
      // Identify the top 3 bestselling genres.
      q = `
SELECT b.genre AS "Bestselling Genres"
FROM books b
JOIN orders o ON b.book_id=o.order_id
WHERE b.genre <> ''
GROUP BY b.genre
ORDER BY COUNT(o.quantity) DESC
LIMIT 3
`;
      break;
    case "m":
      // List customers who have made at least two orders.
      q = `
SELECT c.customer_id,
c.first_name || " " || c.last_name AS "Customer Name",
count(o.order_id) AS "Orders Placed"
FROM customers c
JOIN orders o ON c.customer_id=o.customer_id
GROUP BY c.customer_id
HAVING count(o.order_id)>1
`;
      break;
    case "a":
      // Calculate the average price of books for each author.
      q = `
SELECT a.author_id, a.author_name, avg(b.price) AS "Average Price"
FROM authors a
JOIN books b ON a.author_id=b.author_id
GROUP BY a.author_id
`;
      break;
    case "u":
      // Update the price of all books in a specific genre by 10%.
      const genre = await input({
        message: "Which Genre would you like to update? ",
      });
      const update = await input({
        message: "Increment (+) or decrement (-)? ",
      });
      let o;
      if (update === "+") {
        o = "*";
      } else if (update === "-") {
        o = "/";
      } else {
        console.log("incorrect input");
        sort();
      }
      q = `
UPDATE books SET price=price${o}1.1
WHERE genre="${genre}"
`;
      msg = `updating ${genre}`;
      type = "update";

      break;
    case "n":
      // Retrieve the authors who have not published any books.
      q = `
SELECT a.author_id, a.author_name
FROM authors a
LEFT JOIN books b ON a.author_id=b.author_id
WHERE b.author_id IS NULL
`;
      break;
    case "i":
      // Identify customers who have not placed any orders.
      q = `
SELECT c.customer_id, c.first_name || " " || c.last_name As "Customer Name"
FROM customers c
LEFT JOIN orders o ON c.customer_id=o.customer_id
WHERE o.customer_id IS NULL
`;
      break;
    default:
      console.log("sorry, I Didn't catch that");
      sort();
  }
  query(q, type, msg);
}

/**
 *Generates simple search queries
 */
async function search() {
  const db = new sqlite3.Database("data/final.db");
  console.log("What would you like to search for?\n");
  console.log("Enter Corresponding letter");
  console.log(
    "b: books, a, authors, o: orders, c:customers r: return to last menu\n"
  );
  const res = await input({ message: "> " });

  let query;

  switch (res) {
    case "b":
      const book = await input({ message: "Enter the book title: " });
      query = `
SELECT b.book_id, b.title, a.author_name, b.genre, b.price
FROM books b
JOIN authors a ON b.author_id=a.author_id
WHERE b.title="${book}";
`;
      break;
    case "a":
      const author = await input({ message: "Enter the author name: " });
      query = `
SELECT author_id, author_name, birth_date, nationality
FROM authors
WHERE author_name="${author}"
`;
      break;
    case "o":
      const order = await input({ message: "Enter the order ID: " });
      query = `
SELECT o.order_id,
c.first_name || " " || c.last_name AS "Customer Name",
b.title,
o.order_date,
o.quantity
FROM orders o
JOIN books b ON o.book_id=b.book_id
JOIN customers c ON o.customer_id=c.customer_id
WHERE o.order_id=${order}
`;
      break;
    case "c":
      const customer = await input({ message: "Enter customer last name: " });
      query = `
SELECT customer_id,
first_name || " " || last_name AS "Customer Name",
email
FROM customers
WHERE last_name="${customer}"
`;
      break;
    case "exit":
      process.exit();
    default:
      console.log("Sorry, didn't catch that");
      search();
  }

  const searchQuery = db.prepare(query);

  searchQuery.each(
    (err, row) => {
      if (err) console.error(err);
      console.log(row);
    },
    (err, rows) => {
      if (err) console.error(err);
      if (!rows && type != "update")
        console.log("\n\n**Can't find record match.**\n\n");
    }
  );

  searchQuery.finalize();
}

/**
 * Lists tables in the database
 */
async function list() {
  console.log("What would you like to list?\n");
  console.log("Enter Corresponding letter");
  console.log(
    "b: books, a, authors, o: orders, c:customers r: return to last menu\n"
  );
  let res = await input({message: "> "});
  let q;

  switch (res) {
    case "b":
      console.log("Book list\n\n");
      q = `
SELECT b.book_id, b.title, b.genre, b.price, a.author_name as author
FROM books b
JOIN authors a ON b.author_id=a.author_id
`;
      break;
    case "a":
      console.log("Author List\n\n");
      q = "SELECT author_id, author_name, birth_date, nationality FROM authors";
      break;
    case "o":
      console.log("Orders List\n\n");
      q = `
SELECT o.order_id as "Order ID",
b.title AS Title,
c.first_name || " " || c.last_name as "Customer Name",
o.order_date as "Order Date",
b.price,
quantity AS Quantity
FROM orders o
JOIN books b ON o.book_id=b.book_id
JOIN customers c ON o.customer_id=c.customer_id
`;
      break;
    case "c":
      console.log("customers List\n\n");
      q = `
SELECT first_name || " " || last_name AS Name,
email,
customer_id
FROM customers
`;
      break;
    case "exit":
      db.close();
      process.exit();
    default:
      console.log("Sorry, didn't catch that");
      list();
  }

  await query(q);
}

/**
 * Generates queries to add rows to the database
 */
async function add() {
  console.log("What table would you like to add to?\n");
  console.log("Enter Corresponding letter");
  console.log(
    "b: books, a, authors, o: orders, c:customers r: return to last menu\n"
  );

  const res = await input({ message: "> " });
  let q;
  let success;

  switch (res) {
    case "b":
      console.log(
        "Plese enter the book details. For author id, list authors\n"
      );

<<<<<<< HEAD
      const title = await input({ message: "Title: " });
      const authorId = parseInt(await input({ message: "Author ID:" }));
      const genre = await input({ message: "Genre: " });
      const price = parseInt(await input({ message: "Price: " }));
=======
      const title = prompt("Title: ");
      const authorId = parseInt(prompt("Author ID:"));
      const genre = prompt("Genre: ");
      const price = parseInt(prompt("price: "));
>>>>>>> main
      success = title + " added";
      q = `
INSERT INTO books (title, author_id, genre, price)
VALUES ("${title}", ${authorId}, "${genre}", ${price})`;
      break;

    case "a":
      const name = await input({ message: "Name: " });
      console.log("Enter Birth date in format YYYY-MM-DD");
      const birth = await input({ message: "Birth Date: " });
      const nationality = await input({ message: "Nationality: " });
      success = name + " added";
      q = `
INSERT INTO authors (author_name, birth_date, nationality)
VALUES ("${name}", "${birth}", "${nationality}")`;
      break;

    case "o":
      console.log(
        "In order to add order, please search book and customer for ID\n"
      );

      const customerId = parseInt(await input({ message: "Customer ID: " }));
      const bookId = parseInt(await input({ message: "Book ID: " }));
      const quantity = parseInt(await input({ message: "Quantity: " }));
      const date = new Date().toISOString();
      success = "Order Added";
      q = `
INSERT INTO orders (customer_id, book_id, order_date, quantity)
VALUES (${customerId}, ${bookId}, "${date}", ${quantity})`;
      break;

    case "c":
    const first = await input({message: "First Name: "});
    const last = await input({message: "Last Name: "});
    const email = await input({message: "Email: "});
      success = first + " " + last + " Added";
      q = `
INSERT INTO customers (first_name, last_name, email)
VALUES ("${first}", "${last}", "${email}")`;
      break;

    case "exit":
      db.close();
      process.exit();
    default:
      console.log("Sorry, didn't catch that.");
			add();
  }

  await query(q, "success", success);
}

/**
 * Removes rows from the database
 */
async function remove() {
  console.log(
    "CAUTION: Deleting from the database may cause data inconsistencies!"
  );
  console.log("What table would you like to remove from?\n");
  console.log("Enter Corresponding letter");
  console.log(
    "b: books, a, authors, o: orders, c:customers r: return to last menu\n"
  );

  const res = await input({message: "> "});
  let success;
  let where;
  let table;

  switch (res) {
    case "a":
      table = "authors";
    const authorId = parseInt(await input({message: "Please enter Author ID: "}));
      where = `WHERE author_id=${authorId}`;
      success = authorId + " deleted";
      break;
    case "c":
      table = "customers";
    const customerId = parseInt(await input({message: "Please enter Customer ID: "}));
      where = `WHERE customer_id=${customerId}`;
      success = customerId + " deleted";
      break;
    case "o":
      table = "orders";
    const orderId = parseInt(await input({message: "Please enter Order ID: "}));
      where = `WHERE order_id=${orderId}`;
      success = orderId + " deleted";
      break;
    case "b":
      table = "books";
    const bookId = parseInt(await input({message: "Please enter Book ID: "}));
      where = `WHERE id=${bookId}`;
      success = bookId + " deleted";
      break;
    case "exit":
      db.close();
      process.exit();
    default:
      console.log("sorry, I didn't Catch that");
      remove();
  }

  const query = `DELETE FROM ${table} ${where}`;

  const searchQuery = db.prepare(query);
  searchQuery.run((err) => {
    err ? console.error(err) : console.log(success);
  });

  searchQuery.finalize();
}

/**
 * Queries the database
 * @param {string} q Query that is sent to the database
 * @param {string} t the type of query 'success' or 'update'
 * @param {string} m message displayed in the callback after the query
 */
async function query(q, t = "", m = "") {
  const searchQuery = db.prepare(q);
	let err;

	return new Promise((resolve, reject) => {
		searchQuery.each(
			(e, row) => {
				err = e;
				for (let key in row) {
					console.log(`${key}: ${row[key]}`);
				}
			}
		), (e, rows) => {
			err = e;
			if (m && t === "success") console.log(m);
			if (m && t != "success") console.log(m);
			if (!rows && t != "update" && t != "success")
				console.log("\n\n**Can't find record match.**\n\n");

			if (!err) {
				resolve(() => {db.finalize();});
			} else {
				reject(() => {console.log(err)});
			}
		}
	});
}

/**
 *Generates a help string
 *@returns {string} to describe main()
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
