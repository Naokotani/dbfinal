import { input } from "@inquirer/prompts";
import select from '@inquirer/select';
import choices from './choices.js';

/**
 * Generates queries to add rows to the database
 *
 * @async
 * @function add
 * @return {Object} An SQL Query and a message for a successful query.
 */
const add = async () => {
	const res = await select({
		message: "What table would you like to add to?",
		choices: choices(),
	});
	
  let q;
  let success;

  switch (res) {
    case "b":
      console.log(
        "Plese enter the book details. For author id, list authors\n"
      );

      const title = await input({ message: "Title: " });
			const	authorId = parseFloat(await input({ message: "Author ID:" }));
      const genre = await input({ message: "Genre: " });
			const	price = parseFloat(await input({ message: "Price: " }));
			if (isNaN(price) || isNaN(authorId)) {
				console.log("Not a valid number");
				return;
			}

      success = `\n${title} added\n`;
      q = `
INSERT INTO books (title, author_id, genre, price)
VALUES ("${title}", ${authorId}, "${genre}", ${price})`;
      break;

    case "a":
      const name = await input({ message: "Name: " });
      console.log("Enter Birth date in format YYYY-MM-DD");
      const birth = await input({ message: "Birth Date: " });
      const nationality = await input({ message: "Nationality: " });
      success = `\n${name} added\n`;
      q = `
INSERT INTO authors (author_name, birth_date, nationality)
VALUES ("${name}", "${birth}", "${nationality}")`;
      break;

    case "o":
      console.log(
        "In order to add order, please search book and customer for ID\n"
      );

			const	customerId = parseFloat(await input({ message: "Customer ID: " }));
			const	bookId = parseFloat(await input({ message: "Book ID: " }));
			const	quantity = parseFloat(await input({ message: "Quantity: " }));
			if (isNaN(customerId) || isNaN(bookId) || isNaN(quantity)){
				console.log("Not a valid number.")
				return;
			}

      const date = new Date().toISOString();
      success = "\nOrder Added\n";
      q = `
INSERT INTO orders (customer_id, book_id, order_date, quantity)
VALUES (${customerId}, ${bookId}, "${date}", ${quantity})`;
      break;

    case "c":
    const first = await input({message: "First Name: "});
    const last = await input({message: "Last Name: "});
    const email = await input({message: "Email: "});
      success = `${first} ${last} Added\n\n`;
      q = `
INSERT INTO customers (first_name, last_name, email)
VALUES ("${first}", "${last}", "${email}")`;
      break;
		case 'back':
			return;
    case "exit":
      db.close();
      process.exit();
    default:
      console.log("Sorry, didn't catch that.");
  }

	return {query: q, message: success}
}

export default add;
