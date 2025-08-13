// Dados iniciais
let categories = [
    { id: '1', name: 'Moradia', icon: 'fa-home', active: true, budget: 0 },
    { id: '2', name: 'Alimentação', icon: 'fa-utensils', active: true, budget: 0 },
    { id: '3', name: 'Transporte', icon: 'fa-car', active: true, budget: 0 },
    { id: '4', name: 'Lazer', icon: 'fa-gamepad', active: true, budget: 0 },
    { id: '5', name: 'Saúde', icon: 'fa-heartbeat', active: true, budget: 0 }
];

let expenses = [];
let monthlyIncome = 0;

// Carrega dados do localStorage
function loadData() {
    const savedCategories = localStorage.getItem('categories');
    const savedExpenses = localStorage.getItem('expenses');
    const savedIncome = localStorage.getItem('monthlyIncome');
    
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    }
    
    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
    }
    
    if (savedIncome) {
        monthlyIncome = parseFloat(savedIncome);
    }
}

// Salva dados no localStorage
function saveData() {
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('monthlyIncome', monthlyIncome.toString());
}

// Inicializa os dados
loadData();

// Funções para renda mensal
function getMonthlyIncome() {
    return monthlyIncome;
}

function setMonthlyIncome(income) {
    monthlyIncome = parseFloat(income);
    saveData();
}

// Funções para categorias
function getCategories() {
    return categories;
}

function getActiveCategories() {
    return categories.filter(c => c.active);
}

function getCategoryName(id) {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Desconhecida';
}

function getCategoryIcon(id) {
    const category = categories.find(c => c.id === id);
    return category ? category.icon : 'fa-question';
}

function getCategoryBudget(id) {
    const category = categories.find(c => c.id === id);
    return category ? category.budget : 0;
}

function toggleCategoryActive(id, active) {
    const category = categories.find(c => c.id === id);
    if (category) {
        category.active = active;
        saveData();
    }
}

function addCategory(name, icon = 'fa-tag', budget = 0) {
    const newCategory = {
        id: Date.now().toString(),
        name: name,
        icon: icon,
        active: true,
        budget: parseFloat(budget)
    };
    
    categories.push(newCategory);
    saveData();
}

function updateCategoryBudget(id, budget) {
    const category = categories.find(c => c.id === id);
    if (category) {
        category.budget = parseFloat(budget);
        saveData();
    }
}

// Funções para despesas
function getExpenses() {
    return expenses;
}

function addExpense(expense) {
    expenses.push(expense);
    saveData();
}

function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveData();
}

function getExpensesByCategory(period = 'month') {
    const now = new Date();
    let startDate;
    
    switch(period) {
        case 'week':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            break;
        case 'year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        case 'all':
            startDate = new Date(0); // Data mínima
            break;
        default: // 'month'
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    
    return categories
        .filter(c => c.active)
        .map(category => {
            const categoryExpenses = expenses.filter(e => 
                e.categoryId === category.id && new Date(e.date) >= startDate
            );
            
            const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
            const budget = category.budget || 0;
            const percentage = budget > 0 ? (total / budget * 100) : 0;
            
            return {
                id: category.id,
                category: category.name,
                icon: category.icon,
                total: total,
                budget: budget,
                percentage: percentage,
                expenses: categoryExpenses
            };
        });
}

function getExpensesTrend() {
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const total = expenses
            .filter(e => {
                const eDate = new Date(e.date);
                return eDate.getMonth() === month && eDate.getFullYear() === year;
            })
            .reduce((sum, e) => sum + e.amount, 0);
            
        monthlyData.push({
            month: `${date.toLocaleString('default', { month: 'short' })}/${year.toString().slice(2)}`,
            total: total
        });
    }
    
    return monthlyData;
}

function getCurrentMonthExpenses() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return expenses
        .filter(e => {
            const eDate = new Date(e.date);
            return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);
}

function getCurrentMonthBudget() {
    return categories
        .filter(c => c.active)
        .reduce((sum, c) => sum + (c.budget || 0), 0);
}

function getFinancialStatus() {
    const currentExpenses = getCurrentMonthExpenses();
    const budget = getCurrentMonthBudget();
    const income = getMonthlyIncome();
    
    if (income <= 0) return 'unknown';
    
    const expensePercentage = (currentExpenses / income) * 100;
    
    if (expensePercentage > 90) return 'danger';
    if (expensePercentage > 70) return 'warning';
    return 'good';
}

function getRecentExpenses(limit = 5) {
    return [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
}

// Exporta funções para uso global
window.getCategories = getCategories;
window.getActiveCategories = getActiveCategories;
window.getCategoryName = getCategoryName;
window.getCategoryIcon = getCategoryIcon;
window.getCategoryBudget = getCategoryBudget;
window.toggleCategoryActive = toggleCategoryActive;
window.addCategory = addCategory;
window.updateCategoryBudget = updateCategoryBudget;
window.getExpenses = getExpenses;
window.addExpense = addExpense;
window.deleteExpense = deleteExpense;
window.getExpensesByCategory = getExpensesByCategory;
window.getExpensesTrend = getExpensesTrend;
window.getMonthlyIncome = getMonthlyIncome;
window.setMonthlyIncome = setMonthlyIncome;
window.getCurrentMonthExpenses = getCurrentMonthExpenses;
window.getCurrentMonthBudget = getCurrentMonthBudget;
window.getFinancialStatus = getFinancialStatus;
window.getRecentExpenses = getRecentExpenses;