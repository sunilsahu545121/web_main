// @ts-nocheck
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User, FileText } from 'lucide-react';
import { generateIdCard } from '@/lib/pdf/generateIdCard';
import { generateJoiningLetter } from '@/lib/pdf/generateJoiningLetter';
import { toast } from 'sonner';

export function DocumentGenerator() {
  const [idForm, setIdForm] = useState({ name: '', role: 'hub', id: '', phone: '', zone: '', validUntil: '2026-12-31' });
  const [letterForm, setLetterForm] = useState({
    staffName: '', role: 'hub', zone: '', joiningDate: new Date().toISOString().split('T')[0], salary: 25000,
    terms: ['Maintain operational KPIs as defined weekly.', 'Submit daily reconciliation reports.', 'Adhere to Krixify Code of Conduct.'],
  });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle><User className="mr-2 inline h-4 w-4" /> Generate ID Card</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Full name" value={idForm.name} onChange={(e) => setIdForm({ ...idForm, name: e.target.value })} />
          <Input placeholder="Role (hub/franchise/etc)" value={idForm.role} onChange={(e) => setIdForm({ ...idForm, role: e.target.value })} />
          <Input placeholder="User ID (UUID)" value={idForm.id} onChange={(e) => setIdForm({ ...idForm, id: e.target.value })} />
          <Input placeholder="Phone" value={idForm.phone} onChange={(e) => setIdForm({ ...idForm, phone: e.target.value })} />
          <Input placeholder="Zone" value={idForm.zone} onChange={(e) => setIdForm({ ...idForm, zone: e.target.value })} />
          <Input type="date" value={idForm.validUntil} onChange={(e) => setIdForm({ ...idForm, validUntil: e.target.value })} />
          <Button onClick={() => {
            if (!idForm.name || !idForm.id) return toast.error('Name and ID are required');
            generateIdCard(idForm);
            toast.success('ID Card generated');
          }} className="w-full">Generate ID Card</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle><FileText className="mr-2 inline h-4 w-4" /> Generate Joining Letter</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Staff name" value={letterForm.staffName} onChange={(e) => setLetterForm({ ...letterForm, staffName: e.target.value })} />
          <Input placeholder="Role" value={letterForm.role} onChange={(e) => setLetterForm({ ...letterForm, role: e.target.value })} />
          <Input placeholder="Zone" value={letterForm.zone} onChange={(e) => setLetterForm({ ...letterForm, zone: e.target.value })} />
          <Input type="date" value={letterForm.joiningDate} onChange={(e) => setLetterForm({ ...letterForm, joiningDate: e.target.value })} />
          <Input type="number" placeholder="Salary (₹)" value={letterForm.salary} onChange={(e) => setLetterForm({ ...letterForm, salary: Number(e.target.value) })} />
          <Button onClick={() => {
            if (!letterForm.staffName) return toast.error('Staff name is required');
            generateJoiningLetter(letterForm);
            toast.success('Joining letter generated');
          }} className="w-full">Generate Joining Letter</Button>
        </CardContent>
      </Card>
    </div>
  );
}
