import select from '@inquirer/select';
import choices from './choices.js';

/**
 * Lists tables in the database
 * @async
 * @function list
 * @return {Object} An SQL Query and a message for a successful query.
 */
const list = async () => {
	const res = await select({
		message: "What would you like to list?\n",
		choices: choices(),
	});

  let q;
  switch (res) {
    case "b":
      console.log("Book list\n***********************\n");
      q = `
SELECT b.book_id, b.title, b.genre, b.price, a.author_name as author
FROM books b
JOIN authors a ON b.author_id=a.author_id
`;
      break;
    case "a":
      console.log("Authors list\n***********************\n");
      q = "SELECT author_id, author_name, birth_date, nationality FROM authors";
      break;
    case "o":
      console.log("Orders list\n***********************\n");
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
      console.log("Customers list\n***********************\n");
      q = `
SELECT first_name || " " || last_name AS Name,
email,
customer_id
FROM customers
`;
      break;
	case 'back':
			return;
    case "exit":
      db.close();
      process.exit();
  }

	return {query: q, message: '\n***********************\n'}
}

export default list;
