export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
    {/* <footer className="border-t bg-white mt-auto"> */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} MA Home. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-700 transition">Terms</a>
          <a href="#" className="hover:text-gray-700 transition">Privacy</a>
          <a href="#" className="hover:text-gray-700 transition">Contact</a>
        </div>
      </div>
    </footer>
  );
}