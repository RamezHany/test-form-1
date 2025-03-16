export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="text-center">
        <div className="mb-8 mx-auto">
          <img 
            src="/globe.svg" 
            alt="Registration System Logo" 
            className="w-56 h-56 object-contain mx-auto"
          />
        </div>
        <h1 className="text-5xl font-bold text-blue-800 mb-3">Registration System</h1>
        <p className="text-3xl text-blue-600 font-light tracking-wide">Creativa</p>
      </div>
    </div>
  );
}
