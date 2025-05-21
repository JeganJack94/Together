import React from 'react';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  trip: string;
  members: number;
  userId: string;
  icon?: string;
  description?: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
  paidBy?: string;
}

interface ViewExpensesModalProps {
  expenses: Expense[];
  onClose: () => void;
  formatExpenseDate: (dateString: string) => string;
  getColorForCategory: (categoryName: string) => string;
  tripName: string;
  onDeleteExpense: (expenseId: string) => void;
}

const ViewExpensesModal: React.FC<ViewExpensesModalProps> = ({
  expenses,
  onClose,
  formatExpenseDate,
  getColorForCategory,
  tripName,
  onDeleteExpense
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl mx-4 animate-fade-in-down">
        <div className="sticky top-0 bg-white dark:bg-gray-800 rounded-t-xl p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
          >
            <i className="fas fa-arrow-left text-gray-600 dark:text-gray-300"></i>
          </button>
          <h2 className="text-xl font-semibold dark:text-white flex-1">
            All Expenses
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tripName}</p>
        </div>
        
        <div className="p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {expenses.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No expenses found.</p>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 mb-3">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full ${getColorForCategory(expense.category)} flex items-center justify-center mr-3 flex-shrink-0`}>
                    <i className={`fas ${expense.icon || 'fa-ellipsis-h'} text-white`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm dark:text-white truncate">{expense.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {expense.category} • {formatExpenseDate(expense.date)}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-semibold dark:text-white">₹{Number(expense.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{expense.paidBy || 'You'}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteExpense(expense.id);
                      }} 
                      className="mt-2 text-red-500 hover:text-red-700 transition-colors text-sm"
                    >
                      <i className="fas fa-trash-alt mr-1"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewExpensesModal;