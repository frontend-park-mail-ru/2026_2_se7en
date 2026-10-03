export function renderChatListLoading() {
  return `
    <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <div class="h-8 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
        <div class="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
          
      <div class="p-3">
        <div class="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
          
      <div class="flex-1 overflow-y-auto p-2 space-y-2">
        ${Array(6)
          .fill(
            `
              <div class="p-3 rounded-xl animate-pulse">
                <div class="flex gap-3">
                  <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/2"></div>
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
