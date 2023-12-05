import { input } from "@inquirer/prompts";
import select from '@inquirer/select';
import choices from './choices.js';

/**
 * Generates simple search queries
 * @async
 * @function search
 * @return {Object} An SQL Query and a message for a successful query.
 */
const search = async () => {
  let query;
	let msg = "\n***********************\n"

	const res = await select({
		message: "What would you like to search for?\n",
		choices: choices(),
	});


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
		case 'back':
			return;
    case "exit":
      process.exit();
    default:
      console.log("Sorry, didn't catch that");
      search();
  }
	console.log(msg);

	return {query: query, message: msg};
}


export default search;
