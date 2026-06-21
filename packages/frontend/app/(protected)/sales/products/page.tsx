"use client";

import { useEffect, useState, useMemo } from "react";
import { getProducts } from "../../../../lib/client/modules/product";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductPreview } from "@/types/product";

type SortField = "name" | "reference" | "price" | "quantity" | "supplierId";
type SortOrder = "ASC" | "DESC";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function Products() {
  const [products, setProducts] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("ASC");
  const [inStockFilter, setInStockFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: currentPage,
          limit: itemsPerPage,
          sortBy: sortField,
          order: sortOrder,
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        if (inStockFilter === "in_stock") {
          params.inStock = true;
        } else if (inStockFilter === "out_of_stock") {
          params.inStock = false;
        }

        const response = await getProducts(params);

        setProducts(response.data || []);

        if (response.pagination) {
          setPagination(response.pagination);
        }

        setError("");
      } catch (err: any) {
        setError("Failed to fetch products: " + (err.message || err));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearch,
    sortField,
    sortOrder,
    inStockFilter,
  ]);

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortField(field);
      setSortOrder("ASC");
    }
    setCurrentPage(1);
  };

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    return sortOrder === "ASC" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const router = useRouter();

  // Pagination controls
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < pagination.totalPages;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (pagination.totalPages <= maxVisible) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(pagination.totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < pagination.totalPages - 2) {
        pages.push("...");
      }

      pages.push(pagination.totalPages);
    }

    return pages;
  }, [currentPage, pagination.totalPages]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Prodotti</span>
            <Badge variant="outline">{pagination.totalItems} totali</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ricerca prodotti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={inStockFilter} onValueChange={setInStockFilter}>
              <SelectTrigger className="w-full sm:w-45">
                <SelectValue placeholder="Stock status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i prodotti</SelectItem>
                <SelectItem value="in_stock">In stock</SelectItem>
                <SelectItem value="out_of_stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={itemsPerPage.toString()}
              onValueChange={(v) => {
                setItemsPerPage(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per pagina</SelectItem>
                <SelectItem value="25">25 per pagina</SelectItem>
                <SelectItem value="50">50 per pagina</SelectItem>
                <SelectItem value="100">100 per pagina</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Table */}
          {!loading && products.length > 0 && (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Foto</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("name")}
                          className="h-auto p-0 hover:bg-transparent font-semibold"
                        >
                          Nome articolo
                          {renderSortIcon("name")}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("reference")}
                          className="h-auto p-0 hover:bg-transparent font-semibold"
                        >
                          Codice
                          {renderSortIcon("reference")}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("supplierId")}
                          className="h-auto p-0 hover:bg-transparent font-semibold"
                        >
                          Fornitore
                          {renderSortIcon("supplierId")}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("price")}
                          className="h-auto p-0 hover:bg-transparent font-semibold"
                        >
                          Prezzo
                          {renderSortIcon("price")}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("quantity")}
                          className="h-auto p-0 hover:bg-transparent font-semibold"
                        >
                          Stock
                          {renderSortIcon("quantity")}
                        </Button>
                      </TableHead>
                      <TableHead className="w-20">Varianti</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      // DOPO:
                      <TableRow
                        key={p.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push(`/products/${p.id}`)}
                      >
                        <TableCell>
                          {p.coverImage ? (
                            <img
                              src={p.coverImage}
                              alt={p.name || "Product"}
                              title={p.name || "Product"}
                              className="h-12 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-muted flex items-center justify-center rounded">
                              <span className="text-xs text-muted-foreground">
                                No Image
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {p.name || "N/A"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {p.reference}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {p.supplierId || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          €{p.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={p.quantity > 0 ? "default" : "destructive"}
                          >
                            {p.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {p.variantCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, pagination.totalItems)}{" "}
                  of {pagination.totalItems} products
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(1)}
                    disabled={!canGoPrevious}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={!canGoPrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex gap-1">
                    {pageNumbers.map((page, idx) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 py-2 text-muted-foreground"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          onClick={() => goToPage(page as number)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={!canGoNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(pagination.totalPages)}
                    disabled={!canGoNext}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
              {(searchTerm || inStockFilter !== "all") && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm("");
                    setInStockFilter("all");
                  }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
