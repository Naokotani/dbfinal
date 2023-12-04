const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/final.db');

db.serialize(() => {
  db.run(`
CREATE TABLE books
(book_id INTEGER PRIMARY KEY,
title VARCHAR[100],
author_id INTEGER,
genre VARCHAR[50],
price DECIMAL)
`);

  db.run(`
CREATE TABLE authors
(author_id INTEGER PRIMARY KEY,
author_name VARCHAR[100],
birth_date DATE,
nationality VARCHAR[50])
`);

  db.run(`
CREATE TABLE customers
(customer_id INTEGER PRIMARY KEY,
first_name VARCHAR[50],
last_name VARCHAR[50],
email VARCHAR[100])
`);

 db.run(`
CREATE TABLE orders
(order_id INTEGER PRIMARY KEY,
customer_id INTEGER,
book_id INTEGER,
order_date DATE,
quantity INTEGER)
`);

	const booksQuery = db.prepare("INSERT INTO books (title, author_id, genre, price) VALUES (?, ?, ?, ?)")
	const books = [
		[ "The greatest book", 1, "True Crime", 10.99,],
		[ "One Flew over the Cuckoo's nest", 2, "True Crime", 12.99,],
		[ "Crime and Punishment", 3, "Fiction", 15.99,],
		[ "Of Human Bondage", 4, "Horror", 17.99,],
		[ "Heart of Darkness", 5, "Horror", 9.99,],
		[ "Siddartha", 6, "True Crime", 5.99,],
		[ "Candide", 7, "Classics", 20.99,],
		[ "The Idiot", 3, "Fiction", 15.99,],
	]

	for (const e of books) {
		booksQuery.run(e);
	}

	booksQuery.finalize();

	const authorsQuery = db.prepare("INSERT INTO authors (author_name, birth_date, nationality) VALUES (?, ?, ?)")
	const authors = [
		[ "Chris Hughes", "1984-03-12", "Canada"],
		[ "Ken Kesey", "1935-09-17", "USA"],
		[ "Fyodor Dostoevsky", "1821-11-11", "Russia"],
		[ "W. Somerset Maugham", "1874-01-25", "French"],
		[ "Joseph Conrad", "1857-12-03", "Great Britain"],
		[ "Herman Hesse", "1877-07-02", "German"],
		[ "Voltaire", "1694-11-12", "French"],
		[ "John Steinbeck", "1902-02-27", "American"],
	]

	for (const e of authors) {
		authorsQuery.run(e);
	}

	authorsQuery.finalize();

	const customersQuery = db.prepare("INSERT INTO customers (first_name, last_name, email) VALUES (?, ?, ?)")
	const customers = [
		[ "Chris", "Hughes", "thehughesdude@gmail.com"],
		[ "Ralph", "Johnston", "happy_camper@gmail.com"],
		[ "Ken", "Jackson", "loverbou34234@hotmail.com"],
		[ "Jane", "Quincy", "weaver@gmail.com"],
		[ "Michael", "Jordan", "mikey@nba.com"],
		[ "Joe", "Biden", "chief@whitehouse.gov"],
		[ "Jenny", "Hughes", "numberonewife@gmail.com"],
		[ "Barak", "Obama", "barak@whitehouse.gov"],
	]

	for (const e of customers) {
		customersQuery.run(e);
	}

	customersQuery.finalize();

	const ordersQuery = db.prepare("INSERT INTO orders (customer_id, book_id, order_date, quantity) VALUES (?, ?, ?, ?)")
	const orders = [
		[1, 2, new Date().toISOString(), 4],
		[2, 3, new Date().toISOString(), 1],
		[3, 5, new Date().toISOString(), 23],
		[4, 2, new Date().toISOString(), 2],
		[5, 7, new Date().toISOString(), 1],
		[6, 6, new Date().toISOString(), 1],
		[7, 4, new Date().toISOString(), 40],
	]

	for (const e of orders) {
		ordersQuery.run(e);
	}

	ordersQuery.finalize();

});

db.close();
