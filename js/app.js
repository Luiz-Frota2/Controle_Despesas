// Navegação entre páginas
document.addEventListener('DOMContentLoaded', function() {
    // Carrega a página inicial
    loadPage('home');
    
    // Configura os listeners dos botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            loadPage(page);
            
            // Atualiza o botão ativo
            document.querySelectorAll('.nav-btn').forEach(b => {
                b.classList.remove('active');
                b.querySelector('i').classList.remove('text-primary');
            });
            this.classList.add('active');
            this.querySelector('i').classList.add('text-primary');
        });
    });
});

// Carrega o conteúdo da página
function loadPage(page) {
    const mainContent = document.getElementById('mainContent');
    
    switch(page) {
        case 'home':
            loadHomePage();
            break;
        case 'add':
            loadAddExpensePage();
            break;
        case 'view':
            loadViewExpensesPage();
            break;
        case 'settings':
            loadSettingsPage();
            break;
        default:
            loadHomePage();
    }
}

function loadHomePage() {
    const income = getMonthlyIncome();
    const currentExpenses = getCurrentMonthExpenses();
    const budget = getCurrentMonthBudget();
    const status = getFinancialStatus();
    const recentExpenses = getRecentExpenses();
    
    let statusText, statusClass;
    switch(status) {
        case 'danger':
            statusText = 'Cuidado! Seus gastos estão muito altos';
            statusClass = 'status-danger';
            break;
        case 'warning':
            statusText = 'Atenção! Seus gastos estão próximos do limite';
            statusClass = 'status-warning';
            break;
        case 'good':
            statusText = 'Ótimo! Suas finanças estão sob controle';
            statusClass = 'status-good';
            break;
        default:
            statusText = 'Configure sua renda mensal nas configurações';
            statusClass = 'status-warning';
    }
    
    const html = `
        <div class="row mb-3">
            <div class="col-md-12">
                <div class="financial-card card ${statusClass} p-3">
                    <h5 class="card-title"><i class="fas fa-info-circle me-2"></i>Status Financeiro</h5>
                    <p class="card-text">${statusText}</p>
                    ${income > 0 ? `
                        <div class="progress mt-2">
                            <div class="progress-bar" role="progressbar" 
                                style="width: ${(currentExpenses / income * 100)}%" 
                                aria-valuenow="${(currentExpenses / income * 100)}" 
                                aria-valuemin="0" 
                                aria-valuemax="100">
                                ${(currentExpenses / income * 100).toFixed(1)}%
                            </div>
                        </div>
                        <small class="text-muted">Gastos: R$ ${currentExpenses.toFixed(2)} / Renda: R$ ${income.toFixed(2)}</small>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <div class="row mb-3">
            <div class="col-md-4 mb-3">
                <div class="financial-card card text-center p-3">
                    <div class="card-icon text-primary">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <h5 class="card-title">Renda Mensal</h5>
                    <p class="card-text fs-4">R$ ${income.toFixed(2)}</p>
                </div>
            </div>
            
            <div class="col-md-4 mb-3">
                <div class="financial-card card text-center p-3">
                    <div class="card-icon text-success">
                        <i class="fas fa-piggy-bank"></i>
                    </div>
                    <h5 class="card-title">Orçamento</h5>
                    <p class="card-text fs-4">R$ ${budget.toFixed(2)}</p>
                </div>
            </div>
            
            <div class="col-md-4 mb-3">
                <div class="financial-card card text-center p-3">
                    <div class="card-icon text-danger">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h5 class="card-title">Gastos</h5>
                    <p class="card-text fs-4">R$ ${currentExpenses.toFixed(2)}</p>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div class="card financial-card">
                    <div class="card-header">
                        <h5 class="card-title"><i class="fas fa-clock me-2"></i>Últimas Despesas</h5>
                    </div>
                    <div class="card-body">
                        ${recentExpenses.length > 0 ? `
                            <ul class="expense-list">
                                ${recentExpenses.map(exp => `
                                    <li class="expense-item">
                                        <div class="expense-category">
                                            <i class="fas ${getCategoryIcon(exp.categoryId)}"></i>
                                            ${getCategoryName(exp.categoryId)}
                                            ${exp.description ? `<small class="text-muted ms-2">${exp.description}</small>` : ''}
                                        </div>
                                        <span class="expense-amount text-danger">
                                            R$ ${exp.amount.toFixed(2)}
                                        </span>
                                    </li>
                                `).join('')}
                            </ul>
                        ` : `
                            <div class="text-center py-3">
                                <i class="fas fa-receipt fa-3x text-muted mb-2"></i>
                                <p class="text-muted">Nenhuma despesa registrada ainda</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = html;
}

function loadAddExpensePage() {
    const categories = getActiveCategories();
    const today = new Date().toISOString().split('T')[0];
    
    const html = `
        <div class="row justify-content-center">
            <div class="col-lg-6">
                <div class="card financial-card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title"><i class="fas fa-plus-circle me-2"></i>Adicionar Despesa</h5>
                    </div>
                    <div class="card-body">
                        <form id="addExpenseForm">
                            <div class="mb-3">
                                <label for="expenseCategory" class="form-label">Categoria</label>
                                <select class="form-select" id="expenseCategory" required>
                                    ${categories.map(cat => `
                                        <option value="${cat.id}">
                                            <i class="fas ${cat.icon}"></i> ${cat.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label for="expenseAmount" class="form-label">Valor (R$)</label>
                                <input type="number" class="form-control" id="expenseAmount" 
                                    step="0.01" min="0.01" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="expenseDate" class="form-label">Data</label>
                                <input type="date" class="form-control" id="expenseDate" 
                                    value="${today}" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="expenseDescription" class="form-label">Descrição (opcional)</label>
                                <input type="text" class="form-control" id="expenseDescription">
                            </div>
                            
                            <div class="mb-3">
                                <label for="expenseRecurrence" class="form-label">Recorrência</label>
                                <select class="form-select" id="expenseRecurrence">
                                    <option value="once">Única</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensal</option>
                                </select>
                            </div>
                            
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fas fa-save me-2"></i>Salvar Despesa
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = html;
    
    // Configura o formulário
    document.getElementById('addExpenseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const expense = {
            id: Date.now().toString(),
            categoryId: document.getElementById('expenseCategory').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            date: document.getElementById('expenseDate').value,
            description: document.getElementById('expenseDescription').value,
            recurrence: document.getElementById('expenseRecurrence').value
        };
        
        addExpense(expense);
        
        // Mostra feedback visual
        const submitBtn = document.querySelector('#addExpenseForm button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Despesa Salva!';
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-success');
        
        // Reseta após 2 segundos
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Salvar Despesa';
            submitBtn.classList.remove('btn-success');
            submitBtn.classList.add('btn-primary');
            loadPage('home');
        }, 2000);
    });
}

function loadViewExpensesPage() {
    const expensesByCategory = getExpensesByCategory();
    const expensesTrend = getExpensesTrend();
    const monthlyIncome = getMonthlyIncome();
    const currentExpenses = getCurrentMonthExpenses();
    const budget = getCurrentMonthBudget();
    
    const html = `
        <div class="row mb-3">
            <div class="col-md-12">
                <div class="card financial-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title m-0"><i class="fas fa-chart-line me-2"></i>Resumo Financeiro</h5>
                        <select id="viewPeriod" class="form-select form-select-sm" style="width: auto;">
                            <option value="week">Última Semana</option>
                            <option value="month" selected>Último Mês</option>
                            <option value="year">Último Ano</option>
                            <option value="all">Todo Período</option>
                        </select>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="chart-container">
                                    <canvas id="categoryChart"></canvas>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="chart-container">
                                    <canvas id="trendChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mb-3">
            <div class="col-md-6">
                <div class="card financial-card">
                    <div class="card-header">
                        <h5 class="card-title"><i class="fas fa-percentage me-2"></i>Orçamento vs Gastos</h5>
                    </div>
                    <div class="card-body">
                        ${monthlyIncome > 0 ? `
                            <div class="mb-3">
                                <h6>Renda Mensal: R$ ${monthlyIncome.toFixed(2)}</h6>
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar bg-success" role="progressbar" 
                                        style="width: ${(budget / monthlyIncome * 100)}%">
                                        Orçamento: ${(budget / monthlyIncome * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <h6>Gastos Mensais: R$ ${currentExpenses.toFixed(2)}</h6>
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar bg-danger" role="progressbar" 
                                        style="width: ${(currentExpenses / monthlyIncome * 100)}%">
                                        Gastos: ${(currentExpenses / monthlyIncome * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <h6>Saldo Disponível: R$ ${(monthlyIncome - currentExpenses).toFixed(2)}</h6>
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar bg-primary" role="progressbar" 
                                        style="width: ${((monthlyIncome - currentExpenses) / monthlyIncome * 100)}%">
                                        Saldo: ${((monthlyIncome - currentExpenses) / monthlyIncome * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Configure sua renda mensal nas configurações para ver esta análise.
                            </div>
                        `}
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card financial-card">
                    <div class="card-header">
                        <h5 class="card-title"><i class="fas fa-list-alt me-2"></i>Gastos por Categoria</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Categoria</th>
                                        <th>Gasto</th>
                                        <th>Orçamento</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${expensesByCategory.map(cat => `
                                        <tr>
                                            <td>
                                                <i class="fas ${cat.icon} me-2"></i>
                                                ${cat.category}
                                            </td>
                                            <td>R$ ${cat.total.toFixed(2)}</td>
                                            <td>R$ ${cat.budget.toFixed(2)}</td>
                                            <td>
                                                <div class="progress" style="height: 20px;">
                                                    <div class="progress-bar ${cat.percentage > 100 ? 'bg-danger' : cat.percentage > 80 ? 'bg-warning' : 'bg-success'}" 
                                                         role="progressbar" 
                                                         style="width: ${cat.percentage > 100 ? 100 : cat.percentage}%">
                                                        ${cat.percentage.toFixed(1)}%
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = html;
    
    // Configura o listener para mudança de período
    document.getElementById('viewPeriod').addEventListener('change', function() {
        updateCharts(this.value);
    });
    
    // Inicializa os gráficos
    updateCharts('month');
}

function updateCharts(period) {
    const expensesByCategory = getExpensesByCategory(period);
    const expensesTrend = getExpensesTrend();
    
    // Atualiza o gráfico de categorias
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    
    if (window.categoryChart) {
        window.categoryChart.destroy();
    }
    
    window.categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: expensesByCategory.map(c => c.category),
            datasets: [{
                data: expensesByCategory.map(c => c.total),
                backgroundColor: [
                    '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                    '#5a5c69', '#858796', '#f8f9fc', '#5a5c69', '#e74a3b'
                ],
                hoverBorderColor: "rgba(234, 236, 244, 1)",
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Gastos por Categoria'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Atualiza o gráfico de tendência
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    
    if (window.trendChart) {
        window.trendChart.destroy();
    }
    
    window.trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: expensesTrend.map(d => d.month),
            datasets: [{
                label: 'Gastos Mensais',
                data: expensesTrend.map(d => d.total),
                backgroundColor: 'rgba(78, 115, 223, 0.05)',
                borderColor: 'rgba(78, 115, 223, 1)',
                pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointBorderColor: '#fff',
                pointHoverRadius: 3,
                pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                pointHitRadius: 10,
                pointBorderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Tendência de Gastos (últimos 6 meses)'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Gastos: R$ ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value;
                        }
                    }
                }
            }
        }
    });
}

function loadSettingsPage() {
    const currentTheme = localStorage.getItem('theme') || 'light-theme';
    const categories = getCategories();
    const monthlyIncome = getMonthlyIncome();
    
    const html = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="card financial-card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title"><i class="fas fa-cog me-2"></i>Configurações Gerais</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-4">
                            <h6><i class="fas fa-palette me-2"></i>Tema da Aplicação</h6>
                            <div class="d-flex flex-wrap gap-2 mt-2">
                                <button data-theme="light-theme" class="btn ${currentTheme === 'light-theme' ? 'btn-primary' : 'btn-outline-primary'}">
                                    <i class="fas fa-sun me-1"></i> Claro
                                </button>
                                <button data-theme="dark-theme" class="btn ${currentTheme === 'dark-theme' ? 'btn-primary' : 'btn-outline-primary'}">
                                    <i class="fas fa-moon me-1"></i> Escuro
                                </button>
                                <button data-theme="green-theme" class="btn ${currentTheme === 'green-theme' ? 'btn-primary' : 'btn-outline-primary'}">
                                    <i class="fas fa-leaf me-1"></i> Verde
                                </button>
                                <button data-theme="blue-theme" class="btn ${currentTheme === 'blue-theme' ? 'btn-primary' : 'btn-outline-primary'}">
                                    <i class="fas fa-tint me-1"></i> Azul
                                </button>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <h6><i class="fas fa-money-bill-wave me-2"></i>Renda Mensal</h6>
                            <div class="input-group mt-2">
                                <span class="input-group-text">R$</span>
                                <input type="number" id="monthlyIncome" class="form-control" 
                                    value="${monthlyIncome}" step="0.01" min="0">
                                <button id="saveIncomeBtn" class="btn btn-primary">
                                    <i class="fas fa-save"></i>
                                </button>
                            </div>
                            <small class="text-muted">Informe sua renda mensal para cálculos precisos</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 mb-3">
                <div class="card financial-card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title"><i class="fas fa-tags me-2"></i>Categorias de Despesas</h5>
                    </div>
                    <div class="card-body">
                        <div id="categoriesList" class="mb-3">
                            ${categories.map(cat => `
                                <div class="category-item mb-2 p-2 border rounded d-flex justify-content-between align-items-center">
                                    <div class="d-flex align-items-center">
                                        <i class="fas ${cat.icon} me-2"></i>
                                        <span>${cat.name}</span>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <input type="number" class="form-control form-control-sm me-2 budget-input" 
                                            value="${cat.budget}" data-category-id="${cat.id}" 
                                            style="width: 80px;" placeholder="Orçamento">
                                        <label class="switch me-2">
                                            <input type="checkbox" data-category-id="${cat.id}" ${cat.active ? 'checked' : ''}>
                                            <span class="slider round"></span>
                                        </label>
                                        <button class="btn btn-sm btn-outline-danger delete-category" data-category-id="${cat.id}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="border-top pt-3">
                            <h6><i class="fas fa-plus-circle me-2"></i>Adicionar Nova Categoria</h6>
                            <div class="row g-2">
                                <div class="col-md-5">
                                    <input type="text" id="newCategoryName" class="form-control" placeholder="Nome">
                                </div>
                                <div class="col-md-4">
                                    <select id="newCategoryIcon" class="form-select">
                                        <option value="fa-home">Casa</option>
                                        <option value="fa-utensils">Alimentação</option>
                                        <option value="fa-car">Transporte</option>
                                        <option value="fa-heartbeat">Saúde</option>
                                        <option value="fa-gamepad">Lazer</option>
                                        <option value="fa-shopping-cart">Compras</option>
                                        <option value="fa-graduation-cap">Educação</option>
                                        <option value="fa-tshirt">Vestuário</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <button id="addCategoryBtn" class="btn btn-primary w-100">
                                        <i class="fas fa-plus me-1"></i> Adicionar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = html;
    
    // Configura os botões de tema
    document.querySelectorAll('[data-theme]').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            setTheme(theme);
            
            // Atualiza os botões
            document.querySelectorAll('[data-theme]').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-primary');
            });
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary');
        });
    });
    
    // Configura o botão de salvar renda
    document.getElementById('saveIncomeBtn').addEventListener('click', function() {
        const income = parseFloat(document.getElementById('monthlyIncome').value) || 0;
        setMonthlyIncome(income);
        
        // Feedback visual
        const btn = this;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-success');
        
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-save"></i>';
            btn.classList.remove('btn-success');
            btn.classList.add('btn-primary');
        }, 2000);
    });
    
    // Configura os toggles de categoria
    document.querySelectorAll('#categoriesList input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const categoryId = this.getAttribute('data-category-id');
            const active = this.checked;
            toggleCategoryActive(categoryId, active);
        });
    });
    
    // Configura os inputs de orçamento
    document.querySelectorAll('.budget-input').forEach(input => {
        input.addEventListener('change', function() {
            const categoryId = this.getAttribute('data-category-id');
            const budget = parseFloat(this.value) || 0;
            updateCategoryBudget(categoryId, budget);
        });
    });
    
    // Configura os botões de deletar categoria
    document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-category-id');
            if (confirm('Tem certeza que deseja excluir esta categoria? As despesas relacionadas não serão removidas.')) {
                categories = categories.filter(c => c.id !== categoryId);
                saveData();
                loadSettingsPage();
            }
        });
    });
    
    // Configura o botão de adicionar categoria
    document.getElementById('addCategoryBtn').addEventListener('click', function() {
        const name = document.getElementById('newCategoryName').value.trim();
        const icon = document.getElementById('newCategoryIcon').value;
        
        if (name) {
            addCategory(name, icon);
            document.getElementById('newCategoryName').value = '';
            loadSettingsPage();
        } else {
            alert('Por favor, informe um nome para a categoria');
        }
    });
}
