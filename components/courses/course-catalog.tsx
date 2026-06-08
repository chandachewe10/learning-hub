"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseCard } from "./course-card";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CourseCatalogProps {
  initialParams: Record<string, string | undefined>;
  categories: Category[];
}

const LEVELS = ["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function CourseCatalog({ initialParams, categories }: CourseCatalogProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(initialParams.q || "");
  const [category, setCategory] = useState(initialParams.category || "");
  const [level, setLevel] = useState(initialParams.level || "ALL");
  const [sort, setSort] = useState(initialParams.sort || "newest");
  const [priceFilter, setPriceFilter] = useState(initialParams.price || "all");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (level && level !== "ALL") params.set("level", level);
    if (sort) params.set("sort", sort);
    if (priceFilter && priceFilter !== "all") params.set("price", priceFilter);
    params.set("page", String(page));
    params.set("limit", "12");

    try {
      const res = await fetch(`/api/courses?${params}`);
      const data = await res.json();
      setCourses(data.courses || []);
      setTotal(data.total || 0);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, level, sort, priceFilter, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("ALL");
    setSort("newest");
    setPriceFilter("all");
    setPage(1);
  };

  const hasFilters = search || category || level !== "ALL" || priceFilter !== "all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`lg:w-64 shrink-0 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
          <div className="bg-white rounded-xl border p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" />Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Category</h4>
              <div className="space-y-1">
                <button
                  onClick={() => setCategory("")}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!category ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${category === cat.name ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Level</h4>
              <div className="space-y-1">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${level === lvl ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {lvl === "ALL" ? "All Levels" : lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Price</h4>
              <div className="space-y-1">
                {[
                  { value: "all", label: "All" },
                  { value: "free", label: "Free" },
                  { value: "paid", label: "Paid" },
                  { value: "subscription", label: "Subscription Only" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setPriceFilter(value)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${priceFilter === value ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search & toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
              <div className="hidden sm:flex gap-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {search}
                  <button onClick={() => setSearch("")}><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {category && (
                <Badge variant="secondary" className="gap-1">
                  {category}
                  <button onClick={() => setCategory("")}><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {level !== "ALL" && (
                <Badge variant="secondary" className="gap-1">
                  {level}
                  <button onClick={() => setLevel("ALL")}><X className="w-3 h-3" /></button>
                </Badge>
              )}
            </div>
          )}

          {/* Results count */}
          <p className="text-sm text-slate-500 mb-4">
            {loading ? "Loading..." : `${total} course${total !== 1 ? "s" : ""} found`}
          </p>

          {/* Course grid */}
          {loading ? (
            <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse">
                  <div className="aspect-video bg-slate-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">No courses found</h3>
              <p className="text-slate-500 text-sm mb-4">Try adjusting your search or filters</p>
              <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
            </div>
          ) : (
            <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {(courses as Parameters<typeof CourseCard>[0]["course"][]).map((course) => (
                <CourseCard key={(course as { id: string }).id} course={course} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 12 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-slate-600">
                Page {page} of {Math.ceil(total / 12)}
              </span>
              <Button
                variant="outline"
                disabled={page >= Math.ceil(total / 12)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
