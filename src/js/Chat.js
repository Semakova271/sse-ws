import ChatAPI from "./api/ChatAPI";

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatAPI();
    this.modal = null;
    this.websocketUrl = 'wss://your-render-backend-url.com'; // Replace with your actual URL
  }

  init() {
    this.bindToDOM();
    this.registerEvents();
    this.showNicknameModal();
    this.api.connect(this.websocketUrl);
    this.subscribeOnEvents();
  }

  bindToDOM() {
    this.container.innerHTML = `
      <div class="container">
        <h1 class="chat__header">WebSocket Chat</h1>
        <div class="chat__container hidden" id="chat-container">
          <div class="chat__area">
            <div class="chat__messages-container" id="messages-container"></div>
            <div class="chat__messages-input">
              <form class="form" id="message-form">
                <div class="form__group">
                  <input type="text" class="form__input" id="message-input" placeholder="Type your message here">
                </div>
              </form>
            </div>
          </div>
          <div class="chat__userlist" id="user-list"></div>
        </div>
      </div>
      <div class="modal__form" id="nickname-modal">
        <div class="modal__background"></div>
        <div class="modal__content">
          <div class="modal__header">Choose your nickname</div>
          <div class="modal__body">
            <form class="form" id="nickname-form">
              <div class="form__group">
                <input type="text" class="form__input" id="nickname-input" placeholder="Nickname">
              </div>
              <div class="form__hint hidden" id="nickname-error"></div>
            </form>
          </div>
          <div class="modal__footer">
            <button class="modal__ok" id="submit-nickname">Continue</button>
          </div>
        </div>
      </div>
    `;
  }

  registerEvents() {
    document.getElementById('message-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });

    document.getElementById('submit-nickname')?.addEventListener('click', () => {
      this.onEnterChatHandler();
    });

    document.getElementById('nickname-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.onEnterChatHandler();
      }
    });
  }

  subscribeOnEvents() {
    this.api.onMessage((message) => {
      this.renderMessage(message);
    });

    this.api.onUsersUpdate((users) => {
      this.updateUserList(users);
    });
  }

  showNicknameModal() {
    const modal = document.getElementById('nickname-modal');
    modal.classList.add('active');
    document.getElementById('nickname-input').focus();
  }

  hideNicknameModal() {
    document.getElementById('nickname-modal').classList.remove('active');
  }

  onEnterChatHandler() {
    const nicknameInput = document.getElementById('nickname-input');
    const nickname = nicknameInput.value.trim();
    const errorElement = document.getElementById('nickname-error');

    if (!nickname) {
      errorElement.textContent = 'Please enter a nickname';
      errorElement.classList.remove('hidden');
      return;
    }

    this.api.register(nickname);
    
    // In a real app, we would wait for server confirmation
    // For now, we'll assume it's successful
    this.api.setCurrentUser({ name: nickname });
    this.hideNicknameModal();
    document.getElementById('chat-container').classList.remove('hidden');
  }

  sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (message) {
      this.api.sendMessage(message);
      input.value = '';
      input.focus();
    }
  }

  renderMessage(data) {
    const messagesContainer = document.getElementById('messages-container');
    const isCurrentUser = data.user.name === this.api.currentUser?.name;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message__container ${
      isCurrentUser ? 'message__container-yourself' : 'message__container-interlocutor'
    }`;
    
    const date = new Date(data.timestamp || Date.now());
    const formattedDate = `${date.getHours()}:${date.getMinutes()}.${date.getDate()}.${
      date.getMonth() + 1
    }.${date.getFullYear()}`;
    
    messageElement.innerHTML = `
      <div class="message__header">
        ${isCurrentUser ? 'You' : data.user.name}, ${formattedDate}
      </div>
      <div class="message__content">${data.message}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  updateUserList(users) {
    const userListContainer = document.getElementById('user-list');
    userListContainer.innerHTML = `
      <h3>Online Users (${users.length})</h3>
      ${users.map(user => `
        <div class="chat__user">${user.name}</div>
      `).join('')}
    `;
  }
}