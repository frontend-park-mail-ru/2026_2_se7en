import { ChatsApi } from '../../api/chats/ChatsApi.js';
import { Sidebar } from '../../components/Sidebar.js';
import { ChatList } from '../../components/ChatList.js';
import { ChatArea } from '../../components/ChatArea.js';

/**
 * Класс, представляющий страницу чатов.
 * Координирует работу всех компонентов страницы.
 */
export class ChatsPage {
  constructor() {
    this.chats = [];
    this.activeChat = null;
    this.isLoading = false;
    this.currentUser = {
      initials: 'ВМ',
      name: 'Вы',
    };

    this.sidebar = new Sidebar(this.currentUser);
    this.chatList = new ChatList();
    this.chatArea = new ChatArea();
  }

  /**
   * Загрузка всех шаблонов
   */
  async loadTemplates() {
    await Promise.all([this.chatList.loadTemplates(), this.chatArea.loadTemplates()]);
  }

  /**
   * Загрузка списка чатов с сервера
   */
  async loadChats() {
    this.isLoading = true;

    try {
      // const data = await ChatsApi.getChats();
      this.chats = data?.items || [];
    } catch (error) {
      console.error('Ошибка при загрузке чатов:', error);
      this.chats = [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Установка активного чата
   */
  setActiveChat(chatId) {
    this.activeChat = this.chats.find((c) => c.id === chatId) || null;
  }

  /**
   * Основной рендер страницы
   */
  render() {
    return `
      <div class="min-h-screen bg-gray-50 flex">
        ${this.sidebar.render()}
        ${this.chatList.render(this.chats, this.activeChat?.id, this.isLoading)}
        ${this.chatArea.render(this.activeChat, this.chats, this.isLoading)}
      </div>
    `;
  }

  /**
   * Инициализация страницы
   */
  async mount() {
    await this.loadTemplates();
    await this.loadChats();
  }
}
