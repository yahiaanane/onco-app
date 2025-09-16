import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProtocolTemplateSchema } from "@shared/schema";
import type { InsertProtocolTemplate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ProtocolFormProps {
  onSubmit: (data: InsertProtocolTemplate) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<InsertProtocolTemplate>;
}

export default function ProtocolForm({ onSubmit, onCancel, isLoading, defaultValues }: ProtocolFormProps) {
  const form = useForm<InsertProtocolTemplate>({
    resolver: zodResolver(insertProtocolTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      cancerType: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Protocol Name *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="e.g., Lung Cancer - Stage III Protocol"
                  data-testid="input-protocol-name" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cancerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cancer Type</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="e.g., Lung Cancer, Breast Cancer"
                  data-testid="input-cancer-type" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={4}
                  placeholder="Describe the protocol purpose and approach..."
                  data-testid="textarea-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {isLoading ? "Creating..." : "Create Protocol"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
