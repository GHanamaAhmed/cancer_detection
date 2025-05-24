"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchInputProps {
  initialSearchQuery?: string;
}

export default function ChatSearch({
  initialSearchQuery = "",
}: SearchInputProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // Handle input changes without immediate search
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle form submission (Enter key press)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Update URL and trigger search
    const url = new URL(window.location.href);
    url.searchParams.set("query", searchQuery);

    // Using router.push for client-side navigation with proper history
    router.push(url.toString());
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        type="search"
        placeholder="Search..."
        className="pl-8 w-full"
        value={searchQuery}
        onChange={handleChange}
        // Add explicit handling for Enter key if needed
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}
