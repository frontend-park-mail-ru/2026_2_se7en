export default function Button({ text, onClick, variant = 'primary' }) {
  const baseStyle = 'px-6 py-2 rounded-lg font-medium transition-all duration-200';
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]}`}>
      {text}
    </button>
  );
}
