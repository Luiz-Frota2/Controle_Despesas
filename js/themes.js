// Aplica o tema salvo ou o tema padrão
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = savedTheme;
    
    // Atualiza o ícone do botão de tema
    const themeIcon = document.getElementById('themeToggle');
    if (themeIcon) {
        themeIcon.innerHTML = savedTheme === 'dark-theme' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// Alterna entre tema claro e escuro
function toggleTheme() {
    const currentTheme = document.body.className;
    const newTheme = currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    setTheme(newTheme);
}

// Define um tema específico
function setTheme(themeName) {
    document.body.className = themeName;
    localStorage.setItem('theme', themeName);
    
    // Atualiza o ícone do botão de tema
    const themeIcon = document.getElementById('themeToggle');
    if (themeIcon) {
        themeIcon.innerHTML = themeName === 'dark-theme' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// Configura o botão de alternar tema
document.addEventListener('DOMContentLoaded', function() {
    applySavedTheme();
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Exporta funções para uso global
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.applySavedTheme = applySavedTheme;