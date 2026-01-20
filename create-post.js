// ===================================
// Create Post Modal - Match Selection Version
// ===================================

class CreatePostModal {
  constructor() {
    this.modal = null;
    this.selectedMatch = null;
    this.uploadedMedia = null;
    this.currentStep = 'select'; // 'select' or 'customize'

    this.init();
  }

  init() {
    this.createModal();
    this.attachEventListeners();
  }

  createModal() {
    const modalHTML = `
      <div class="create-post-modal" id="createPostModal">
        <div class="modal-overlay" id="modalOverlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">
              <span class="text-neon">Seleziona</span> Partita
            </h2>
            <button class="modal-close" id="modalClose">✕</button>
          </div>
          
          <div class="modal-body" id="modalBody">
            <!-- Step 1: Match Selection (populated dynamically) -->
            <div id="matchSelectionStep">
              <div class="loading-matches" id="loadingMatches">
                <div class="loader"></div>
                <p>Caricamento partite recenti...</p>
              </div>
              <div class="matches-list" id="matchesList" style="display: none;"></div>
            </div>
            
            <!-- Step 2: Customize Post (hidden initially) -->
            <div id="customizeStep" style="display: none;">
              <div class="selected-match-info" id="selectedMatchInfo"></div>
              
              <!-- Media Upload -->
              <div class="form-section">
                <label class="form-label">📸 Aggiungi Foto o Video (opzionale)</label>
                <div class="media-upload-area" id="mediaUploadArea">
                  <input type="file" id="mediaInput" accept="image/*,video/*" hidden>
                  <div class="upload-placeholder" id="uploadPlaceholder">
                    <div class="upload-icon">📤</div>
                    <p>Clicca per caricare</p>
                    <span class="upload-hint">Max 10MB • JPG, PNG, GIF, MP4, WebM</span>
                  </div>
                  <div class="media-preview" id="mediaPreview" style="display: none;">
                    <img id="imagePreview" style="display: none;">
                    <video id="videoPreview" controls style="display: none;"></video>
                    <button class="remove-media" id="removeMedia">✕</button>
                  </div>
                </div>
              </div>
              
              <!-- Description -->
              <div class="form-section">
                <label class="form-label">💬 Descrizione (opzionale)</label>
                <textarea class="form-textarea" id="postDescription" placeholder="Che partita! Commenta il risultato..."></textarea>
              </div>
            </div>
          </div>
          
          <div class="modal-footer" id="modalFooter">
            <button class="btn-cancel" id="btnCancel">Annulla</button>
            <button class="btn-back" id="btnBack" style="display: none;">← Indietro</button>
            <button class="btn-publish" id="btnPublish" style="display: none;">
              <span>Pubblica</span>
              <span class="publish-icon">🚀</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('createPostModal');
  }

  attachEventListeners() {
    // Close modal
    document.getElementById('modalClose').addEventListener('click', () => this.close());
    document.getElementById('modalOverlay').addEventListener('click', () => this.close());
    document.getElementById('btnCancel').addEventListener('click', () => this.close());
    document.getElementById('btnBack').addEventListener('click', () => this.goBackToSelection());

    // Media upload
    const uploadArea = document.getElementById('mediaUploadArea');
    const mediaInput = document.getElementById('mediaInput');

    uploadArea.addEventListener('click', () => mediaInput.click());
    mediaInput.addEventListener('change', (e) => this.handleMediaUpload(e));
    document.getElementById('removeMedia').addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeMedia();
    });

    // Publish
    document.getElementById('btnPublish').addEventListener('click', () => this.publish());
  }

  async open() {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Reset to selection step
    this.currentStep = 'select';
    this.showStep('select');

    // Load matches
    await this.loadMatches();
  }

  close() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    this.reset();
  }

  async loadMatches() {
    const loadingEl = document.getElementById('loadingMatches');
    const listEl = document.getElementById('matchesList');

    loadingEl.style.display = 'flex';
    listEl.style.display = 'none';

    try {
      // Fetch matches from API
      const matches = await window.matchesAPI.getRecentMatches([135, 2], 48); // Serie A + Champions, 48h

      // Render matches list
      this.renderMatchesList(matches);

      loadingEl.style.display = 'none';
      listEl.style.display = 'block';
    } catch (error) {
      console.error('Error loading matches:', error);
      loadingEl.innerHTML = `
        <p style="color: #FF1744;">❌ Errore caricamento partite</p>
        <button class="btn-retry" onclick="window.createPostModal.loadMatches()">Riprova</button>
      `;
    }
  }

  renderMatchesList(matches) {
    const listEl = document.getElementById('matchesList');

    if (matches.length === 0) {
      listEl.innerHTML = '<p style="text-align: center; color: #999;">Nessuna partita recente trovata</p>';
      return;
    }

    listEl.innerHTML = matches.map(match => `
      <div class="match-item" data-match-id="${match.id}">
        <div class="match-competition">${match.competition}</div>
        <div class="match-teams">
          <div class="match-team">
            <span class="team-logo">${match.homeTeam.logo}</span>
            <span class="team-name">${match.homeTeam.name}</span>
            <span class="team-score">${match.homeScore}</span>
          </div>
          <div class="match-vs">-</div>
          <div class="match-team">
            <span class="team-score">${match.awayScore}</span>
            <span class="team-name">${match.awayTeam.name}</span>
            <span class="team-logo">${match.awayTeam.logo}</span>
          </div>
        </div>
        <div class="match-meta">
          <span class="match-status">${match.matchStatus}</span>
          <span class="match-time">${window.matchesAPI.getRelativeTime(match.date)}</span>
        </div>
      </div>
    `).join('');

    // Add click handlers
    listEl.querySelectorAll('.match-item').forEach((item, index) => {
      item.addEventListener('click', () => this.selectMatch(matches[index]));
    });
  }

  selectMatch(match) {
    this.selectedMatch = match;
    this.showStep('customize');

    // Update selected match info
    const infoEl = document.getElementById('selectedMatchInfo');
    infoEl.innerHTML = `
      <div class="selected-match-card">
        <div class="selected-match-header">
          <span class="selected-competition">${match.competition}</span>
          <span class="selected-status">${match.matchStatus}</span>
        </div>
        <div class="selected-match-score">
          <div class="selected-team">
            <span class="selected-logo">${match.homeTeam.logo}</span>
            <span class="selected-name">${match.homeTeam.name}</span>
          </div>
          <div class="selected-result">
            <span class="selected-score">${match.homeScore}</span>
            <span class="selected-separator">-</span>
            <span class="selected-score">${match.awayScore}</span>
          </div>
          <div class="selected-team">
            <span class="selected-name">${match.awayTeam.name}</span>
            <span class="selected-logo">${match.awayTeam.logo}</span>
          </div>
        </div>
      </div>
    `;
  }

  showStep(step) {
    this.currentStep = step;

    const selectionStep = document.getElementById('matchSelectionStep');
    const customizeStep = document.getElementById('customizeStep');
    const btnBack = document.getElementById('btnBack');
    const btnPublish = document.getElementById('btnPublish');
    const modalTitle = document.querySelector('.modal-title');

    if (step === 'select') {
      selectionStep.style.display = 'block';
      customizeStep.style.display = 'none';
      btnBack.style.display = 'none';
      btnPublish.style.display = 'none';
      modalTitle.innerHTML = '<span class="text-neon">Seleziona</span> Partita';
    } else {
      selectionStep.style.display = 'none';
      customizeStep.style.display = 'block';
      btnBack.style.display = 'inline-flex';
      btnPublish.style.display = 'inline-flex';
      modalTitle.innerHTML = '<span class="text-neon">Personalizza</span> Post';
    }
  }

  goBackToSelection() {
    this.showStep('select');
    this.selectedMatch = null;
    this.removeMedia();
    document.getElementById('postDescription').value = '';
  }

  async handleMediaUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      this.uploadedMedia = await window.mediaUploader.uploadFile(file);

      const placeholder = document.getElementById('uploadPlaceholder');
      const preview = document.getElementById('mediaPreview');

      placeholder.style.display = 'none';
      preview.style.display = 'block';

      if (this.uploadedMedia.type === 'image') {
        const img = document.getElementById('imagePreview');
        img.src = this.uploadedMedia.url;
        img.style.display = 'block';
        document.getElementById('videoPreview').style.display = 'none';
      } else {
        const video = document.getElementById('videoPreview');
        video.src = this.uploadedMedia.url;
        video.style.display = 'block';
        document.getElementById('imagePreview').style.display = 'none';
      }
    } catch (error) {
      alert('❌ ' + error.message);
    }
  }

  removeMedia() {
    this.uploadedMedia = null;
    document.getElementById('uploadPlaceholder').style.display = 'flex';
    document.getElementById('mediaPreview').style.display = 'none';
    document.getElementById('mediaInput').value = '';
  }

  async publish() {
    if (!this.selectedMatch) {
      alert('⚠️ Seleziona una partita!');
      return;
    }

    // Crea post data con dati partita + personalizzazione utente
    const postData = {
      ...this.selectedMatch,
      description: document.getElementById('postDescription').value,
      mediaUrl: this.uploadedMedia?.url || null,
      mediaType: this.uploadedMedia?.type || null
    };

    // Mostra loading
    const btnPublish = document.getElementById('btnPublish');
    btnPublish.disabled = true;
    btnPublish.innerHTML = '<span>Pubblicando...</span> ⏳';

    try {
      // Crea post
      await window.postManager.createPost(postData);

      // Success
      alert('✅ Post pubblicato con successo!');

      // Ricarica feed
      if (window.loadFeedPosts) {
        window.loadFeedPosts();
      }

      // Chiudi modal
      this.close();
    } catch (error) {
      alert('❌ Errore durante la pubblicazione: ' + error.message);
      btnPublish.disabled = false;
      btnPublish.innerHTML = '<span>Pubblica</span> 🚀';
    }
  }

  reset() {
    this.selectedMatch = null;
    this.uploadedMedia = null;
    this.currentStep = 'select';
    document.getElementById('postDescription').value = '';
    this.removeMedia();
  }
}

// Initialize
let createPostModal;
document.addEventListener('DOMContentLoaded', () => {
  createPostModal = new CreatePostModal();
  window.createPostModal = createPostModal;
});
