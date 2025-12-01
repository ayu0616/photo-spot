import { DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface PostImageProps {
  src: string;
  alt: string;
}

export const PostImage = ({ src, alt }: PostImageProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain rounded-lg w-full max-h-[65svh] static! cursor-pointer"
        />
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-64px)]! max-h-[calc(100vh-64px)]! sm:max-w-[calc(100vw-96px)]! sm:max-h-[calc(100vh-96px)]! p-0 border-0 outline-4 sm:outline-8 outline-white [&>button]:bg-white overflow-hidden">
        <DialogTitle className="hidden">{alt}</DialogTitle>
        <div className="flex justify-center items-center max-w-[calc(100vw-64px)] sm:max-w-[calc(100vw-96px)] h-fit">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain static! max-w-[calc(100vw-64px)] max-h-[calc(100vh-64px)] sm:max-w-[calc(100vw-96px)] sm:max-h-[calc(100vh-96px)] mx-auto"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
