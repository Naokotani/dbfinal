import { input } from "@inquirer/prompts";

/**
 * Generates queries to add rows to the database
 */
const add = async () => {
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

      const title = await input({ message: "Title: " });
      const authorId = parseInt(await input({ message: "Author ID:" }));
      const genre = await input({ message: "Genre: " });
      const price = parseInt(await input({ message: "Price: " }));
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

      const customerId = parseInt(await input({ message: "Customer ID: " }));
      const bookId = parseInt(await input({ message: "Book ID: " }));
      const quantity = parseInt(await input({ message: "Quantity: " }));
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

    case "exit":
      db.close();
      process.exit();
    default:
      console.log("Sorry, didn't catch that.");
  }

	return {query: q, message: success}
}

export default add;
