
import React, { useState } from 'react';
import { Upload, FileText, X, Check, Link, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { geminiService } from '@/services/geminiService';

interface UploadedFile {
  name: string;
  type: 'file' | 'url';
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  url?: string;
}

const DocumentUpload = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [pdfUrl, setPdfUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        type: 'file' as const,
        status: 'uploaded' as const
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully.`,
      });
    }
  };

  const handleUrlUpload = async () => {
    if (!pdfUrl.trim()) return;

    const fileName = pdfUrl.split('/').pop() || 'Document.pdf';
    const newFile: UploadedFile = {
      name: fileName,
      type: 'url',
      status: 'processing',
      url: pdfUrl
    };

    setUploadedFiles(prev => [...prev, newFile]);
    setIsProcessing(true);

    try {
      await geminiService.uploadPDFFromURL(pdfUrl, fileName);
      
      setUploadedFiles(prev => 
        prev.map(file => 
          file.url === pdfUrl 
            ? { ...file, status: 'processed' }
            : file
        )
      );

      toast({
        title: "PDF processed",
        description: `${fileName} has been processed successfully.`,
      });

      setPdfUrl('');
    } catch (error) {
      console.error('Error processing PDF:', error);
      
      setUploadedFiles(prev => 
        prev.map(file => 
          file.url === pdfUrl 
            ? { ...file, status: 'error' }
            : file
        )
      );

      toast({
        title: "Processing failed",
        description: "Failed to process the PDF. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploaded':
        return <FileText className="w-4 h-4 text-white/70" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
      case 'processed':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <FileText className="w-4 h-4 text-white/70" />;
    }
  };

  return (
    <>
      {/* Floating Upload Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 w-14 h-14 rounded-full aurora-secondary-bg shadow-2xl glow floating z-50"
      >
        <Upload className="w-6 h-6 text-white" />
      </Button>

      {/* Upload Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-8 max-w-md w-full glow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold aurora-text">Upload Documents</h3>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="w-8 h-8 p-0 rounded-full"
              >
                <X className="w-4 h-4 text-white" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center glass-dark">
                <Upload className="w-12 h-12 text-white/50 mx-auto mb-4" />
                <p className="text-white/70 mb-4">
                  Drag & drop PDF or DOC files here
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="aurora-bg text-white px-6 py-2 rounded-xl cursor-pointer inline-block glow-hover"
                >
                  Browse Files
                </label>
              </div>

              {/* URL Upload Section */}
              <div className="glass-dark rounded-2xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Link className="w-5 h-5 text-white/70" />
                  <h4 className="text-sm font-medium text-white/70">Upload from URL</h4>
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="Enter PDF URL..."
                    className="premium-glass border-white/20 text-white placeholder:text-white/50 rounded-xl flex-1"
                  />
                  <Button
                    onClick={handleUrlUpload}
                    disabled={!pdfUrl.trim() || isProcessing}
                    className="aurora-bg rounded-xl glow-hover"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white/70">Documents:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 glass-dark rounded-xl">
                      {getStatusIcon(file.status)}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-white truncate block">{file.name}</span>
                        <span className="text-xs text-white/50 capitalize">{file.status}</span>
                      </div>
                      <Button
                        onClick={() => removeFile(index)}
                        variant="ghost"
                        className="w-6 h-6 p-0"
                      >
                        <X className="w-3 h-3 text-white/50" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="flex-1 glass-dark text-white rounded-xl"
              >
                Close
              </Button>
              <Button 
                className="flex-1 aurora-bg text-white rounded-xl glow-hover"
                onClick={() => {
                  toast({
                    title: "Documents ready",
                    description: "You can now ask questions about the uploaded documents in the chat.",
                  });
                  setIsOpen(false);
                }}
              >
                Continue to Chat
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentUpload;
