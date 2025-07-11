import React from 'react';
import Modal from 'react-modal';
import { Copy, Download, X } from 'lucide-react';

interface JSONModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonConfig: string;
  contractName: string;
}

const JSONModal: React.FC<JSONModalProps> = ({ isOpen, onClose, jsonConfig, contractName }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonConfig);
    // You could add a toast notification here
  };

  const downloadJSON = () => {
    const blob = new Blob([jsonConfig], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contractName}_resvault_config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="json-modal"
      overlayClassName="json-modal-overlay"
      contentLabel="JSON Configuration"
    >
      <div className="modal-header">
        <h3>ResVault JSON Configuration</h3>
        <button onClick={onClose} className="close-button">
          <X size={20} />
        </button>
      </div>
      
      <div className="modal-content">
        <div className="json-display">
          <pre>{jsonConfig}</pre>
        </div>
        
        <div className="modal-actions">
          <button onClick={copyToClipboard} className="action-button copy-button">
            <Copy size={16} />
            Copy to Clipboard
          </button>
          <button onClick={downloadJSON} className="action-button download-button">
            <Download size={16} />
            Download JSON
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default JSONModal; 