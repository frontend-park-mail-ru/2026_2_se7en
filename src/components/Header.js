export function Header({ title }) {
  return `
    <header class="w-full p-4 bg-white shadow-sm">
      <h1 class="text-2xl font-bold text-blue-600 text-center">${title}</h1>
    </header>
  `;
}
