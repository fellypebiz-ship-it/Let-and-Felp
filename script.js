// Variáveis globais
let photos = [];
let currentPhotoIndex = 0;

// Elementos DOM
const photoGallery = document.getElementById('photoGallery');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const photoModal = document.getElementById('photoModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const closeModal = document.getElementById('closeModal');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadPhotos();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Upload de arquivos
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    
    // Modal
    closeModal.addEventListener('click', closePhotoModal);
    prevBtn.addEventListener('click', showPreviousPhoto);
    nextBtn.addEventListener('click', showNextPhoto);
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePhotoModal();
        }
    });
    
    // Fechar modal clicando fora
    photoModal.addEventListener('click', function(e) {
        if (e.target === photoModal) {
            closePhotoModal();
        }
    });
}

// Gerenciar seleção de arquivos
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    addPhotos(files);
}

// Gerenciar drag and drop
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
        addPhotos(imageFiles);
    }
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Adicionar fotos
function addPhotos(files) {
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const photo = {
                    id: Date.now() + Math.random(),
                    src: e.target.result,
                    name: file.name,
                    date: new Date().toLocaleDateString('pt-BR'),
                    file: file
                };
                
                photos.push(photo);
                savePhotos();
                renderPhoto(photo);
                
                // Mostrar mensagem de sucesso
                showNotification(`Foto "${file.name}" adicionada com sucesso! ❤️`);
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Limpar input
    fileInput.value = '';
}

// Renderizar uma foto na galeria
function renderPhoto(photo) {
    const photoElement = document.createElement('div');
    photoElement.className = 'photo-item';
    photoElement.dataset.photoId = photo.id;
    
    photoElement.innerHTML = `
        <img src="${photo.src}" alt="${photo.name}" loading="lazy">
        <div class="photo-overlay">
            <div class="photo-title">${photo.name}</div>
            <div class="photo-date">${photo.date}</div>
        </div>
    `;
    
    // Adicionar evento de clique para abrir modal
    photoElement.addEventListener('click', () => openPhotoModal(photo.id));
    
    // Adicionar com animação
    photoElement.style.opacity = '0';
    photoElement.style.transform = 'translateY(20px)';
    photoGallery.appendChild(photoElement);
    
    // Animar entrada
    setTimeout(() => {
        photoElement.style.transition = 'all 0.6s ease-out';
        photoElement.style.opacity = '1';
        photoElement.style.transform = 'translateY(0)';
    }, 100);
}

// Abrir modal da foto
function openPhotoModal(photoId) {
    const photoIndex = photos.findIndex(p => p.id === photoId);
    if (photoIndex !== -1) {
        currentPhotoIndex = photoIndex;
        showPhotoInModal();
        photoModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Mostrar foto no modal
function showPhotoInModal() {
    const photo = photos[currentPhotoIndex];
    modalImage.src = photo.src;
    modalImage.alt = photo.name;
    modalTitle.textContent = photo.name;
    modalDate.textContent = photo.date;
    
    // Atualizar estado dos botões de navegação
    prevBtn.style.display = currentPhotoIndex > 0 ? 'block' : 'none';
    nextBtn.style.display = currentPhotoIndex < photos.length - 1 ? 'block' : 'none';
}

// Fechar modal
function closePhotoModal() {
    photoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Mostrar foto anterior
function showPreviousPhoto() {
    if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
        showPhotoInModal();
    }
}

// Mostrar próxima foto
function showNextPhoto() {
    if (currentPhotoIndex < photos.length - 1) {
        currentPhotoIndex++;
        showPhotoInModal();
    }
}

// Salvar fotos no localStorage
function savePhotos() {
    const photosToSave = photos.map(photo => ({
        id: photo.id,
        src: photo.src,
        name: photo.name,
        date: photo.date
    }));
    
    localStorage.setItem('loveGalleryPhotos', JSON.stringify(photosToSave));
}

// Carregar fotos do localStorage
function loadPhotos() {
    const savedPhotos = localStorage.getItem('loveGalleryPhotos');
    
    if (savedPhotos) {
        try {
            photos = JSON.parse(savedPhotos);
            photos.forEach(photo => renderPhoto(photo));
        } catch (error) {
            console.error('Erro ao carregar fotos:', error);
            photos = [];
        }
    }
}

// Mostrar notificação
function showNotification(message) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(400px);
        transition: transform 0.5s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 4000);
}

// Função para remover foto (opcional)
function removePhoto(photoId) {
    const photoIndex = photos.findIndex(p => p.id === photoId);
    if (photoIndex !== -1) {
        photos.splice(photoIndex, 1);
        savePhotos();
        
        // Remover elemento da DOM
        const photoElement = document.querySelector(`[data-photo-id="${photoId}"]`);
        if (photoElement) {
            photoElement.style.transform = 'scale(0.8)';
            photoElement.style.opacity = '0';
            setTimeout(() => {
                if (photoElement.parentNode) {
                    photoElement.parentNode.removeChild(photoElement);
                }
            }, 300);
        }
        
        showNotification('Foto removida da galeria 💔');
    }
}

// Adicionar algumas fotos de exemplo (opcional - remover em produção)
function addSamplePhotos() {
    if (photos.length === 0) {
        const samplePhotos = [
            {
                id: 'sample1',
                src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8dGV4dCB4PSIxMDAiIHk9IjExMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+4pyFPC90ZXh0Pgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmY2YjZiO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlZTVhMjQ7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+',
                name: 'Nossa primeira foto juntos',
                date: new Date().toLocaleDateString('pt-BR')
            },
            {
                id: 'sample2',
                src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8dGV4dCB4PSIxMDAiIHk9IjExMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+4pyFPC90ZXh0Pgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjY3ZWVhO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM3NjRiYTI7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+',
                name: 'Momentos especiais',
                date: new Date().toLocaleDateString('pt-BR')
            }
        ];
        
        samplePhotos.forEach(photo => {
            photos.push(photo);
            renderPhoto(photo);
        });
        
        savePhotos();
    }
}

// Adicionar fotos de exemplo se não houver nenhuma (opcional)
setTimeout(addSamplePhotos, 1000);
