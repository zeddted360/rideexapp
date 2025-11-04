import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { Models } from "appwrite";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Upload, X, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";
import Image from "next/image";
import { useAuth } from "@/context/authContext"; 
import { RootState, AppDispatch } from "@/state/store";
import { updateAsyncLogo, deleteAsyncLogo } from "@/state/categoryLogosSlice";

const imageSchema = z.object({
  image: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, "Image is required"),
});

type ImageFormData = z.infer<typeof imageSchema>;

type LogosState = {
  restaurant: Models.File | null;
  shops: Models.File | null;
  pharmacy: Models.File | null;
};

const CategoryLogoManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { logos, loading } = useSelector((state: RootState) => state.categoryLogos);
  const [updatingCategory, setUpdatingCategory] = useState<string | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<string | null>(null);
  const [isDeletingLogo, setIsDeletingLogo] = useState<boolean>(false);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const form = useForm<ImageFormData>({
    resolver: zodResolver(imageSchema),
    defaultValues: { image: undefined },
  });

  const bucketId = validateEnv().categoryLogosBucketId;
  const categories = ["restaurant", "shops", "pharmacy"] as const;

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleUploadLogo = async (category: string, data: ImageFormData) => {
    try {
      const file = data.image[0];
      if (!file) {
        toast.error("No file selected");
        return;
      }
      await dispatch(updateAsyncLogo({ category, file })).unwrap();
      toast.success(`${capitalize(category)} logo updated successfully`);
      form.reset();
      setUpdatingCategory(null);
    } catch (error: any) {
      toast.error(`Failed to update ${category} logo: ${error.message}`);
      console.error(error);
    }
  };

  const confirmDelete = async (category: string) => {
    setIsDeletingLogo(true);
    try {
      await dispatch(deleteAsyncLogo(category)).unwrap();
      toast.success(`${capitalize(category)} logo deleted successfully`);
    } catch (error: any) {
      toast.error(`Failed to delete ${category} logo: ${error.message}`);
      console.error(error);
    } finally {
      setDeleteCategory(null);
      setIsDeletingLogo(false);
    }
  };

  const handleDeleteLogo = (category: string) => {
    setDeleteCategory(category);
  };

  if (loading && !logos.restaurant && !logos.shops && !logos.pharmacy) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading category logos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full py-6 px-2 ">
        <div className="text-center mb-8">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Upload or update logos for your categories. Maximum of one logo per category.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ">
          {categories.map((category) => {
            const currentLogo = logos[category as keyof LogosState];
            const isUpdating = updatingCategory === category;
            
            return (
              <div 
                key={category} 
                className="group  relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border  border-gray-200 dark:border-gray-700"
              >
                <div className="p-2 space-y-4">
                  <h3 className="text-xl font-bold capitalize text-gray-900 dark:text-gray-100 text-center">
                    {category}
                  </h3>

                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-inner">
                    {currentLogo ? (
                      <Image
                        src={fileUrl(bucketId, currentLogo.$id)}
                        alt={`${category} logo`}
                        fill
                        className="object-cover"
                        sizes="300px"
                        quality={100}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No logo uploaded</p>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-3 pt-2">
                      <Dialog open={isUpdating} onOpenChange={(open) => !open && setUpdatingCategory(null)}>
                        <DialogTrigger asChild className="">
                          <Button
                            onClick={() => setUpdatingCategory(category)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all"
                            size="lg"
                          >
                            {currentLogo ? (
                              <>
                                <Pencil className="w-4 h-4 mr-2" />
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                              </>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                              {currentLogo ? "Update" : "Upload"} {capitalize(category)} 
                            </DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={form.handleSubmit((data) => handleUploadLogo(category, data))}
                            className="mt-6 space-y-6"
                          >
                            <div className="space-y-3">
                              <Label htmlFor={`${category}-image`} className="text-sm font-semibold">
                                Select Image
                              </Label>
                              <Input
                                id={`${category}-image`}
                                type="file"
                                accept="image/*"
                                {...form.register("image")}
                                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-900/30 dark:file:text-orange-400"
                              />
                              {form.formState.errors.image && (
                                <p className="text-red-500 text-sm">{form.formState.errors.image.message}</p>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                                size="lg"
                              >
                                {form.formState.isSubmitting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    {currentLogo ? "Update Logo" : "Upload Logo"}
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setUpdatingCategory(null)}
                                disabled={form.formState.isSubmitting}
                                size="lg"
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      
                      {currentLogo && (
                        <Button
                          variant="destructive"
                          size="lg"
                          onClick={() => handleDeleteLogo(category)}
                          className="flex-1 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Logo
            </DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete the {deleteCategory ? capitalize(deleteCategory) : ''} logo? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteCategory(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteCategory && confirmDelete(deleteCategory)}
              className="flex font-medium justify-center items-center"
            >
             {isDeletingLogo ? <Loader2 size={24}/> : "Delete"} 
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoryLogoManager;