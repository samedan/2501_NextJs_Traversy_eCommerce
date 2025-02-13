"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateProfileSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ProfileForm = () => {
  const { data: session, update } = useSession();

  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? "", // if on the left is null use ''
      email: session?.user?.email ?? "",
    },
  });

  const { toast } = useToast();
  const onSubmit = () => {
    return;
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-2 space-y-1">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <>
                <FormLabel className="mb-0">Email</FormLabel>
                <FormItem className="w-full mt-0">
                  <FormControl>
                    <Input
                      disabled
                      placeholder="Email"
                      className="input-field"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </>
            )}
          />
          {/* name */}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <>
                <FormLabel className="mb-0">Name</FormLabel>
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      placeholder="Name"
                      className="input-field"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </>
            )}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="button col-span-2 w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Submitting..." : "Update profile"}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
