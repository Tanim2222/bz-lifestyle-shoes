export default function Spinner({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <div
      className={`${className} rounded-full border-2 border-white/20 border-t-teal-400 animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}
