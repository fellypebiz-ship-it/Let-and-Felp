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
    addSpecialPhotos(); // Adicionar fotos especiais automaticamente
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

// Adicionar fotos especiais com frases românticas de poetas
function addSpecialPhotos() {
    // Se já existem fotos salvas, não adicionar as especiais novamente
    if (photos.length > 0) return;
    
    const specialPhotos = [
        {
            id: 'special1',
            src: 'https://drive.google.com/file/d/1cBMkvXG1Rzy1P6DAhQ0sq62Ma8FvmQAi/preview',
            name: '🌹 "O amor é a poesia dos sentidos" 🌹',
            date: '- Honoré de Balzac',
            isSpecial: true
        },
        {
            id: 'special2',
            src: 'https://drive.google.com/file/d/13SAsfDK3P9BEus5_SrzrTAFC5rVqfNaR/preview',
            name: '"Amar é encontrar a felicidade na felicidade do outro"',
            date: '- Gottfried Leibniz',
            isSpecial: false
        },
        {
            id: 'special3',
            src: 'https://drive.google.com/file/d/1I5L_iwlNJY-vOCQmBXI97Yrlq61DNhMx/preview',
            name: '"O amor é a força mais sutil do mundo"',
            date: '- Lao Tzu',
            isSpecial: false
        },
        {
            id: 'special4',
            src: 'https://drive.google.com/file/d/168xwyuVoJ3DW045B9-Y8Mi38CaLb6NWb/preview',
            name: '"Amar é acreditar, esperar e conhecer"',
            date: '- Paulo Coelho',
            isSpecial: false
        },
        {
            id: 'special5',
            src: 'https://drive.google.com/file/d/1Ywg2VQY7kVZrzEnxZIoW9x4wSlBqhBo-/preview',
            name: '"O amor é a única resposta para a pergunta do sentido da vida"',
            date: '- Viktor Frankl',
            isSpecial: false
        },
        {
            id: 'special6',
            src: 'https://drive.google.com/file/d/1qJi-KeqmrLmj9ftuSGiL9Hisagzhn8SH/preview',
            name: '"Amar é encontrar a beleza em tudo"',
            date: '- Khalil Gibran',
            isSpecial: false
        },
        {
            id: 'special7',
            src: 'https://drive.google.com/file/d/1kvbQuH5bRHuSf0FmjDyqsqPijHr8_osu/preview',
            name: '"O amor é a música da vida"',
            date: '- Victor Hugo',
            isSpecial: false
        },
        {
            id: 'special8',
            src: 'https://drive.google.com/file/d/1NpKuB5xm-bu8iE9Ani9p99l6UQxHNqiP/preview',
            name: '"Amar é viver duas vidas em uma"',
            date: '- William Shakespeare',
            isSpecial: false
        },
        {
            id: 'special9',
            src: 'https://drive.google.com/file/d/1J3Xxy1XqFf7D6XO2T29-q1DAj7UEkW0J/preview',
            name: '"O amor é a luz que ilumina o caminho"',
            date: '- Rumi',
            isSpecial: false
        },
        {
            id: 'special10',
            src: 'https://drive.google.com/file/d/1P_YR5GrFvJaLSg56QqIxEc6u-FuJR9eV/preview',
            name: '"Amar é dar sem esperar receber"',
            date: '- Madre Teresa',
            isSpecial: false
        },
        {
            id: 'special11',
            src: 'https://drive.google.com/file/d/1yyZmsh7wigmkkFpEx6aLSvzqd4QubK-L/preview',
            name: '"O amor é a essência da existência"',
            date: '- Rabindranath Tagore',
            isSpecial: false
        },
        {
            id: 'special12',
            src: 'https://drive.google.com/file/d/1kTjK8PLkEFNTEBD9FomrnSz5ZGX7otH4/preview',
            name: '"Amar é encontrar o paraíso na terra"',
            date: '- John Milton',
            isSpecial: false
        },
        {
            id: 'special13',
            src: 'https://drive.google.com/file/d/1ni2QplB2xDCy-l6NQYsAhAQ1tXimK_DV/preview',
            name: '"O amor é a força que move o universo"',
            date: '- Dante Alighieri',
            isSpecial: false
        },
        {
            id: 'special14',
            src: 'https://drive.google.com/file/d/1AdgYTYnnwMbPd_Iw621ju1k-np4LXeoM/preview',
            name: '"Amar é a maior aventura da vida"',
            date: '- Antoine de Saint-Exupéry',
            isSpecial: false
        },
        {
            id: 'special15',
            src: 'https://drive.google.com/file/d/1qj7btA72RtSXniQnfTBDCuSnWy_wPGBt/preview',
            name: '"O amor é a resposta para todas as perguntas"',
            date: '- Hermann Hesse',
            isSpecial: false
        },
        {
            id: 'special16',
            src: 'https://drive.google.com/file/d/1bCeVWZedTOAjrMKRgffWLAxCV6KwpIvi/preview',
            name: '"Amar é encontrar a paz na tempestade"',
            date: '- Emily Dickinson',
            isSpecial: false
        },
        {
            id: 'special17',
            src: 'https://drive.google.com/file/d/17o1k98WBK2GfWFHYw3FRx-LG9kFRK54U/preview',
            name: '"O amor é a arte de viver juntos"',
            date: '- Voltaire',
            isSpecial: false
        },
        {
            id: 'special18',
            src: 'https://drive.google.com/file/d/1EKzAdgIiF0pmxImSFl-vQrdssMMEEowO/preview',
            name: '"Amar é encontrar a eternidade no momento"',
            date: '- William Blake',
            isSpecial: false
        },
        {
            id: 'special19',
            src: 'https://drive.google.com/file/d/17ZrfADNzLqIynvv7NZxyb2_9mRv0qoVg/preview',
            name: '"O amor é a magia que transforma tudo"',
            date: '- Oscar Wilde',
            isSpecial: false
        },
        {
            id: 'special20',
            src: 'https://drive.google.com/file/d/1hspffQdS3E_Pks2UKwkFsVEcYnPpLAnU/preview',
            name: '"Amar é encontrar o céu na terra"',
            date: '- Elizabeth Barrett Browning',
            isSpecial: false
        }
    ];
    
    specialPhotos.forEach(photo => {
        photos.push(photo);
        renderPhoto(photo);
    });
    
    savePhotos();
}

// Renderizar uma foto na galeria
function renderPhoto(photo) {
    const photoElement = document.createElement('div');
    photoElement.className = 'photo-item';
    photoElement.dataset.photoId = photo.id;
    
    // Adicionar classe especial se for a foto do beijo
    if (photo.isSpecial) {
        photoElement.classList.add('special-photo-item');
    }
    
    photoElement.innerHTML = `
        <img src="${photo.src}" alt="${photo.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.innerHTML='<div style=\'text-align:center; padding:20px; color:#666;\'><div style=\'font-size:3rem; margin-bottom:10px;\'>📸</div><div>Foto não disponível</div><div style=\'font-size:0.9rem; margin-top:10px; color:#999;\'>Clique para adicionar suas fotos</div></div>'">
        <div class="photo-overlay">
            <div class="photo-title">${photo.name}</div>
            <div class="photo-date">${photo.date}</div>
            ${photo.isSpecial ? '<div class="special-badge">💋 Beijo Especial 💋</div>' : ''}
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
        date: photo.date,
        isSpecial: photo.isSpecial
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
