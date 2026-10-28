import './Skeleton.scss';

/**
 * Компонент скелетона загрузки чата
 */
export class ChatSkeleton {
  /**
   * Рендерит один скелетон сообщения
   */
  static renderMessage(): string {
    return `
      <div class="chat-skeleton__message">
        <div class="skeleton skeleton--circle chat-skeleton__message-avatar"></div>
        <div class="chat-skeleton__message-body">
          <div class="skeleton skeleton--bubble chat-skeleton__message-bubble"></div>
        </div>
      </div>
    `;
  }

  /**
   * Рендерит полный скелетон области чата
   */
  static render(): string {
    const skeletonItems = Array(4)
      .fill(null)
      .map(() => ChatSkeleton.renderMessage())
      .join('');

    return `
      <div class="chat-skeleton">
        <div class="chat-skeleton__header">
          <div class="chat-skeleton__header-row">
            <div class="skeleton skeleton--circle chat-skeleton__header-avatar"></div>
            <div class="chat-skeleton__message-body">
              <div class="skeleton chat-skeleton__header-line"></div>
              <div class="skeleton chat-skeleton__header-sub"></div>
            </div>
          </div>
        </div>
        <div class="chat-skeleton__messages">
          ${skeletonItems}
        </div>
        <div class="chat-skeleton__footer">
          <div class="skeleton skeleton--light skeleton--rounded chat-skeleton__footer-bar"></div>
        </div>
      </div>
    `;
  }
}
