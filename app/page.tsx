import AdventureMap from "./components/AdventureMap";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50/60 to-emerald-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Playful Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 opacity-40">
        <div className="absolute top-10 left-8 text-5xl sm:text-6xl animate-pulse">
          ☁️
        </div>
        <div className="absolute top-24 right-16 text-5xl sm:text-7xl animate-pulse delay-700">
          ☁️
        </div>
        <div className="absolute top-1/2 left-4 text-3xl animate-bounce">
          🎈
        </div>
        <div className="absolute top-1/3 right-8 text-4xl animate-bounce delay-500">
          ✨
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-6 sm:py-12">
        <AdventureMap />
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-slate-500 text-sm font-medium">
        <p>🌟 Läroäventyret – Roliga och magiska uppdrag för nyfikna barn</p>
      </footer>
    </div>
  );
}

