import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

export default function FileUpload({ id, onFileSelect, accept }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    onFileSelect?.(file || null);

    if (fileURL) {
      URL.revokeObjectURL(fileURL);
    }

    if (
      file &&
      (file.type === "application/pdf" || file.type.startsWith("image/"))
    ) {
      setFileURL(URL.createObjectURL(file));
    } else {
      setFileURL(null);
    }
  };

  const handleClear = () => {
    if (fileURL) {
      URL.revokeObjectURL(fileURL);
    }
    setSelectedFile(null);
    setFileURL(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect?.(null);
  };

  useEffect(() => {
    return () => {
      if (fileURL) {
        URL.revokeObjectURL(fileURL);
      }
    };
  }, [fileURL]);

  return (
    <div className="grid gap-2">
      <Label htmlFor={inputId} className="text-sm font-medium text-foreground">
        Supporting documents (optional)
      </Label>
      <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/30 p-4">
        <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 text-sm">
            <Upload className="h-4 w-4" />
            PDF or image files recommended. Max size 10 MB.
          </span>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              id={inputId}
              type="file"
              accept={accept || "application/pdf,image/*"}
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? "Change file" : "Choose file"}
            </Button>
            {selectedFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground"
              >
                <X className="mr-1 h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>
        </div>

        {selectedFile && (
          <div className="rounded-md border border-border/60 bg-background/80 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{selectedFile.name}</p>
            <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p className="capitalize">
              {selectedFile.type || "Unknown format"}
            </p>
          </div>
        )}

        {fileURL && selectedFile?.type === "application/pdf" && (
          <iframe
            title="Document preview"
            src={fileURL}
            className="h-64 w-full rounded-md border border-border/60"
          />
        )}

        {fileURL && selectedFile?.type?.startsWith("image/") && (
          <img
            src={fileURL}
            alt="Uploaded preview"
            className="h-64 w-full rounded-md border border-border/60 object-cover"
          />
        )}
      </div>
    </div>
  );
}
