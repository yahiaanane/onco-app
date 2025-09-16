import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPatientSchema } from "@shared/schema";
import type { InsertPatient } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

interface PatientFormProps {
  onSubmit: (data: InsertPatient) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<InsertPatient>;
}

const formSchema = insertPatientSchema.extend({
  height: insertPatientSchema.shape.height.optional(),
  weight: insertPatientSchema.shape.weight.optional(),
});

export default function PatientForm({ onSubmit, onCancel, isLoading, defaultValues }: PatientFormProps) {
  const [metastasisInput, setMetastasisInput] = useState("");
  const [metastasisLocations, setMetastasisLocations] = useState<string[]>(defaultValues?.metastasisLocations || []);

  const form = useForm<InsertPatient>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      sex: "male",
      height: null,
      weight: null,
      cancerType: "",
      cancerStage: "",
      diagnosisDate: "",
      metastasisLocations: [],
      notes: "",
      ...defaultValues,
    },
  });

  const addMetastasis = () => {
    if (metastasisInput.trim() && !metastasisLocations.includes(metastasisInput.trim())) {
      const newLocations = [...metastasisLocations, metastasisInput.trim()];
      setMetastasisLocations(newLocations);
      form.setValue('metastasisLocations', newLocations);
      setMetastasisInput("");
    }
  };

  const removeMetastasis = (location: string) => {
    const newLocations = metastasisLocations.filter(l => l !== location);
    setMetastasisLocations(newLocations);
    form.setValue('metastasisLocations', newLocations);
  };

  const handleSubmit = (data: InsertPatient) => {
    const formattedData = {
      ...data,
      metastasisLocations,
      height: data.height ? data.height.toString() : null,
      weight: data.weight ? data.weight.toString() : null,
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-patient-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-date-of-birth" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-sex">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} value={field.value || ""} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Physical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...field}
                        value={field.value || ''}
                        data-testid="input-height" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        {...field}
                        value={field.value || ''}
                        data-testid="input-weight" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cancer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cancerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancer Type *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-cancer-type" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cancerStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancer Stage *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-cancer-stage" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diagnosisDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-diagnosis-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4">
              <FormLabel>Metastasis Locations</FormLabel>
              <div className="flex gap-2 mt-2">
                <Input
                  value={metastasisInput}
                  onChange={(e) => setMetastasisInput(e.target.value)}
                  placeholder="Enter location..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMetastasis())}
                  data-testid="input-metastasis"
                />
                <Button type="button" onClick={addMetastasis} data-testid="button-add-metastasis">
                  Add
                </Button>
              </div>
              {metastasisLocations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {metastasisLocations.map((location, index) => (
                    <Badge key={index} variant="outline" className="pr-1">
                      {location}
                      <button
                        type="button"
                        onClick={() => removeMetastasis(location)}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        data-testid={`button-remove-metastasis-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value || ""}
                      rows={4}
                      placeholder="Additional notes or observations..."
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            data-testid="button-submit"
          >
            {isLoading ? "Saving..." : "Save Patient"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
