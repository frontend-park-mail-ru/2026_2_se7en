export default function Header({ title }) {
  return (
    <header className="w-full p-4 bg-white shadow-sm">
      <h1 className="text-2xl font-bold text-blue-600 text-center">{title}</h1>
    </header>
  );
}
