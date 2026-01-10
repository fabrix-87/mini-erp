import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { DocumentLine, DocumentLineDTO } from '@/types/document';

interface DocumentLineRowProps {
  line: DocumentLine | DocumentLineDTO;
  index: number;
  onUpdate: (index: number, line: DocumentLineDTO) => void;
  onDelete: (index: number) => void;
}

export function DocumentLineRow({
  line,
  index,
  onUpdate,
  onDelete
}: DocumentLineRowProps): ReactNode {
  const handleChange = (field: keyof DocumentLine, value: string | number) => {
    const numValue = ['quantity', 'unitPrice', 'discountPercent', 'taxPercent'].includes(field)
      ? parseFloat(String(value))
      : value;
    onUpdate(index, { ...line, [field]: numValue });
  };

  const quantity = parseFloat(String(line.quantity)) || 0;
  const unitPrice = parseFloat(String(line.unitPrice)) || 0;
  const discount = parseFloat(String(line.discountPercent)) || 0;
  const tax = parseFloat(String(line.taxPercent)) || 22;

  const lineTotal = quantity * unitPrice;
  const discountAmount = (lineTotal * discount) / 100;
  const taxableAmount = lineTotal - discountAmount;
  const taxAmount = (taxableAmount * tax) / 100;
  const lineTotalWithTax = taxableAmount + taxAmount;

  return (
    <Card className="p-4">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3">
          <Label className="text-xs mb-2 block">Nome Articolo</Label>
          <Input
            value={line.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nome articolo"
          />
        </div>

        <div className="col-span-1">
          <Label className="text-xs mb-2 block">Qtà</Label>
          <Input
            type="number"
            value={line.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            step="0.01"
            min="0"
          />
        </div>

        <div className="col-span-1.5">
          <Label className="text-xs mb-2 block">Prezzo Unit.</Label>
          <Input
            type="number"
            value={line.unitPrice}
            onChange={(e) => handleChange('unitPrice', e.target.value)}
            step="0.01"
            min="0"
          />
        </div>

        <div className="col-span-1">
          <Label className="text-xs mb-2 block">Sconto %</Label>
          <Input
            type="number"
            value={line.discountPercent}
            onChange={(e) => handleChange('discountPercent', e.target.value)}
            step="0.01"
            min="0"
            max="100"
          />
        </div>

        <div className="col-span-1.5">
          <Label className="text-xs mb-2 block">IVA %</Label>
          <Input
            type="number"
            value={line.taxPercent}
            onChange={(e) => handleChange('taxPercent', e.target.value)}
            step="0.01"
            min="0"
          />
        </div>

        <div className="col-span-1.5">
          <Label className="text-xs mb-2 block">Totale</Label>
          <div className="px-3 py-2 text-sm font-semibold bg-muted rounded-md">
            €{lineTotalWithTax.toFixed(2)}
          </div>
        </div>

        <div className="col-span-0.5 flex items-end">
          <Button
            onClick={() => onDelete(index)}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}