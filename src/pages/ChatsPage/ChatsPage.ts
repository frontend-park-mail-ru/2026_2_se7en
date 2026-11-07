import { ChatArea } from '@/components/chat/ChatArea.ts';
import { ChatList } from '@/components/chat/ChatList.ts';
import { ChatsPageModel } from './ChatsPage.model.ts';
import { DefaultLayout } from '@/layouts/DefaultLayout.ts';
import { Page } from '@/pages/Page.ts';
import { ROUTES } from '@/constants/Routes.ts';
import { eventBus } from '@/helpers/EventBus.ts';

/**
 * View страницы чатов.
 */
export class ChatsPage extends Page {
  static route = ROUTES.HOME;

  private readonly model = new ChatsPageModel();
  private readonly layout = new DefaultLayout();
  private readonly chatList = new ChatList();
  private readonly chatArea = new ChatArea();

  constructor() {
    super();

    this.setSubscribers(
      [this.model.chats, this.model.activeChat, this.model.isLoading, this.model.hasNetworkError],
      () => this.update(),
    );
  }

  render(): string {
    const content = `
      ${this.chatList.render(this.model.chats.value, this.model.activeChat.value, this.model.isLoading.value)}
      ${this.chatArea.render(this.model.activeChat.value, this.model.chats.value, this.model.isLoading.value, this.model.hasNetworkError.value)}
    `;

    return this.layout.render(content);
  }

  private update(): void {
    if (!this.container) return;

    this.container.innerHTML = this.render();
    this.bindEvents();
  }

  bindEvents(): void {
    this.layout.bindEvents();
  }

  private readonly handleContainerClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;

    if (!target) return;

    const chatItem = target.closest<HTMLElement>('[data-chat-id]');

    if (chatItem) {
      const id = chatItem.dataset.chatId;

      if (id) eventBus.emit('chats:select', { id });

      return;
    }

    if (target.closest('#retry-connection-btn')) {
      eventBus.emit('chats:load');
    }
  };

  async afterMount(): Promise<void> {
    this.container?.addEventListener('click', this.handleContainerClick);
    eventBus.emit('chats:load');
  }

  unmount(): void {
    this.container?.removeEventListener('click', this.handleContainerClick);
    this.layout.unmount();
    this.model.destroy();
    super.unmount();
  }
}
