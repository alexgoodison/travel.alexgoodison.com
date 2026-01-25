"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LocationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  images: string[];
};

export default function LocationModal({
  isOpen,
  onClose,
  locationName,
  images,
}: LocationModalProps) {
  // Ensure we have exactly 3 image slots (pad with empty strings if needed)
  const displayImages = [...images, "", "", ""].slice(0, 3);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl! w-[90vw]! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl">{locationName}</DialogTitle>
        </DialogHeader>
        <div className="mt-8 pb-10 flex justify-center">
          {images.length > 0 ? (
            <div className="flex pr-4">
              {displayImages.map((image, index) => {
                const rotations = [-3, 3, -5];
                const zIndexes = [0, 10, 2];
                return (
                  <div key={index} className="flex-1 justify-center">
                    <img
                      alt={`${locationName} ${index + 1}`}
                      src={image}
                      className={`w-64 h-48 rounded-xl object-cover shadow-2xl bg-purple-500 border-[3px] border-white ${
                        index === 0 ? "" : "-ml-6"
                      }`}
                      style={{
                        transform: `rotate(${rotations[index]}deg)`,
                        zIndex: zIndexes[index],
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex pr-4 justify-center">
              {[0, 1, 2].map((index) => {
                const rotations = [-3, 5, -5];
                const zIndexes = [0, 10, 2];
                return (
                  <div
                    key={index}
                    className={`w-64 h-48 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center ${
                      index === 0 ? "" : "-ml-6"
                    }`}
                    style={{
                      transform: `rotate(${rotations[index]}deg)`,
                      zIndex: zIndexes[index],
                    }}
                  >
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
