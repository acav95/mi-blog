// Seleccionamos el elemento <ul> donde aparecerán los pensamientos
const thoughtsList = document.querySelector('ul');

// Agregar al inicio del archivo, después de la selección de thoughtsList
const thoughtCount = document.querySelector('#thoughtCount');

// Agregar después de las otras constantes
const exportButton = document.querySelector('#exportButton');

// Función para formatear la fecha
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('es-ES', options);
}

// Función para actualizar el contador
function updateThoughtCount() {
    const visibleThoughts = Array.from(thoughtsList.children).filter(thought => 
        thought.style.display !== 'none'
    ).length;
    thoughtCount.textContent = visibleThoughts;
}

// Función para agregar un nuevo pensamiento
function addThought(text, category, timestamp = new Date().toISOString()) {
    // Crear un nuevo elemento <li>
    const newThought = document.createElement('li');
    newThought.dataset.timestamp = timestamp;
    
    // Crear el contenedor para el texto y la fecha
    const thoughtContent = document.createElement('div');
    thoughtContent.style.flex = '1';
    
    // Crear el contenedor para el texto
    const thoughtText = document.createElement('span');
    thoughtText.textContent = text;
    
    // Crear etiqueta de categoría
    const categoryTag = document.createElement('span');
    categoryTag.textContent = category;
    categoryTag.classList.add('category-tag');
    categoryTag.dataset.category = category;
    
    // Crear el contenedor para la fecha
    const thoughtDate = document.createElement('small');
    thoughtDate.textContent = formatDate(timestamp);
    
    // Crear el botón de eliminar
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.classList.add('delete-button');
    
    // Agregar evento para eliminar el pensamiento
    deleteButton.addEventListener('click', function() {
        newThought.remove();
        saveThoughts();
        updateThoughtCount(); // Actualizar contador después de eliminar
    });

    // Añadir elementos al contenedor
    thoughtContent.appendChild(thoughtText);
    thoughtContent.appendChild(categoryTag);
    thoughtContent.appendChild(thoughtDate);
    
    // Añadir el contenido y el botón al li
    newThought.appendChild(thoughtContent);
    newThought.appendChild(deleteButton);

    // Insertar el pensamiento en la posición correcta
    insertThoughtInOrder(newThought);
    updateThoughtCount(); // Actualizar contador después de agregar
}

// Función para insertar pensamiento en orden
function insertThoughtInOrder(newThought) {
    const thoughts = Array.from(thoughtsList.children);
    const newTimestamp = new Date(newThought.dataset.timestamp).getTime();
    
    let insertIndex = thoughts.findIndex(thought => {
        const thoughtTimestamp = new Date(thought.dataset.timestamp).getTime();
        return newTimestamp > thoughtTimestamp;
    });

    if (insertIndex === -1) {
        thoughtsList.appendChild(newThought);
    } else {
        thoughtsList.insertBefore(newThought, thoughts[insertIndex]);
    }
}

// Seleccionar el formulario y los campos de entrada
const thoughtForm = document.querySelector('#thoughtForm');
const thoughtInput = document.querySelector('#thoughtInput');
const categorySelect = document.querySelector('#categorySelect');

// Escuchar el evento de "submit" en el formulario
thoughtForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newThoughtText = thoughtInput.value;
    const category = categorySelect.value;

    if (newThoughtText.trim() !== '' && category !== '') {
        addThought(newThoughtText, category);
        saveThoughts();
        thoughtInput.value = '';
        categorySelect.value = '';
    }
});

// Guardar los pensamientos en localStorage
function saveThoughts() {
    const allThoughts = [];
    thoughtsList.querySelectorAll('li').forEach(li => {
        allThoughts.push({
            text: li.querySelector('span:first-child').textContent,
            category: li.querySelector('.category-tag').textContent,
            timestamp: li.dataset.timestamp
        });
    });
    localStorage.setItem('thoughts', JSON.stringify(allThoughts));
    updateThoughtCount();
}

// Cargar los pensamientos desde localStorage
function loadThoughts() {
    const savedThoughts = JSON.parse(localStorage.getItem('thoughts')) || [];
    savedThoughts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    thoughtsList.innerHTML = '';
    savedThoughts.forEach(thought => {
        addThought(thought.text, thought.category, thought.timestamp);
    });
    updateThoughtCount();
}

// Cargar los pensamientos al iniciar la página
loadThoughts();

// Agregar la funcionalidad de búsqueda
const searchInput = document.querySelector('#searchInput');

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const thoughts = thoughtsList.querySelectorAll('li');
    
    thoughts.forEach(thought => {
        const text = thought.querySelector('span').textContent.toLowerCase();
        const category = thought.querySelector('.category-tag').textContent.toLowerCase();
        
        // Buscar tanto en el texto como en la categoría
        if (text.includes(searchTerm) || category.includes(searchTerm)) {
            thought.style.display = ''; // Mostrar el pensamiento
        } else {
            thought.style.display = 'none'; // Ocultar el pensamiento
        }
    });
    
    updateThoughtCount(); // Actualizar contador después de filtrar
});

// Función para exportar pensamientos
function exportThoughts() {
    const thoughts = JSON.parse(localStorage.getItem('thoughts')) || [];
    const dataStr = JSON.stringify(thoughts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'mis_pensamientos.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Agregar evento al botón de exportar
exportButton.addEventListener('click', exportThoughts);
