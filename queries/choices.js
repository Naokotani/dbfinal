/**
 *Main function that sorts prompts to direct to the correct query builder
 * @function choices
 * @return {Array} Choices for tables in that database.
 */

const choices = () => {
	return [
		{
			name: 'Books',
			value: 'b',
			description: 'List books',
		},
		{
			name: 'Authors',
			value: 'a',
			description: 'List authors',
		},
		{
			name: 'Orders',
			value: 'o',
			description: 'List orders',
		},
		{
			name: 'Customers',
			value: 'c',
			description: 'List customers',
		},
		{
			name: 'Back',
			value: 'back',
			description: 'Return to the last menu',
		},
		{
			name: 'Exit',
			value: 'exit',
			description: 'Exit the app',
		},
]};

export default choices;
