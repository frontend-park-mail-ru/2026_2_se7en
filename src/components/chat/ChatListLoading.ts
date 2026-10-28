import './ChatList.scss';
import './Skeleton.scss';

export function renderChatListLoading(): string {
  return `
    <div class="chat-panel">
      <div class="chat-panel__header">
        <div class="skeleton chat-panel__skel-title"></div>
        <div class="skeleton chat-panel__skel-subtitle"></div>
      </div>

      <div class="chat-panel__search">
        <div class="skeleton skeleton--light skeleton--pill chat-panel__skel-search"></div>
      </div>

      <div class="chat-panel__list">
        ${Array(6)
          .fill(
            `
              <div class="chat-panel__skel-item">
                <div class="chat-panel__skel-item-inner">
                  <div class="skeleton skeleton--circle chat-panel__skel-avatar"></div>
                  <div class="chat-panel__skel-lines">
                    <div class="skeleton chat-panel__skel-line"></div>
                    <div class="skeleton chat-panel__skel-line--short"></div>
                  </div>
                </div>
              </div>
            `,
          )
          .join('')}
      </div>
    </div>
  `;
}
