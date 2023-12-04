import { input } from "@inquirer/prompts";
import select from '@inquirer/select';

/**
 *Generates queries for the final project questions
 */
const sort = async () => {
  let q;
	let msg = "\n***********************\n"

  const res = await select({
    message: "Select a package manager",
    choices: [
      {
        name: "Books with authors",
        value: "b",
        description: "Books with author names",
      },
      {
        name: "Total sales",
        value: "s",
        description: "Total sales ",
      },
      {
        name: "Top 3 bestsellers",
        value: "t",
        description: "Add a new row to a table",
      },
      {
        name: "Multiple Orders",
        value: "m",
        description: "Customers with multiple orders",
      },
      {
        name: "Updates prices",
        value: "u",
        description: "Update price of all books by =/- 10%",
      },
      {
        name: "Average price",
        value: "a",
        description: "Average Price for author's books",
      },
      {
        name: "No books",
        value: "n",
        description: "Authors with no published books",
      },
      {
        name: "No orders",
        value: "i",
        description: "Identiy customers with no orders",
      },
      {
        name: "Back",
        value: "back",
        description: "Return to the main menu",
      },
      {
        name: "Exit",
        value: "exit",
        description: "Exit the app",
      },
    ],
  });

	console.log(msg);

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
		case 'r':
			return;
    case "exit":
      db.close();
      process.exit();
  }

  return { query: q, message: msg };
};

export default sort;
