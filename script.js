// Classe principal para gerenciar parcelas
class GerenciadorParcelas {
    constructor() {
        this.itens = JSON.parse(localStorage.getItem('parcelas')) || [];
        this.itemParaRemover = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDataAtual();
        this.atualizarInterface();
    }

    setupEventListeners() {
        // Formulário de adição
        const form = document.getElementById('itemForm');
        form.addEventListener('submit', (e) => this.adicionarItem(e));

        // Modal de confirmação
        const modal = document.getElementById('deleteModal');
        const cancelBtn = document.getElementById('cancelDelete');
        const confirmBtn = document.getElementById('confirmDelete');

        cancelBtn.addEventListener('click', () => this.fecharModal());
        confirmBtn.addEventListener('click', () => this.confirmarRemocao());

        // Fechar modal clicando fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.fecharModal();
            }
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.fecharModal();
            }
        });
    }

    setDataAtual() {
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').value = hoje;
    }

    adicionarItem(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const nome = formData.get('itemName').trim();
        const valor = parseFloat(formData.get('itemValue'));
        const parcelas = parseInt(formData.get('installments'));
        const dataInicio = formData.get('startDate');

        // Validações
        if (!nome || nome.length < 2) {
            this.mostrarAlerta('Por favor, insira um nome válido para o item.');
            return;
        }

        if (valor <= 0) {
            this.mostrarAlerta('Por favor, insira um valor válido maior que zero.');
            return;
        }

        if (!parcelas || parcelas < 1) {
            this.mostrarAlerta('Por favor, selecione o número de parcelas.');
            return;
        }

        if (!dataInicio) {
            this.mostrarAlerta('Por favor, selecione a data de início.');
            return;
        }

        // Criar novo item
        const novoItem = {
            id: Date.now(),
            nome: nome,
            valor: valor,
            parcelas: parcelas,
            dataInicio: dataInicio,
            dataCriacao: new Date().toISOString()
        };

        // Adicionar à lista
        this.itens.push(novoItem);
        
        // Salvar no localStorage
        this.salvarDados();
        
        // Atualizar interface
        this.atualizarInterface();
        
        // Limpar formulário
        e.target.reset();
        this.setDataAtual();
        
        // Feedback visual
        this.mostrarSucesso('Item adicionado com sucesso!');
    }

    removerItem(id) {
        this.itemParaRemover = id;
        this.abrirModal();
    }

    confirmarRemocao() {
        if (this.itemParaRemover !== null) {
            this.itens = this.itens.filter(item => item.id !== this.itemParaRemover);
            this.salvarDados();
            this.atualizarInterface();
            this.mostrarSucesso('Item removido com sucesso!');
            this.fecharModal();
        }
    }

    abrirModal() {
        document.getElementById('deleteModal').style.display = 'block';
    }

    fecharModal() {
        document.getElementById('deleteModal').style.display = 'none';
        this.itemParaRemover = null;
    }

    salvarDados() {
        localStorage.setItem('parcelas', JSON.stringify(this.itens));
    }

    atualizarInterface() {
        this.atualizarResumo();
        this.atualizarListaItens();
    }

    atualizarResumo() {
        const totalItens = this.itens.length;
        const totalValor = this.itens.reduce((sum, item) => sum + item.valor, 0);
        const totalParcelas = this.itens.reduce((sum, item) => sum + item.parcelas, 0);

        document.getElementById('totalItems').textContent = totalItens;
        document.getElementById('totalValue').textContent = this.formatarMoeda(totalValor);
        document.getElementById('totalInstallments').textContent = totalParcelas;
    }

    atualizarListaItens() {
        const itemsList = document.getElementById('itemsList');
        const emptyState = document.getElementById('emptyState');

        if (this.itens.length === 0) {
            itemsList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        itemsList.style.display = 'block';
        emptyState.style.display = 'none';

        // Ordenar por data de criação (mais recentes primeiro)
        const itensOrdenados = [...this.itens].sort((a, b) => 
            new Date(b.dataCriacao) - new Date(a.dataCriacao)
        );

        itemsList.innerHTML = itensOrdenados.map(item => this.criarCardItem(item)).join('');
    }

    criarCardItem(item) {
        const valorParcela = item.valor / item.parcelas;
        const dataInicio = new Date(item.dataInicio);
        const dataFim = new Date(dataInicio);
        dataFim.setMonth(dataFim.getMonth() + item.parcelas - 1);

        return `
            <div class="item-card" data-id="${item.id}">
                <div class="item-header">
                    <div>
                        <div class="item-title">${this.escapeHtml(item.nome)}</div>
                        <div class="item-date">
                            Início: ${this.formatarData(dataInicio)} | 
                            Fim: ${this.formatarData(dataFim)}
                        </div>
                    </div>
                </div>
                
                <div class="item-details">
                    <div class="item-detail">
                        <div class="item-detail-label">Valor Total</div>
                        <div class="item-detail-value">${this.formatarMoeda(item.valor)}</div>
                    </div>
                    <div class="item-detail">
                        <div class="item-detail-label">Parcelas</div>
                        <div class="item-detail-value">${item.parcelas}x</div>
                    </div>
                    <div class="item-detail">
                        <div class="item-detail-label">Valor da Parcela</div>
                        <div class="item-detail-value">${this.formatarMoeda(valorParcela)}</div>
                    </div>
                    <div class="item-detail">
                        <div class="item-detail-label">Status</div>
                        <div class="item-detail-value">${this.obterStatusParcelas(dataInicio, dataFim)}</div>
                    </div>
                </div>
                
                <div class="item-actions">
                    <button class="btn btn-remove" onclick="gerenciador.removerItem(${item.id})">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
    }

    obterStatusParcelas(dataInicio, dataFim) {
        const hoje = new Date();
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);

        if (hoje < inicio) {
            return '<span style="color: #3182ce;">Aguardando</span>';
        } else if (hoje > fim) {
            return '<span style="color: #38a169;">Finalizado</span>';
        } else {
            return '<span style="color: #d69e2e;">Em andamento</span>';
        }
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    formatarData(data) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(data);
    }

    escapeHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    mostrarAlerta(mensagem) {
        this.mostrarNotificacao(mensagem, 'error');
    }

    mostrarSucesso(mensagem) {
        this.mostrarNotificacao(mensagem, 'success');
    }

    mostrarNotificacao(mensagem, tipo) {
        // Remover notificação existente
        const notificacaoExistente = document.querySelector('.notificacao');
        if (notificacaoExistente) {
            notificacaoExistente.remove();
        }

        // Criar nova notificação
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao notificacao-${tipo}`;
        notificacao.innerHTML = `
            <div class="notificacao-conteudo">
                <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${mensagem}</span>
            </div>
        `;

        // Adicionar estilos inline para a notificação
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#38a169' : '#e53e3e'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        // Adicionar estilos para o conteúdo da notificação
        const conteudo = notificacao.querySelector('.notificacao-conteudo');
        conteudo.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
        `;

        // Adicionar ao DOM
        document.body.appendChild(notificacao);

        // Remover automaticamente após 4 segundos
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (notificacao.parentNode) {
                        notificacao.remove();
                    }
                }, 300);
            }
        }, 4000);
    }
}

// Adicionar estilos CSS para as notificações
const estilosNotificacao = document.createElement('style');
estilosNotificacao.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(estilosNotificacao);

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.gerenciador = new GerenciadorParcelas();
});

// Função para exportar dados (funcionalidade futura)
function exportarDados() {
    const dados = JSON.parse(localStorage.getItem('parcelas')) || [];
    const dadosFormatados = JSON.stringify(dados, null, 2);
    
    const blob = new Blob([dadosFormatados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `parcelas_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Função para importar dados (funcionalidade futura)
function importarDados() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const dados = JSON.parse(e.target.result);
                    if (Array.isArray(dados)) {
                        localStorage.setItem('parcelas', JSON.stringify(dados));
                        window.gerenciador.itens = dados;
                        window.gerenciador.atualizarInterface();
                        window.gerenciador.mostrarSucesso('Dados importados com sucesso!');
                    } else {
                        throw new Error('Formato inválido');
                    }
                } catch (error) {
                    window.gerenciador.mostrarAlerta('Erro ao importar dados. Verifique se o arquivo é válido.');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Variáveis globais
let photos = [];
let currentPhotoIndex = 0;

// Elementos DOM
const photoGallery = document.getElementById('photoGallery');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const photoModal = document.getElementById('photoModal');
const modalImage = document.getElementById('modalImage');
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
