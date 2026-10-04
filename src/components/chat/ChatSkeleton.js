/**
 * Компонент скелетона загрузки чата
 */
export class ChatSkeleton {
  /**
   * Рендерит один скелетон сообщения
   */
  static renderMessage() {
    return `
      <div class="flex gap-3">
        <div class="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div class="flex-1">
          <div class="h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    `;
  }

  /**
   * Рендерит полный скелетон области чата
   */
  static render() {
    const skeletonItems = Array(4)
      .fill(null)
      .map(() => ChatSkeleton.renderMessage())
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
}
