"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getVisiblePages = () => {
    // Show up to 5 pages
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-[#4A5568]">
        Page <span className="font-bold text-[#0D1236]">{currentPage}</span> of <span className="font-bold text-[#0D1236]">{totalPages}</span>
      </div>
      
      <div className="flex gap-2">
        <Link
          href={buildUrl(Math.max(1, currentPage - 1))}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
            currentPage === 1
              ? "bg-[#F8F9FE] text-[#A0AABF] pointer-events-none"
              : "bg-[#FFFFFF] text-[#4A5568] hover:bg-[#F8F9FE] border border-[#E2E8F0] shadow-sm hover:text-[#0D1236]"
          }`}
          aria-disabled={currentPage === 1}
        >
          Previous
        </Link>
        
        <div className="hidden sm:flex gap-1">
          {getVisiblePages().map((page) => (
            <Link
              key={page}
              href={buildUrl(page)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                currentPage === page
                  ? "bg-[#F4A261] text-[#FFFFFF] shadow-sm hover:bg-[#e28f4f]"
                  : "bg-[#FFFFFF] text-[#4A5568] hover:bg-[#F8F9FE] hover:text-[#0D1236] border border-[#E2E8F0] shadow-sm"
              }`}
            >
              {page}
            </Link>
          ))}
        </div>

        <Link
          href={buildUrl(Math.min(totalPages, currentPage + 1))}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
            currentPage === totalPages
              ? "bg-[#F8F9FE] text-[#A0AABF] pointer-events-none"
              : "bg-[#FFFFFF] text-[#4A5568] hover:bg-[#F8F9FE] hover:text-[#0D1236] border border-[#E2E8F0] shadow-sm"
          }`}
          aria-disabled={currentPage === totalPages}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
