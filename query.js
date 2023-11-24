const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/final.db');
const prompt = require('prompt-sync')({sigint: true});

main()
function main () {
	console.log('What would you like to do? (? to list commands \'exit\' to quit)')
	let res = prompt()
	nextLine = false;
	switch (res) {
	case "?":
		help();
		break;
	case "list":
		list();
		break;
	case "add":
		add();
		break;
	case "remove":
		remove();
		break;
	case "exit":
		process.exit();
	default:
		console.log("\nSorry, didn't recognize that one. ? for help\n\n");
	}
}

function help(){
	console.log(`
?: For more options
search: search for specific entries
list: Lists database tables
add: Add entries to database
remove: Remove entries from database
exit: Use anywhere to exit app
`);
}
function search(){

}

function list(){
	console.log("What would you like to list?\n");
	console.log("Enter Corresponding letter");
	console.log("b: books, a, authors, o: orders, c:customers r: return to last menu\n");
	let res = prompt();
	let query;

	switch(res) {
	case 'b':
		console.log("Book list\n\n");
		query = `
SELECT b.id, b.title, b.genre, b.price, a.author_name as author
FROM books b
JOIN authors a ON b.author_id=a.author_id
`;
		break;
	case 'a':
		console.log("Author List\n\n");
		query = 'SELECT author_id, author_name, birth_date, nationality FROM authors';
		break;
	case 'o':
		console.log("Orders List\n\n");
		query = `
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
	case 'c':
		console.log("customers List\n\n");
		query = `
SELECT first_name || " " || last_name AS Name,
email,
customer_id
FROM customers
`;
		break;
	case 'r':
		return;
	case 'exit':
		process.exit();
	default:
		console.log("Sorry, didn't catch that");
		list();
}
		 

	db.serialize(() => {
		db.each(query, (err, row) => {
			if (err) console.error(err)
			console.log(row);
			nextLine = true;
		});
	});

	db.close();
}

function add(){
	console.log("What table would you like to add to?\n");
	console.log("Enter Corresponding letter");
	console.log("b: books, a, authors, o: orders, c:customers r: return to last menu\n");

	const res = prompt();
	let query;
	let success;
	switch(res) {

	case 'b':
		console.log("Plese enter the book details. For author id, list authors\n")

		const title = prompt("Title: ");
		const authorId = parseInt(prompt("Author ID:"));
		const genre = prompt("Genre");
		const price = parseInt(prompt("price"));
		success = title + " added";
		query = `
INSERT INTO books (title, author_id, genre, price)
VALUES ("${title}", ${authorId}, "${genre}", ${price})`
		break;

	case 'a':
		const name = prompt("Name: ");
		console.log("Enter Birth date in format YYYY-MM-DD");
		const birth = prompt("Birth Date: ");
		const nationality = prompt("Nationality: ");
		success = name + " added";
		query = `
INSERT INTO authors (author_name, birth_date, nationality)
VALUES ("${name}", "${birth}", "${nationality}")`
		break;

	case 'o':
		console.log("In order to add order, please search book and customer for ID\n");

		const customerId = parseInt(prompt("Customer ID: "));
		const bookId = parseInt(prompt("Book ID: "));
		const quantity = parseInt(prompt("Quantity: "));
		const date = new Date().toISOString();
		success = "Order Added";
		query = `
INSERT INTO orders (customer_id, book_id, order_date, quantity)
VALUES (${customerId}, ${bookId}, "${date}", ${quantity})`;
		break;


	case 'c':
		const first = prompt("First Name: ");
		const last = prompt("Last Name: ");
		const email = prompt("Email: ");
		success = first + " " + last + " Added";
		query = `
INSERT INTO customers (first_name, last_name, email)
VALUES ("${first}", "${last}", "${email}")`
		break;

	case 'r':
		return;
	case 'exit':
		process.exit();
	default:
		console.log("Sorry, didn't catch that.")
	}

	db.serialize(() => {
		db.run(query, (err) => {
			err?console.error(err):console.log(success);
		});
	});

	return db.close();
}

function remove(){

	console.log("CAUTION: Deleting from the database may cause data inconsistencies!");
	console.log("What table would you like to remove from?\n");
	console.log("Enter Corresponding letter");
	console.log("b: books, a, authors, o: orders, c:customers r: return to last menu\n");
	
	const res = prompt();
	let success;
	let where;
	let table;

	switch(res) {
	case 'a':
		table = "authors"
		const authorId = parseInt(prompt("Please enter Author ID: "));
		where = `WHERE author_id=${authorId}`
		success = authorId + " deleted"
		break;
	case 'c':
		table = "customers"
		const customerId = parseInt(prompt("Please enter Customer ID: "));
		where = `WHERE customer_id=${customerId}`
		success = customerId + " deleted"
		break;
	case 'o':
		table = "orders"
		const orderId = parseInt(prompt("Please enter Order ID: "));
		where = `WHERE order_id=${orderId}`
		success = orderId + " deleted"
		break;
	case 'b':
		table = "books"
		const bookId = parseInt(prompt("Please enter Book ID: "));
		where = `WHERE id=${bookId}`
		success = bookId + " deleted"
		break;
	case 'r':
		return;
	case 'exit':
		process.exit();
	default:
		console.log("sorry, I didn't Catch that");
		remove();
	}

	const query = `DELETE FROM ${table} ${where}`

	db.serialize(() => {
		db.run(query, (err) => {
			err?console.error(err):console.log(success);
		});
	});

	return db.close();

}
