import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";

const FloatingButton = ({ routes }: { routes: { path: string; label: string }[] }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsOpen(false); // Close the dropdown after navigation
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end">
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="bg-white shadow-lg rounded-lg mb-2 p-2 w-48">
          {routes.map((route, index) => (
            <button
              key={index}
              onClick={() => handleNavigate(route.path)}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition text-black"
            >
              {route.label}
            </button>
          ))}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all relative"
        aria-label="Select Route"
      >
        {isOpen ? <ChevronDown className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default FloatingButton;
