
import React, { useState } from 'react';
import { Upload, FileText, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DocumentUpload = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
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

            <div className="space-y-4">
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

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white/70">Uploaded Files:</h4>
                  {uploadedFiles.map((fileName, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 glass-dark rounded-xl">
                      <FileText className="w-4 h-4 text-white/70" />
                      <span className="text-sm text-white flex-1">{fileName}</span>
                      <Check className="w-4 h-4 text-green-400" />
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
                Cancel
              </Button>
              <Button className="flex-1 aurora-bg text-white rounded-xl glow-hover">
                Process Documents
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentUpload;
