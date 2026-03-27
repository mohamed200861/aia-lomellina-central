import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, FileText, Image as ImageIcon, Film, Music, Loader2 } from "lucide-react";

interface FileUploadProps {
  bucket: string;
  folder?: string;
  accept?: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
  label?: string;
  preview?: boolean;
}

export default function FileUpload({ bucket, folder = "", accept, onUpload, currentUrl, label = "Carica file", preview = true }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-primary" />;
    if (type.startsWith("video/")) return <Film className="h-8 w-8 text-primary" />;
    if (type.startsWith("audio/")) return <Music className="h-8 w-8 text-primary" />;
    return <FileText className="h-8 w-8 text-primary" />;
  };

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${folder ? folder + "/" : ""}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      setPreviewUrl(publicUrl);
      onUpload(publicUrl);
      toast.success("File caricato!");
    } catch (err: any) {
      toast.error(err.message || "Errore durante il caricamento");
    } finally {
      setUploading(false);
    }
  }, [bucket, folder, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const clearFile = () => {
    setPreviewUrl("");
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const isImage = previewUrl && /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(previewUrl);

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Caricamento in corso...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">Trascina qui o clicca per selezionare</span>
          </div>
        )}
      </div>

      {preview && previewUrl && (
        <div className="relative inline-block">
          {isImage ? (
            <img src={previewUrl} alt="Preview" className="h-24 w-auto rounded-lg border object-cover" />
          ) : (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm truncate max-w-[200px]">{previewUrl.split("/").pop()}</span>
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); clearFile(); }}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
