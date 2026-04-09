"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Color map for status badges — keeps the JSX clean
const statusColors: Record<string, string> = {
  "For Sale":  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "For Rent":  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "For Lease": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export default function Home() {
  // Forgiving 'any' for a quick assessment build
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Track all search form states
  const [filters, setFilters] = useState({ suburb: "", type: "", price: "", status: "" });

  // Hit the backend and pull fresh listings
  const fetchListings = async () => {
    setLoading(true);
    const params = new URLSearchParams();

    // Only append filters the user actually filled in
    if (filters.suburb) params.append("suburb", filters.suburb);
    if (filters.type)   params.append("type",   filters.type);
    if (filters.status) params.append("status", filters.status);
    if (filters.price)  params.append("price",  filters.price);

    try {
      const res  = await fetch(`/api/listings?${params.toString()}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error("Oops, failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fire on mount
  useEffect(() => { fetchListings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Shared select styles — one place to rule them all
  const selectCls = "w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans">

      {/* Top Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
              TKraft <span className="text-blue-600">Real Estate</span>
            </h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500">Nepal&apos;s trusted property platform</p>
          </div>
          <span className="text-sm text-gray-500 dark:text-zinc-400">{data.length} listings</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Search Filters */}
        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Filter Properties</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <select className={selectCls} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House / Bungalow</option>
              <option value="Flat">Flat</option>
              <option value="Land">Land</option>
              <option value="Business">Business</option>
            </select>

            <select className={selectCls} onChange={(e) => setFilters({ ...filters, suburb: e.target.value })}>
              <option value="">All Locations</option>
              <option value="Kathmandu">Kathmandu</option>
              <option value="Lalitpur">Lalitpur</option>
              <option value="Bhaktapur">Bhaktapur</option>
            </select>

            <select className={selectCls} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="For Sale">For Sale</option>
              <option value="For Rent">For Rent</option>
              <option value="For Lease">For Lease</option>
            </select>

            <select className={selectCls} onChange={(e) => setFilters({ ...filters, price: e.target.value })}>
              <option value="">Any Price</option>
              <option value="0-10000000">Below Rs. 1 Cr</option>
              <option value="10000000-20000000">1 – 2 Crore</option>
              <option value="20000000-40000000">2 – 4 Crore</option>
              <option value="40000000-60000000">4 – 6 Crore</option>
              <option value="60000000-100000000">6 – 10 Crore</option>
              <option value="100000000">10+ Crore</option>
            </select>

            <button
              onClick={fetchListings}
              className="col-span-2 md:col-span-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all shadow-sm"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </section>

        {/* Property Grid */}
        {data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
              >
                {/* Card Header */}
                <div className="p-5 flex-1 space-y-3">

                  {/* Status + Type badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
                      {p.property_type}
                    </span>
                  </div>

                  <h2 className="font-semibold text-gray-900 dark:text-zinc-100 text-base leading-snug">
                    {p.title}
                  </h2>

                  {/* Location */}
                  <p className="text-xs text-gray-500 dark:text-zinc-500 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {p.suburb}
                  </p>

                  {/* Price — uses en-IN for proper lakh/crore formatting */}
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                    Rs. {Number(p.price).toLocaleString("en-IN")}
                    {p.status !== "For Sale" && <span className="text-xs font-normal text-gray-400 ml-1">/month</span>}
                  </p>
                </div>

                {/* Card Footer - Beds/Baths + CTA */}
                <div className="border-t border-gray-100 dark:border-zinc-800 px-5 py-3 flex items-center justify-between">
                  {/* Show bed/bath only if relevant */}
                  {p.bedrooms > 0 ? (
                    // Residential: show bed + bath counts
                    <span className="text-xs text-gray-500 dark:text-zinc-500 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                        {p.bedrooms} Beds
                      </span>
                      <span className="text-gray-200 dark:text-zinc-700">|</span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="7"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="7" x2="7" y1="19" y2="21"/><line x1="17" x2="17" y1="19" y2="21"/></svg>
                        {p.bathrooms} Baths
                      </span>
                    </span>
                  ) : p.property_type === 'Land' ? (
                    // Land: map + area icon
                    <span className="text-xs text-gray-500 dark:text-zinc-500 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
                      Open Land Plot
                    </span>
                  ) : (
                    // Business / Commercial: building icon
                    <span className="text-xs text-gray-500 dark:text-zinc-500 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
                      Commercial Space
                    </span>
                  )}

                  <Link
                    href={`/listings/${p.id}`}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty state — shown when filters return nothing
          <div className="text-center py-20 text-gray-400 dark:text-zinc-600">
            <p className="text-4xl mb-3">🏚️</p>
            <p className="font-medium">No properties found.</p>
            <p className="text-sm mt-1">Try loosening the filters a bit?</p>
          </div>
        )}

      </div>
    </main>
  );
}