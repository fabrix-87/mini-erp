'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginationInfo } from '@/types/api';

interface ContactPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export default function ContactPagination({ pagination, onPageChange }: ContactPaginationProps) {
  return (
    <div className="bg-white rounded-lg shadow mt-4 px-6 py-4 flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Mostrando{' '}
        <span className="font-medium">
          {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
        </span>
        {' '}a{' '}
        <span className="font-medium">
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalPages)}
        </span>
        {' '}di{' '}
        <span className="font-medium">{pagination.totalPages}</span> risultati
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Precedente
        </Button>
        <span className="text-sm text-gray-700">
          Pagina {pagination.currentPage} di {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          Successiva
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
