// Load expenses from localStorage
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();

// Navigation
function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    
    document.getElementById(viewName + 'View').classList.add('active');
    document.querySelector(`nav button[onclick="showView('${viewName}')"]`).classList.add('active');
    
    if (viewName === 'list') renderExpenses();
    if (viewName === 'summary') renderSummary();
}

// Add expense
function addExpense() {
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;

    if (!amount || !date) {
        alert('Please fill amount and date');
        return;
    }

    const expense = {
        id: Date.now(),
        amount: amount,
        category: category,
        date: date,
        description: description
    };

    expenses.unshift(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    // Clear form
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    document.getElementById('date').valueAsDate = new Date();

    alert('Expense added!');
    showView('list');
}

// Delete expense
function deleteExpense(id) {
    if (confirm('Delete this expense?')) {
        expenses = expenses.filter(e => e.id !== id);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderExpenses();
        renderSummary();
    }
}

// Render expenses list
function renderExpenses() {
    const listDiv = document.getElementById('expensesList');
    if (expenses.length === 0) {
        listDiv.innerHTML = '<p style="text-align:center;color:#999;">No expenses yet</p>';
        return;
    }

    listDiv.innerHTML = expenses.slice(0, 50).map(expense => `
        <div class="expense-item">
            <div>
                <strong>$${expense.amount.toFixed(2)}</strong> 
                <span class="category-badge">${expense.category}</span>
                <div style="font-size:0.8em;color:#666;">${expense.date} ${expense.description}</div>
            </div>
            <button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button>
        </div>
    `).join('');
}

// Render summary
function renderSummary() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter this month's expenses
    const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Calculate totals
    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    document.getElementById('totalCount').textContent = monthExpenses.length;

    // Group by category
    const byCategory = {};
    monthExpenses.forEach(e => {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const categoryDiv = document.getElementById('categorySummary');
    if (Object.keys(byCategory).length === 0) {
        categoryDiv.innerHTML = '<p style="text-align:center;color:#999;">No data this month</p>';
        return;
    }

    categoryDiv.innerHTML = Object.entries(byCategory).map(([cat, amt]) => `
        <div class="expense-item">
            <span>${cat}</span>
            <strong>$${amt.toFixed(2)}</strong>
        </div>
    `).join('');
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
    });
}