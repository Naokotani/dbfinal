# Table of Contents

1.  [Design Choices](#org525a37d)
    1.  [Usage](#org0c859ad)
    2.  [Setup](#org53d399b)
    3.  [Node](#org430ef89)
    4.  [Orders](#orgc5225b3)
2.  [Normalization](#org797188d)
    1.  [First Normal Form](#org3e9709b)
        1.  [The table has a primary key](#org9d4d0ca)
        2.  [Each column has a single unique value.](#orgdf80f39)
        3.  [The nonprimary key columns are functionally dependent on the primary key.](#org81d9068)
    2.  [Second Normal Form](#org811b222)
        1.  [The tables conform to first normal form](#orgf919707)
        2.  [Non-primary key attributes depend on all attributes of a composite key.](#org759f63c)
    3.  [Third Normal Form](#orgfb3b2e4)
        1.  [The tables conform to first and second normal form](#org48f1624)
        2.  [Each nonprimary key attribute in a row does not depend on the entry in another key column.](#org20a58b2)
3.  [Queries](#org053cdc7)
    1.  [Sort queries for final questions](#org7bfc2a9)




# Design Choices


<a id="org0c859ad"></a>

## Usage

Assuming the data directory is present and node/npm in installed `npm install` will install the sqlite package and then `node index.js` will run the main file to query the database. If the `data` directory or `final.db` files aren't present see setup


<a id="org53d399b"></a>

## Setup

I placed the table and database generation in a separate  standalone file. The file also generates the sample data required by the project.  I could improve the file by testing the see if the data directory is present and creating it if not and by giving the option to generate empty tables, but I feel that the current state is sufficient given the scope of the current project.


<a id="org430ef89"></a>

## Node

I decided to use node for this project because I had already been working with the SQLite package for node and it was relatively easy to implement. I created a single database file and populated it with the tables required for the project. I used a series of functions that contain switch statements to sort user inputs and generated a query string, which is then sent to a query function that queries the database.


<a id="orgc5225b3"></a>

## Orders

One issue I see this the orders table is that if a customer bought multiple books at the same time, then each book would need to be on a separate row with its own order<sub>id</sub> since primary keys must be unique. perhaps you could use the `date` and `customer_id` together as a composite key to query all the books bought in a single purchase. If you record the exact time of the purchase, and input the that exact time for all books bought in a single purchase, then it should be unique as, even if you had a large volume of orders where its possible orders could take place at the exact same time, one customer should not be able to make multiple purchases simultaneously.


<a id="org797188d"></a>

# Normalization


<a id="org3e9709b"></a>

## First Normal Form


<a id="org9d4d0ca"></a>

### The table has a primary key

Each table has a primary key that uniquely identifies each row.


<a id="orgdf80f39"></a>

### Each column has a single unique value.

The only possible exception to this is the date rows, but since date is a recognized data type in SQLite, there is no need to splint up month, day, year into separate columns.


<a id="org81d9068"></a>

### The nonprimary key columns are functionally dependent on the primary key.

All of the columns are directly related to the primary key. We know this because when we do joins, we can determine any column knowing only the primary key. 


<a id="org811b222"></a>

## Second Normal Form


<a id="orgf919707"></a>

### The tables conform to first normal form


<a id="org759f63c"></a>

### Non-primary key attributes depend on all attributes of a composite key.

None of the tables rely on a composite key. You could consider using a composite key in the orders table using  `customer_id` , `book_id and =date`,  as long as you are certain to be able to record the exact time of the purchase and not just the day of the purchase, but if multiple books were bought at the same time.


<a id="orgfb3b2e4"></a>

## Third Normal Form


<a id="org48f1624"></a>

### The tables conform to first and second normal form


<a id="org20a58b2"></a>

### Each nonprimary key attribute in a row does not depend on the entry in another key column.

This is the case. no columns can be determined from any other combination of columns without outside information.


<a id="org053cdc7"></a>

# Queries


<a id="org7bfc2a9"></a>

## Sort queries for final questions

This query is fairly straight forward. The book titles and author names are in different tables so you need to do a regular join of books on the authors table.

    SELECT b.title, a.author_name FROM books b
    JOIN authors a ON b.author_id=a.author_id

In order to get the total sales, multiply the combined quantities of a book id, by using the `SUM()` function, multiplying by price and then grouping by book id.

    SELECT b.title, SUM(o.quantity) * b.price AS "Total Sales"
    FROM books b
    JOIN orders o ON b.id=o.book_id
    GROUP BY  b.id

I join the book and order table and aggregate genre so that I can count the combined quantities based on the genre. I test to make sure the genre isn't been left blank as well.

    SELECT b.genre AS "Bestselling Genres"
    FROM books b
    JOIN orders o ON b.id=o.order_id
	WHERE b.genre <> ''
    GROUP BY b.genre
    ORDER BY COUNT(o.quantity) DESC
    LIMIT 3

I aggregate customer IDs to combine the number of order<sub>ids</sub> and if that is great than 1, we know they have placed multiple orders

    SELECT c.customer_id,
    c.first_name || " " || c.last_name AS "Customer Name",
    count(o.order_id) AS "Orders Placed"
    FROM customers c
    JOIN orders o ON c.customer_id=o.customer_id
    GROUP BY c.customer_id
    HAVING count(o.order_id)>1

I aggregate by author<sub>id</sub> so that I can get the average of the prices column

    SELECT a.author_id, a.author_name, avg(b.price) AS "Average Price"
    FROM authors a
    JOIN books b ON a.author_id=b.author_id
    GROUP BY a.author_id
