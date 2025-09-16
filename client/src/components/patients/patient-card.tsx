import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Mail, Phone, Calendar, MoreVertical, Edit, Trash2, TestTube, FileText, Eye } from "lucide-react";
import type { Patient } from "@shared/schema";

interface PatientCardProps {
  patient: Patient;
  onViewDetails?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  onAddLab?: (patient: Patient) => void;
  onAssignProtocol?: (patient: Patient) => void;
}

export default function PatientCard({ 
  patient, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onAddLab, 
  onAssignProtocol 
}: PatientCardProps) {
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getStageColor = (stage: string) => {
    if (stage.toLowerCase().includes('iv') || stage.toLowerCase().includes('4')) {
      return 'destructive';
    }
    if (stage.toLowerCase().includes('iii') || stage.toLowerCase().includes('3')) {
      return 'secondary';
    }
    if (stage.toLowerCase().includes('ii') || stage.toLowerCase().includes('2')) {
      return 'outline';
    }
    return 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateBMI = () => {
    if (!patient.height || !patient.weight) return null;
    const heightM = parseFloat(patient.height.toString()) / 100;
    const weightKg = parseFloat(patient.weight.toString());
    return (weightKg / (heightM * heightM)).toFixed(1);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`card-patient-${patient.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-medium text-primary">
                {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground" data-testid={`text-patient-name-${patient.id}`}>
                {patient.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Age {calculateAge(patient.dateOfBirth)}
              </p>
            </div>
          </div>
          <Badge variant={getStageColor(patient.cancerStage)} data-testid={`badge-stage-${patient.id}`}>
            {patient.cancerStage}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cancer Type:</span>
            <span className="font-medium text-foreground" data-testid={`text-cancer-type-${patient.id}`}>
              {patient.cancerType}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Diagnosed:</span>
            <span className="font-medium text-foreground">
              {formatDate(patient.diagnosisDate)}
            </span>
          </div>

          {patient.email && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span>{patient.email}</span>
            </div>
          )}

          {patient.phone && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{patient.phone}</span>
            </div>
          )}

          {patient.height && patient.weight && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">BMI:</span>
              <span className="font-medium text-foreground">
                {calculateBMI()}
              </span>
            </div>
          )}

          {patient.metastasisLocations && patient.metastasisLocations.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Metastasis:</p>
              <div className="flex flex-wrap gap-1">
                {patient.metastasisLocations.map((location, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {location}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails?.(patient)}
            data-testid={`button-view-patient-${patient.id}`}
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onEdit?.(patient)}
            data-testid={`button-edit-patient-${patient.id}`}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" data-testid={`button-actions-${patient.id}`}>
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAddLab?.(patient)} data-testid={`action-add-lab-${patient.id}`}>
                <TestTube className="h-3 w-3 mr-2" />
                Add Lab Results
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignProtocol?.(patient)} data-testid={`action-assign-protocol-${patient.id}`}>
                <FileText className="h-3 w-3 mr-2" />
                Assign Protocol
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(patient)} 
                className="text-destructive"
                data-testid={`action-delete-${patient.id}`}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete Patient
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
