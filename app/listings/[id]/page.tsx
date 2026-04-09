"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";

// Destructure Next 15+ async params
export default function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [property, setProperty] = useState<any>(null);
  
  // Toggle admin state for assessment demo!
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Fetch backend passing the simulated role
    fetch(`/api/listings/${id}`, {
      headers: { 
        'x-user-role': isAdmin ? 'admin' : 'viewer' 
      }
    })
      .then((res) => res.json())
      .then((data) => setProperty(data.data))
      .catch((err) => console.error("Could not grab property details.", err));
  }, [id, isAdmin]);

  if (!property) {
    return <p className="p-6">Loading details...</p>;
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4 font-sans">
      <Link href="/" className="text-blue-500 dark:text-blue-400 font-medium hover:underline">
        &larr; Back to Search
      </Link>
      
      <div className="border dark:border-zinc-700 p-6 rounded-lg bg-white dark:bg-zinc-800 shadow-sm space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">{property.title}</h1>
        
        <div className="flex justify-between border-b dark:border-zinc-700 pb-4">
          <p className="text-gray-600 dark:text-zinc-400">{property.suburb} • {property.property_type}</p>
             <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  Rs. {Number(property.price).toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 flex items-center justify-end gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                  {property.bedrooms} Beds 
                  <span className="mx-2 text-gray-300 dark:text-zinc-600">|</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="7"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="7" x2="7" y1="19" y2="21"/><line x1="17" x2="17" y1="19" y2="21"/></svg>
                  {property.bathrooms} Baths
                </p>
             </div>
        </div>

        <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">{property.description}</p>
        <p className="bg-gray-50 dark:bg-zinc-900 dark:text-zinc-400 p-3 text-sm rounded border dark:border-zinc-700">
          Agent: {property.agent_name} ({property.agent_email})
        </p>
        
        {/* Assessment Admin Toggle UI */}
        <label className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400 mt-6 pt-4 border-t dark:border-zinc-700 cursor-pointer">
          <input 
            type="checkbox" 
            checked={isAdmin} 
            onChange={(e) => setIsAdmin(e.target.checked)} 
            className="w-4 h-4 rounded" 
          />
          Simulate Admin Role
        </label>
        
        {/* Render notes only if backend sent them */}
        {isAdmin && property.internal_status_notes && (
          <p className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded border border-red-200 dark:border-red-800/50">
             Admin Meta: {property.internal_status_notes}
          </p>
        )}
      </div>
    </main>
  );
}