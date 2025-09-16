import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, X, Minus, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PatientProtocolItem, AdherenceRecord, InsertAdherenceRecord } from "@shared/schema";

interface AdherenceTrackerProps {
  patientProtocolId: string;
}

export default function AdherenceTracker({ patientProtocolId }: AdherenceTrackerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items } = useQuery<PatientProtocolItem[]>({
    queryKey: ["/api/patient-protocols", patientProtocolId, "items"],
  });

  const { data: adherenceRecords } = useQuery<AdherenceRecord[]>({
    queryKey: ["/api/adherence", "records", format(selectedDate, 'yyyy-MM-dd')],
    enabled: !!items,
  });

  const recordAdherenceMutation = useMutation({
    mutationFn: async (recordData: InsertAdherenceRecord) => {
      const response = await apiRequest("POST", "/api/adherence", recordData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adherence"] });
      toast({
        title: "Success",
        description: "Adherence recorded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record adherence",
        variant: "destructive",
      });
    },
  });

  const getItemAdherence = (itemId: string) => {
    return adherenceRecords?.find(record => 
      record.patientProtocolItemId === itemId && 
      record.date === format(selectedDate, 'yyyy-MM-dd')
    );
  };

  const handleAdherenceChange = (itemId: string, status: 'done' | 'skipped' | 'missed') => {
    recordAdherenceMutation.mutate({
      patientProtocolItemId: itemId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status,
      notes: ""
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'done':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'skipped':
        return <Minus className="h-4 w-4 text-yellow-600" />;
      case 'missed':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Daily Adherence Tracker</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" data-testid="button-select-date">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {format(selectedDate, 'PP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {!items || items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No protocol items to track</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.filter(item => item.isActive).map((item) => {
            const adherence = getItemAdherence(item.id);
            
            return (
              <Card key={item.id} data-testid={`card-adherence-${item.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        <Badge variant={item.type === 'drug' ? 'destructive' : item.type === 'supplement' ? 'default' : 'secondary'}>
                          {item.type}
                        </Badge>
                        {adherence && (
                          <Badge className={getStatusColor(adherence.status)}>
                            <span className="mr-1">{getStatusIcon(adherence.status)}</span>
                            {adherence.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        {item.dosage && (
                          <div>
                            <span className="font-medium">Dosage:</span> {item.dosage}
                          </div>
                        )}
                        {item.frequency && (
                          <div>
                            <span className="font-medium">Frequency:</span> {item.frequency}
                          </div>
                        )}
                        {item.timing && (
                          <div>
                            <span className="font-medium">Timing:</span> {item.timing}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant={adherence?.status === 'done' ? 'default' : 'outline'}
                        onClick={() => handleAdherenceChange(item.id, 'done')}
                        disabled={recordAdherenceMutation.isPending}
                        data-testid={`button-done-${item.id}`}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={adherence?.status === 'skipped' ? 'default' : 'outline'}
                        onClick={() => handleAdherenceChange(item.id, 'skipped')}
                        disabled={recordAdherenceMutation.isPending}
                        data-testid={`button-skipped-${item.id}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={adherence?.status === 'missed' ? 'destructive' : 'outline'}
                        onClick={() => handleAdherenceChange(item.id, 'missed')}
                        disabled={recordAdherenceMutation.isPending}
                        data-testid={`button-missed-${item.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
