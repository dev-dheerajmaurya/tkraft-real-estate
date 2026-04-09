"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";

// Same status colors as the listing grid — consistency matters
const statusColors: Record<string, string> = {
  "For Sale":  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "For Rent":  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "For Lease": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

// Unwrap Next.js 15+ async route params the right way
export default function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [property, setProperty] = useState<any>(null);

  // Drives the RBAC demo — flips the header sent to the API
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Re-fetches whenever ID or admin toggle changes
    fetch(`/api/listings/${id}`, {
      headers: { "x-user-role": isAdmin ? "admin" : "viewer" },
    })
      .then((res) => res.json())
      .then((data) => setProperty(data.data))
      .catch((err) => console.error("Could not grab property details.", err));
  }, [id, isAdmin]);

  // Gentle pulse while the API does its thing
  if (!property) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-gray-400 dark:text-zinc-500 animate-pulse">Loading property...</p>
      </main>
    );
  }

  const isRental = property.status !== "For Sale";

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans">

      {/* Matches the listing page header for consistent nav */}
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:underline">
            ← Back to listings
          </Link>
          <span className="text-xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
            TKraft <span className="text-blue-600">Real Estate</span>
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Property detail card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">

          {/* Full-width hero photo */}
          <div className="h-72 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
            <img
              src={`/images/listings-${property.id}.png`}
              alt={property.title}
              className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          {/* Title, badges, price block */}
          <div className="p-6 space-y-4 border-b border-gray-100 dark:border-zinc-800">

            {/* Color-coded status + type pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[property.status] ?? "bg-gray-100 text-gray-600"}`}>
                {property.status}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
                {property.property_type}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 leading-snug">
              {property.title}
            </h1>

            {/* Suburb with a map pin */}
            <p className="text-sm text-gray-500 dark:text-zinc-500 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {property.suburb}
            </p>

            {/* en-IN locale = proper lakhs/crores display */}
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                Rs. {Number(property.price).toLocaleString("en-IN")}
                {isRental && <span className="text-base font-normal text-gray-400 ml-1">/month</span>}
              </p>
            </div>
          </div>

          {/* Smart stat row — changes icon based on type */}
          {property.bedrooms > 0 ? (
            // Residential — show beds and baths
            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-zinc-800 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 px-6 py-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                <div>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">Bedrooms</p>
                  <p className="font-semibold text-gray-800 dark:text-zinc-200">{property.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-6 py-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="7"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="7" x2="7" y1="19" y2="21"/><line x1="17" x2="17" y1="19" y2="21"/></svg>
                <div>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">Bathrooms</p>
                  <p className="font-semibold text-gray-800 dark:text-zinc-200">{property.bathrooms}</p>
                </div>
              </div>
            </div>
          ) : property.property_type === 'Land' ? (
            // Land — terrain map icon
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
              <div>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Property Type</p>
                <p className="font-semibold text-gray-800 dark:text-zinc-200">Open Land Plot</p>
              </div>
            </div>
          ) : (
            // Business/commercial — building icon
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
              <div>
                <p className="text-xs text-gray-400 dark:text-zinc-500">Property Type</p>
                <p className="font-semibold text-gray-800 dark:text-zinc-200">Commercial Space</p>
              </div>
            </div>
          )}

          {/* Description + agent info */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">About this property</p>
              <p className="text-gray-700 dark:text-zinc-300 leading-relaxed text-sm">{property.description}</p>
            </div>

            {/* Agent card with avatar initial */}
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 flex items-start gap-3 border border-gray-100 dark:border-zinc-700">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                {property.agent_name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Listed by</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{property.agent_name}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-500">{property.agent_email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RBAC toggle — the star of this assessment */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Role-Based Access Demo</p>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              {/* Pretty toggle switch — beats a raw checkbox */}
              <div className="w-10 h-6 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-600 rounded-full transition-colors" />
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Simulate Admin Role
            </span>
          </label>

          {/* Admin notes — only visible if the backend chose to reveal them */}
          {isAdmin && property.internal_status_notes && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Internal Note (Admin Only)</p>
              <p className="text-sm text-red-800 dark:text-red-300">{property.internal_status_notes}</p>
            </div>
          )}

          {isAdmin && !property.internal_status_notes && (
            <p className="mt-3 text-xs text-gray-400 dark:text-zinc-600 italic">No internal notes for this listing.</p>
          )}
        </div>

      </div>
    </main>
  );
}