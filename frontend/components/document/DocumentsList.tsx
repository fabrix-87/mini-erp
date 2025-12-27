"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Plus, Eye, Edit2, Trash2, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge, DocTypeBadge } from "@/components/document/Badges";
import { FilterPanel } from "@/components/document/FilterPanel";
import { Document, DocumentListFilters, DocumentType } from "@/types/document";
import { deleteDocument, getDocuments } from "@/lib/client/modules/document";

interface DocumentsListProps {
  documentType?: DocumentType;
}

export function DocumentsList({ documentType }: DocumentsListProps): ReactNode {
  const [loading, setLoading] = useState(false)
  const params = useParams();
  const type = (params.type as string) || documentType || "quote";

  const [documents, setDocuments] = useState<Document[]>([]);
  const [filters, setFilters] = useState<DocumentListFilters>({
    page: 1,
    limit: 20,
    documentType: type,
  });
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleFilterChange = (
    key: keyof DocumentListFilters,
    value: string
  ): void => {
    setFilters({ ...filters, [key]: value });
  };

  const handleClearFilters = (): void => {
    setFilters({ page: 1, limit: 20, documentType: type });
  };

  // Fetch Documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      const response = await getDocuments(filters)
      setDocuments(response.data)
      setLoading(false)
    };

    fetchDocuments();
  }, [filters]);

  const handleDelete = async (): Promise<void> => {
    if (deleteId) {
      const response = await deleteDocument(deleteId);
      if (response.status !== "success") {
        console.error("Errore eliminazione:", response.errors);
      }
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Cerca per cliente o numero documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Importo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assegnato a</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="text-muted-foreground" size={48} />
                    <p className="text-muted-foreground">
                      Nessun documento trovato
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <DocTypeBadge type={doc.documentType} />
                      <span className="font-medium text-sm">
                        {doc.documentNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{doc.customerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(doc.documentDate).toLocaleDateString("it-IT")}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    €{doc.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status as any} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {doc.assignedUserId}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          ⋮
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/documents/${type}/${doc.id}`}>
                            <Eye size={16} className="mr-2" />
                            Visualizza
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/documents/${type}/${doc.id}`}>
                            <Edit2 size={16} className="mr-2" />
                            Modifica
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(doc.id)}
                          className="text-red-600"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Elimina documento</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler eliminare questo documento? Questa azione non
            può essere annullata.
          </AlertDialogDescription>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Elimina
          </AlertDialogAction>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
