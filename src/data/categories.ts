// Expense categories for the app

// Expense categories with their colors and icons
export const expenseCategories = [
  { name: 'Food', color: 'bg-orange-500', icon: 'fa-utensils' },
  { name: 'Transport', color: 'bg-blue-500', icon: 'fa-car' },
  { name: 'Accommodation', color: 'bg-purple-500', icon: 'fa-hotel' },
  { name: 'Shopping', color: 'bg-pink-500', icon: 'fa-shopping-bag' },
  { name: 'Entertainment', color: 'bg-indigo-500', icon: 'fa-ticket-alt' },
  { name: 'Groceries', color: 'bg-green-500', icon: 'fa-shopping-cart' },
  { name: 'Health', color: 'bg-red-500', icon: 'fa-medkit' },
  { name: 'Sightseeing', color: 'bg-amber-500', icon: 'fa-binoculars' },
  { name: 'Souvenirs', color: 'bg-teal-500', icon: 'fa-gift' },
  { name: 'Other', color: 'bg-gray-500', icon: 'fa-ellipsis-h' }
];

// Function to get empty budget object for all categories
export const getEmptyCategoryBudgets = () => {
  const budgets: {[key: string]: string} = {};
  expenseCategories.forEach(category => {
    budgets[category.name] = '';
  });
  return budgets;
};
