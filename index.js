const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("data/final.db");
const prompt = require("prompt-sync")({ sigint: true });

main();

/**
 *Main function that sorts prompts to direct to the correct query builder
 */
function main() {
  console.log("What would you like to do? (? to list commands 'exit' to quit)");
  let res = prompt();
  switch (res) {
    case "sort":
      sort();
      break;
    case "list":
      list();
      break;
    case "add":
      add();
      break;
    case "search":
      search();
      break;
    case "remove":
      remove();
      break;
    case "exit":
      db.close();
      process.exit();
    case "?":
      console.log(help());
			break;
    default:
      console.log("\nSorry, didn't recognize that one. ? for help\n\n");
  }
  main();
}


/**
 *Generates queries for the final project questions
 */
function sort() {
  console.log(`
Please enter one of the following
*********************************

b: Books with author names
s: Total sales 
t: Top 3 bestsellers
m: Customers with multiple orders
u: update pice of all books by =/- 10%
a: Average Price for authors books
n: Authors with no published books
i: Identiy customers with no orders
`);
  const res = prompt();

  let q;
  let type;
  let msg = "";

  switch (res) {
    case "b":
      q = `
SELECT b.title, a.author_name FROM books b
JOIN authors a ON b.author_id=a.author_id
`;
    case "s":
      q = `
SELECT b.title, o.quantity * b.price AS "Total Sales"
FROM books b
JOIN orders o ON b.id=o.book_id
`;
    case "t":
      q = `
SELECT b.genre AS "Bestselling Genres"
FROM books b
JOIN orders o ON b.id=o.order_id
ORDER BY o.quantity DESC
LIMIT 3
`;
    case "m":
      q = `
SELECT c.customer_id,
c.first_name || " " || c.last_name AS "Customer Name",
count(o.order_id) AS "Orders Placed"
FROM customers c
JOIN orders o ON c.customer_id=o.customer_id
GROUP BY c.customer_id
HAVING count(o.order_id)>1
`;
    case "a":
      q = `
SELECT a.author_id, a.author_name, avg(b.price) AS "Average Price"
FROM authors a
JOIN books b ON a.author_id=b.author_id
GROUP BY a.author_id
`;
    case "u":
      const genre = prompt("Which Genre would you like to update? ");
      const update = prompt("Increment (+) or decrement (-)? ");
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

    case "n":
      q = `
SELECT a.author_id, a.author_name
FROM authors a
LEFT JOIN books b ON a.author_id=b.author_id
WHERE b.author_id IS NULL
`;
    case "i":
      q = `
SELECT c.customer_id, c.first_name || " " || c.last_name As "Customer Name"
FROM customers c
LEFT JOIN orders o ON c.customer_id=o.customer_id
WHERE o.customer_id IS NULL
`;
  }
  query(q, type, msg);
}


/**
 *Generates simple search queries
 */
function search() {
  const db = new sqlite3.Database("data/final.db");
  console.log("What would you like to search for?\n");
  console.log("Enter Corresponding letter");
  console.log(
    "b: books, a, authors, o: orders, c:customers r: return to last menu\n",
  );
  const res = prompt();

  let query;

  switch (res) {
    case "b":
      const book = prompt("Enter the book title: ");
      query = `
SELECT b.id, b.title, a.author_name, b.genre, b.price
FROM books b
JOIN authors a ON b.author_id=a.author_id
WHERE b.title="${book}";
`;
      break;
    case "a":
      const author = prompt("Enter the author name: ");
      query = `
SELECT author_id, author_name, birth_date, nationality
FROM authors
WHERE author_name="${author}"
`;
      break;
    case "o":
      const order = parseInt(prompt("Enter the order ID: "));
      query = `
SELECT o.order_id,
c.first_name || " " || c.last_name AS "Customer Name",
b.title,
o.order_date,
o.quantity
FROM orders o
JOIN books b ON o.book_id=b.id
JOIN customers c ON o.customer_id=c.customer_id
WHERE o.order_id=${order}
`;
      break;
    case "c":
      const customer = prompt("Enter customer last name: ");
      query = `
SELECT customer_id,
first_name || " " || last_name AS "Customer Name",
email
FROM customers
WHERE last_name="${customer}"
`;
      break;
    case "exit":
      db.close();
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
    },
  );

  searchQuery.finalize();
}

