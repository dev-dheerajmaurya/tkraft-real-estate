"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  // Forgiving 'any' type for a quick assessment build
  const [data, setData] = useState<any[]>([]);
  
  // Track search form states
  const [filters, setFilters] = useState({ 
    suburb: "", 
    type: "", 
    price: "", 
    status: "" 
  });

  // Fetch listings from the backend API
  const fetchListings = async () => {
    const params = new URLSearchParams();
    
    // Send only populated filters
    if (filters.suburb) params.append("suburb", filters.suburb);
    if (filters.type) params.append("type", filters.type);
    if (filters.status) params.append("status", filters.status);
    if (filters.price) params.append("price", filters.price);
    
    try {
      const response = await fetch(`/api/listings?${params.toString()}`);
      const json = await response.json();
      setData(json.data || []);
    } catch (err) {
      console.error("Oops, failed to fetch listings:", err);
    }
  };

  // Load on mount
  useEffect(() => { 
    fetchListings(); 
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6 font-sans">
      <h1 className="text-3xl font-bold">TKraft Real Estate</h1>
      
      {/* Search Bar Block */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-100 rounded-lg shadow-sm items-center">
        <select 
          className="p-3 border rounded text-gray-700 w-full" 
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Apartment">Apartments</option>
          <option value="Land">Land</option>
          <option value="Business">Business</option>
          <option value="Flat">Flat</option>
          <option value="House">House/Banglow</option>
        </select>
        
        <select 
          className="p-3 border rounded text-gray-700 w-full" 
          onChange={(e) => setFilters({ ...filters, suburb: e.target.value })}
        >
          <option value="">All Locations</option>
          <option value="Kathmandu">Kathmandu</option>
          <option value="Lalitpur">Lalitpur</option>
          <option value="Bhaktapur">Bhaktapur</option>
        </select>

        <select 
          className="p-3 border rounded text-gray-700 w-full" 
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="For Rent">For Rent</option>
          <option value="For Sale">For Sale</option>
          <option value="For Lease">For Lease</option>
        </select>

        <select 
          className="p-3 border rounded text-gray-700 w-full" 
          onChange={(e) => setFilters({ ...filters, price: e.target.value })}
        >
          <option value="">Price</option>
          <option value="0-10000000">Below 1 Crore</option>
          <option value="10000000-20000000">1-2 Crores</option>
          <option value="20000000-40000000">2-4 Crores</option>
          <option value="40000000-60000000">4-6 Crores</option>
          <option value="60000000-80000000">6-8 Crores</option>
          <option value="80000000-100000000">8-10 Crores</option>
          <option value="100000000">10+ Crores</option>
        </select>

        <button 
          className="bg-gray-900 text-white p-3 rounded font-bold hover:bg-black w-full col-span-2 md:col-span-1 shadow" 
          onClick={fetchListings}
        >
          SEARCH
        </button>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((p) => (
          <div key={p.id} className="border p-4 bg-white rounded-lg shadow-sm hover:shadow-md">
            <h2 className="font-bold text-lg mb-1">{p.title}</h2>
            <p className="text-sm text-gray-600">{p.suburb} • {p.property_type}</p>
            
            <div className="flex justify-between items-center my-4">
               {/* 'en-IN' forces Lakhs/Crores formatting! */}
               <span className="text-blue-600 font-extrabold">
                 Rs. {Number(p.price).toLocaleString('en-IN')}
               </span>
               <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                 {p.bedrooms}
                 <span className="mx-1 text-gray-300">|</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="7"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="7" x2="7" y1="19" y2="21"/><line x1="17" x2="17" y1="19" y2="21"/></svg>
                 {p.bathrooms}
               </span>
            </div>

            <Link href={`/listings/${p.id}`} className="block w-full text-center bg-gray-800 text-white py-2 rounded">
              View Details
            </Link>
          </div>
        ))}
      </div>
      
      {/* Clean empty state handler */}
      {data.length === 0 && (
        <p className="text-gray-500">No properties found. Try loosening the filters?</p>
      )}
    </main>
  );
}