import type { UploadedFile } from '../../types';

export interface DropZoneProps {
  onUploadStart: () => void;
  onUploadSuccess: (file: UploadedFile) => void;
  disabled?: boolean;
} 