/**
 * Lists tables in the database
 */
function list() {
  console.log("What would you like to list?\n");
  console.log("Enter Corresponding letter");
  console.log(
    "b: books, a, authors, o: orders, c:customers r: return to last menu\n",
  );
  let res = prompt();
  let q;

  switch (res) {
    case "b":
      console.log("Book list\n\n");
      q = `
SELECT b.id, b.title, b.genre, b.price, a.author_name as author
FROM books b
JOIN authors a ON b.author_id=a.author_id
`;
      break;
    case "a":
      console.log("Author List\n\n");
      q =
        "SELECT author_id, author_name, birth_date, nationality FROM authors";
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
JOIN books b ON o.book_id=b.id
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

	query(q)
}

/**
 * Generates queries to add rows to the database
 */
function add() {
  console.log("What table would you like to add to?\n");
  console.log("Enter Corresponding letter");
  console.log(
    "b: books, a, authors, o: orders, c:customers r: return to last menu\n",
  );

  const res = prompt();
  let q;
  let success;

  switch (res) {
    case "b":
      console.log(
        "Plese enter the book details. For author id, list authors\n",
      );

      const title = prompt("Title: ");
      const authorId = parseInt(prompt("Author ID:"));
      const genre = prompt("Genre");
      const price = parseInt(prompt("price"));
      success = title + " added";
      q = `
INSERT INTO books (title, author_id, genre, price)
VALUES ("${title}", ${authorId}, "${genre}", ${price})`;
      break;

    case "a":
      const name = prompt("Name: ");
      console.log("Enter Birth date in format YYYY-MM-DD");
      const birth = prompt("Birth Date: ");
      const nationality = prompt("Nationality: ");
      success = name + " added";
      q = `
INSERT INTO authors (author_name, birth_date, nationality)
VALUES ("${name}", "${birth}", "${nationality}")`;
      break;

    case "o":
      console.log(
        "In order to add order, please search book and customer for ID\n",
      );

      const customerId = parseInt(prompt("Customer ID: "));
      const bookId = parseInt(prompt("Book ID: "));
      const quantity = parseInt(prompt("Quantity: "));
      const date = new Date().toISOString();
      success = "Order Added";
      q = `
INSERT INTO orders (customer_id, book_id, order_date, quantity)
VALUES (${customerId}, ${bookId}, "${date}", ${quantity})`;
      break;

    case "c":
      const first = prompt("First Name: ");
      const last = prompt("Last Name: ");
      const email = prompt("Email: ");
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
  }

	query(q, t='success', success);
}

/**
 * Removes rows from the database
 */
function remove() {
  console.log(
    "CAUTION: Deleting from the database may cause data inconsistencies!",
  );
  console.log("What table would you like to remove from?\n");
  console.log("Enter Corresponding letter");
  console.log(
    "b: books, a, authors, o: orders, c:customers r: return to last menu\n",
  );

  const res = prompt();
  let success;
  let where;
  let table;

  switch (res) {
    case "a":
      table = "authors";
      const authorId = parseInt(prompt("Please enter Author ID: "));
      where = `WHERE author_id=${authorId}`;
      success = authorId + " deleted";
      break;
    case "c":
      table = "customers";
      const customerId = parseInt(prompt("Please enter Customer ID: "));
      where = `WHERE customer_id=${customerId}`;
      success = customerId + " deleted";
      break;
    case "o":
      table = "orders";
      const orderId = parseInt(prompt("Please enter Order ID: "));
      where = `WHERE order_id=${orderId}`;
      success = orderId + " deleted";
      break;
    case "b":
      table = "books";
      const bookId = parseInt(prompt("Please enter Book ID: "));
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
function query(q, t = "", m = "") {
  if (m && m != 'success') console.log(m);

  const searchQuery = db.prepare(q);

  searchQuery.each(
    (err, row) => {
      if (err) console.error(err);
      console.log(row);
    },
    (err, rows) => {
      if (err) console.error(err);
			if (t === 'success') console.log(m);
      if (!rows && t != 'update' && t != 'success')
        console.log("\n\n**Can't find record match.**\n\n");
    },
  );

  searchQuery.finalize();
}
db.close();

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
