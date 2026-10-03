import { Button } from './Button.js';

/**
 * Компонент области чата
 */
export class ChatArea {
  constructor() {
    this.templates = {};
  }

  async loadTemplate(name) {
    if (this.templates[name]) return this.templates[name];

    const response = await fetch(`/templates/${name}.hbs`);
    const source = await response.text();
    this.templates[name] = Handlebars.compile(source);
    return this.templates[name];
  }

  async loadTemplates() {
    await this.loadTemplate('skeleton-message');
  }

  /**
   * Генерирует скелетон сообщения
   */
  renderSkeletonMessage() {
    const template = this.templates['skeleton-message'];
    if (!template) {
      return `
        <div class="flex gap-3">
          <div class="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div class="flex-1">
            <div class="h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      `;
    }
    return template();
  }

  renderChatAreaLoading() {
    const skeletonItems = Array(4)
      .fill(null)
      .map(() => this.renderSkeletonMessage())
      .join('');

    return `
      <div class="flex-1 bg-gray-50 flex flex-col">
        <div class="h-16 bg-white border-b border-gray-200 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div class="flex-1 p-4 space-y-4">
          ${skeletonItems}
        </div>
        <div class="p-4 bg-white border-t border-gray-200">
          <div class="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    `;
  }

  renderEmptyChatArea() {
    const newChatButton = Button({
      text: 'Новый чат',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>',
      mode: 'primary',
    });

    return `
      <div class="flex-1 bg-gray-50 flex items-center justify-center">
        <div class="text-center max-w-md px-4">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Начните первый разговор</h2>
          <p class="text-gray-500 mb-6">Выберите контакт или создайте новый чат — сообщения будут доступны на всех ваших устройствах.</p>
          ${newChatButton}
        </div>
      </div>
    `;
  }

  renderSelectChatPrompt() {
    return `
      <div class="flex-1 bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <p class="text-gray-400">Выберите чат для начала общения</p>
        </div>
      </div>
    `;
  }

  /**
   * Основной метод рендеринга
   */
  render(activeChat, chats, isLoading) {
    if (isLoading) {
      return this.renderChatAreaLoading();
    }

    if (!activeChat && chats.length === 0) {
      return this.renderEmptyChatArea();
    }

    return this.renderSelectChatPrompt();
  }
}
