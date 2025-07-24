import Entity from './Entity';
import createRequest from './createRequest';

export default class ChatAPI extends Entity {
  constructor() {
    super();
    this.ws = null;
    this.currentUser = null;
    this.messageHandlers = [];
    this.userHandlers = [];
  }

  connect(url) {
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        this.messageHandlers.forEach(handler => handler(data));
      } else if (data.type === 'users') {
        this.userHandlers.forEach(handler => handler(data.users));
      }
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  register(nickname) {
    if (!this.ws) {
      throw new Error('WebSocket is not connected');
    }
    
    this.ws.send(JSON.stringify({
      type: 'register',
      name: nickname
    }));
  }

  sendMessage(message) {
    if (!this.ws || !this.currentUser) {
      throw new Error('Not connected or not registered');
    }
    
    this.ws.send(JSON.stringify({
      type: 'send',
      message: message,
      user: this.currentUser
    }));
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  onUsersUpdate(handler) {
    this.userHandlers.push(handler);
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  async makeHttpRequest(options) {
    return createRequest(options); 
  }
}
